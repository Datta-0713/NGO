'use strict';
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { success: false, data: null, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { success: false, data: null, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

module.exports = { authLimiter, apiLimiter };
