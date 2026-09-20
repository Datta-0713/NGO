'use strict';
const nodemailer = require('nodemailer');

// Validate SMTP configuration up-front so a missing/wrong config fails the
// request immediately with a clear 500 instead of hanging for the full 8s
// transport timeout and then being silently swallowed by the caller.
const validateSmtpConfig = () => {
  const missing = [];
  if (!process.env.SMTP_HOST) missing.push('SMTP_HOST');
  if (!process.env.SMTP_PORT) missing.push('SMTP_PORT');
  if (!process.env.SMTP_USER) missing.push('SMTP_USER');
  if (!process.env.SMTP_PASS) missing.push('SMTP_PASS');
  if (missing.length) {
    throw new Error(`SMTP is not configured. Missing environment variables: ${missing.join(', ')}. See .env.example for setup instructions.`);
  }
};

const sendEmail = async ({ to, subject, text, html }) => {
  validateSmtpConfig();

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
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
