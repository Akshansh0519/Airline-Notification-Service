const { TicketRepository } = require('../repositories');

const ticketRepository = new TicketRepository();

const { MAILER } = require('../config');

async function sendEmail(mailFrom, mailTo, subject, text, html){
    try{
        const mailOptions = {
            from: mailFrom,
            to: mailTo,
            subject: subject,
            text: text
        };
        if (html) {
            mailOptions.html = html;
        }
        const response = await MAILER.sendMail(mailOptions);
        return response;
    }
    catch(error){
        throw error;
    }
}

async function createTicket(data){
    try{
        const response = await ticketRepository.create(data);
        return response;
    }
    catch(error){
        throw error;
    }
}

async function getPendingEmails(){
    try{
        const response = await ticketRepository.getPendingTickets();
        return response;
    }catch(error){
        throw error;
    }
}
module.exports = {
    sendEmail,
    createTicket,
    getPendingEmails   
}