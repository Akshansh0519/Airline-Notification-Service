const amqplib = require('amqplib');
const { ServerConfig  , Logger } = require('./config');

const express = require('express');
const app = express();
const apiRoutes = require('./routes');
const mailsender = require('./config/email-config');
const {EmailService} = require('./services');
app.use(express.json());
app.use(express.urlencoded({extended : true}));

const cors = require('cors');
app.use(cors({ origin: true, credentials: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token, x-idempotency-key');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});
app.get('/ping-cors', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ status: 'ACTIVE', service: 'Notification', time: new Date().toISOString() });
});

app.use('/api',apiRoutes);

let channel;
let connection;
async function connectToRabbitMQ(){
    try{
        connection = await amqplib.connect(ServerConfig.RABBITMQ_URL);
        
        connection.on('error', (err) => {
            console.error('RabbitMQ connection error in Notification Service:', err.message);
            channel = null;
        });
        connection.on('close', () => {
            console.warn('RabbitMQ connection closed by broker. Reconnecting in 5s...');
            channel = null;
            setTimeout(connectToRabbitMQ, 5000);
        });

        channel = await connection.createChannel();
        channel.on('error', (err) => {
            console.error('RabbitMQ channel error:', err.message);
            channel = null;
        });
        channel.on('close', () => {
            console.warn('RabbitMQ channel closed. Reconnecting in 5s...');
            channel = null;
            setTimeout(connectToRabbitMQ, 5000);
        });

        await channel.assertQueue(ServerConfig.RABBITMQ_QUEUE_NAME, { durable: true });
        console.log(`Connected to RabbitMQ & Consuming from [${ServerConfig.RABBITMQ_QUEUE_NAME}]`);
        channel.consume(ServerConfig.RABBITMQ_QUEUE_NAME, async (data) => {
            if (!data) return;
            try {
                const object = JSON.parse(data.content.toString());
                console.log('Received message from RabbitMQ:', object);
                const recipient = object.recepientEmail || object.recipientEmail || 'akshanshranjan007@gmail.com';
                const senderEmail = ServerConfig.GMAIL_EMAIL || 'akshanshranjan0519@gmail.com';
                
                // 12s safety timeout so RabbitMQ never gets stuck in Unacked: 1
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Email dispatch timed out after 12 seconds')), 12000)
                );
                await Promise.race([
                    EmailService.sendEmail(senderEmail, recipient, object.subject, object.text, object.html),
                    timeoutPromise
                ]);

                console.log(`Notification email sent successfully to ${recipient}`);
                channel.ack(data);
            } catch (err) {
                console.error('Error or timeout processing email from RabbitMQ queue:', err.message || err);
                channel.ack(data); // ack to prevent infinite redelivery loops if email fails
            }
        });
        return channel;
    }
    catch(error){
        console.error('Error occurred while connecting to RabbitMQ:', error.message);
        setTimeout(connectToRabbitMQ, 5000);
    }
}


app.listen(ServerConfig.PORT,async ()=>{
    console.log(`Server is running on port ${ServerConfig.PORT}`);
    
    if (process.env.RESEND_API_KEY || process.env.BREVO_API_KEY) {
        console.log('Ready to send emails via Port 443 HTTPS API (Resend/Brevo enabled)');
    } else {
        mailsender.verify().then(()=>{
            console.log('Ready to send emails via Nodemailer');
        }).catch((error)=>{
            console.warn('Notice: Nodemailer SMTP verification timed out (Render Free Tier blocks outbound SMTP). Please set RESEND_API_KEY or BREVO_API_KEY to send via Port 443 HTTPS.');
        });
    }
    await connectToRabbitMQ();
})


/*
the flow is 
/api routes  -> /v1 routes - > /airplanes routes ->
 controllers -> services(business logic) -> 
 repositories(generally they only interact with the DBs) -> models
*/

/*
// try{
    //     const response = await mailsender.sendMail({
    //         from: ServerConfig.GMAIL_EMAIL,
    //         to: 'akshanshranjan007@gmail.com',
    //         subject: 'Test Email',
    //         text: 'This is a test email sent from the Node.js application of Flight-service-webapp.'
    //     });
    //     console.log('Test email sent successfully:', response);
    // }
    // catch(error){
    //     console.error('Error occurred while sending test email:', error);
    // }
*/