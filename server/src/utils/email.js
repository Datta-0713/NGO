'use strict';
const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Hard timeout so a missing/wrong SMTP config fails fast
    // instead of hanging the HTTP request for minutes
    connectionTimeout: 8000,  // 8s to connect
    greetingTimeout:   5000,  // 5s for EHLO
    socketTimeout:     10000, // 10s for data transfer
  });

  const mailOptions = {
    from: `"Asian News Bureau" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
