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
async function connectToRabbitMQ(){
    try{
        const connection = await amqplib.connect(ServerConfig.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(ServerConfig.RABBITMQ_QUEUE_NAME);
        console.log('Connected to RabbitMQ');
        channel.consume(ServerConfig.RABBITMQ_QUEUE_NAME, async (data) => {
            if (!data) return;
            try {
                const object = JSON.parse(data.content.toString());
                console.log('Received message from RabbitMQ:', object);
                const recipient = object.recepientEmail || object.recipientEmail || 'akshanshranjan007@gmail.com';
                const senderEmail = ServerConfig.GMAIL_EMAIL || 'akshanshranjan0519@gmail.com';
                await EmailService.sendEmail(senderEmail, recipient, object.subject, object.text, object.html);
                console.log(`Notification email sent successfully to ${recipient}`);
                channel.ack(data);
            } catch (err) {
                console.error('Error processing email from RabbitMQ queue:', err);
                channel.ack(data); // ack to prevent infinite redelivery loops if email fails
            }
        });
        return channel;
    }
    catch(error){
        console.error('Error occurred while connecting to RabbitMQ:', error);
    }
}


app.listen(ServerConfig.PORT,async ()=>{
    console.log(`Server is running on port ${ServerConfig.PORT}`);
    
    mailsender.verify().then(()=>{
        console.log('Ready to send emails');
    }).catch((error)=>{
        console.error('Error occurred while verifying email sender:', error);
    });
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