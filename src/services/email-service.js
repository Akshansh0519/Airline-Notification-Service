const { TicketRepository } = require('../repositories');

const ticketRepository = new TicketRepository();

const { MAILER } = require('../config');

async function sendEmail(mailFrom, mailTo, subject, text, html){
    // 1. Check if Resend API Key is set (Bypasses Render SMTP block over HTTPS Port 443)
    if (process.env.RESEND_API_KEY) {
        try {
            console.log(`Sending email via Resend HTTPS API (Port 443) to ${mailTo}...`);
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: process.env.RESEND_FROM_EMAIL || 'SkyElite <onboarding@resend.dev>',
                    to: [mailTo],
                    subject: subject,
                    text: text,
                    html: html || text
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || JSON.stringify(data));
            console.log(`Email successfully delivered via Resend API (ID: ${data.id}) to ${mailTo}`);
            return data;
        } catch (resendErr) {
            console.error('Resend API failed, falling back to next available method:', resendErr.message);
        }
    }

    // 2. Check if Brevo (Sendinblue) API Key is set (Bypasses Render SMTP block over HTTPS Port 443)
    if (process.env.BREVO_API_KEY) {
        try {
            console.log(`Sending email via Brevo HTTPS API (Port 443) to ${mailTo}...`);
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: 'SkyElite Airlines', email: mailFrom || 'akshanshranjan0519@gmail.com' },
                    to: [{ email: mailTo }],
                    subject: subject,
                    textContent: text,
                    htmlContent: html || text
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || JSON.stringify(data));
            console.log(`Email successfully delivered via Brevo API (MessageID: ${data.messageId}) to ${mailTo}`);
            return data;
        } catch (brevoErr) {
            console.error('Brevo API failed, falling back to Nodemailer:', brevoErr.message);
        }
    }

    // 3. Standard Nodemailer SMTP fallback
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
            console.log(`Email delivered via Nodemailer on attempt ${attempt} to ${mailTo}`);
            return response;
        } catch (error) {
            lastError = error;
            console.warn(`Attempt ${attempt} via Nodemailer failed: ${error.message}. Retrying...`);
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