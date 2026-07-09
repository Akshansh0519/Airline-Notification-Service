const { ServerConfig  , Logger} = require('./config');

const express = require('express');
const app = express();
const apiRoutes = require('./routes');
const mailsender = require('./config/email-config');
app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.use('/api',apiRoutes);

app.listen(ServerConfig.PORT,async ()=>{
    console.log(`Server is running on port ${ServerConfig.PORT}`);
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