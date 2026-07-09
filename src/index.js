const amqplib = require('amqplib');
const { ServerConfig  , Logger } = require('./config');

const express = require('express');
const app = express();
const apiRoutes = require('./routes');
const mailsender = require('./config/email-config');
const {EmailService} = require('./services');
app.use(express.json());
app.use(express.urlencoded({extended : true}));

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
                await EmailService.sendEmail("airlinenoti@gmail.com", recipient, object.subject, object.text);
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