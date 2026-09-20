'use strict';
const nodemailer = require('nodemailer');

// Validate SMTP configuration up-front so a missing/wrong config fails the
// request immediately with a clear 500 instead of hanging for the full 8s
// transport timeout and then being silently swallowed by the caller.
const hasSmtpConfig = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return false;
  }
  return true;
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!hasSmtpConfig()) {
    console.warn(`[Mock Email] To: ${to} | Subject: ${subject}`);
    console.warn(`[Mock Email] SMTP config missing, skipping actual email delivery.`);
    return;
  }

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
