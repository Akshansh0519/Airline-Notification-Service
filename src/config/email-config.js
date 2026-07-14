const nodemailer = require('nodemailer');

const { GMAIL_EMAIL, GMAIL_PASSWORD } = require('./server-config');

const mailSender = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: {
    user: GMAIL_EMAIL,
    pass: GMAIL_PASSWORD,
  },
});

module.exports = mailSender;