'use strict';

const nodemailer = require('nodemailer');
const {logger} = require('./utilities/logger');

// stored in `.env` -- never store passwords, api keys
// etc. inside source code
const {SMTP_URL} = process.env;



const sendEmail = (emailData, smtpUrl=SMTP_URL) => {
  const transporter = nodemailer.createTransport(SMTP_URL);
  logger.info(`Attempting to send email from ${emailData.from}`);
  return transporter
    .sendMail(emailData)
    .then(info => console.log(`Message sent: ${info.response}`))
    .catch(err => console.log(`Problem sending email: ${err}`));
}


module.exports = {sendEmail};
