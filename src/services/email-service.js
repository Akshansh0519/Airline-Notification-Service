const { TicketRepository } = require('../repositories');

const ticketRepository = new TicketRepository();

const { MAILER } = require('../config');

async function sendEmail(mailFrom, mailTo, subject, text, html){
    const mailOptions = {
        from: mailFrom,
        to: mailTo,
        subject: subject,
        text: text
    };
    if (html) {
        mailOptions.html = html;
    }

    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await MAILER.sendMail(mailOptions);
            console.log(`Email delivered on attempt ${attempt} to ${mailTo}`);
            return response;
        } catch (error) {
            lastError = error;
            console.warn(`Attempt ${attempt} to send email failed: ${error.message}. Retrying...`);
            if (attempt < 3) {
                await new Promise(res => setTimeout(res, 2000 * attempt));
            }
        }
    }
    throw lastError;
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