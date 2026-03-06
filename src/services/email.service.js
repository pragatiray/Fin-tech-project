require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const sendEmail = async (to,subject,text,html) => {   
  try{  
  const info = await transporter.sendMail({
    from: `Backend Ledger <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  });
    console.log('Message sent:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(to, name) {
  const subject = 'Welcome to Backend Ledger!';
  const text = `Hi ${name},\n\nThank you for registering with Backend Ledger. We're excited to have you on board!`;
  const html = `<p>Hi ${name},</p><p>Thank you for registering with <strong>Backend Ledger</strong>. We're excited to have you on board!</p><p>Best regards,<br/>The Backend Ledger Team</p>`;  

  await sendEmail(to, subject, text, html);
}

async function sendTransactionEmail(to, name, amount, toAccount) {
  const subject = `Transaction Alert: $${amount} transferred to account ${toAccount}`;
  const text = `Hi ${name},\n\nA transaction of $${amount} has been successfully transferred to account ${toAccount}.`;
  const html = `<p>Hi ${name},</p><p>A transaction of <strong>$${amount}</strong> has been successfully transferred to account <strong>${toAccount}</strong>.</p><p>Best regards,<br/>The Backend Ledger Team</p>`;
  await sendEmail(to, subject, text, html);
}
 

async function sendTransactionFailureEmail(to, name, amount, type, errorMessage) {
  const subject = `Transaction Failed: ${type} of $${amount}`;
  const text = `Hi ${name},\n\nWe attempted to process a ${type} transaction of $${amount} in your account, but it failed. Error: ${errorMessage}`;
  const html = `<p>Hi ${name},</p><p>We attempted to process a <strong>${type}</strong> transaction of <strong>$${amount}</strong> in your account, but it failed.</p><p>Error: ${errorMessage}</p><p>Best regards,<br/>The Backend Ledger Team</p>`;
  await sendEmail(to, subject, text, html);
}

module.exports = {
                 sendEmail, 
                 sendRegistrationEmail,
                 sendTransactionEmail,
                 sendTransactionFailureEmail
};