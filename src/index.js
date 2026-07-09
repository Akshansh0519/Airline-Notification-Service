const { ServerConfig  , Logger } = require('./config');

const express = require('express');
const app = express();
const apiRoutes = require('./routes');
const mailsender = require('./config/email-config');
const {EmailService} = require('./services');
app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.use('/api',apiRoutes);

async function connectToRabbitMQ(){
    try{
        const connection = await amqplib.connect(ServerConfig.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue(ServerConfig.RABBITMQ_QUEUE_NAME);
        console.log('Connected to RabbitMQ');
        channel.consume(ServerConfig.RABBITMQ_QUEUE_NAME, async (data) => {
            const object = JSON.parse(data.content.toString());
            await EmailService.sendEmail("airlineNotification@gmail.com",object.recepientEmail,object.subject,object.text);
            channel.ack(data); // Acknowledging the message after processing as its a TCP connection and we need to acknowledge the message after processing it so that it can be removed from the queue and not be re-delivered.
        });
        return channel;
    }
    catch(error){
        console.error('Error occurred while connecting to RabbitMQ:', error);
        throw error;
    }
}


app.listen(ServerConfig.PORT,async ()=>{
    console.log(`Server is running on port ${ServerConfig.PORT}`);
    
    mailsender.verify().then(()=>{
        console.log('Ready to send emails');
    }).catch((error)=>{
        console.error('Error occurred while verifying email sender:', error);
    });
    //Logger.info(`Server is running on port ${ServerConfig.PORT}`,{});/*ctrl+s to save and check the logs*/ 
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