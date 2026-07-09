const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    PORT: process.env.PORT || 3002,
    GMAIL_EMAIL: process.env.GMAIL_EMAIL,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD
};