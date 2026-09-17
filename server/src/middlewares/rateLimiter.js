'use strict';
const rateLimit = require('express-rate-limit');

const base = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ success: false, data: null, message: 'Too many requests. Please try again later.' }),
};

const authLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: 10 });
const apiLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: 300 });
const mutationLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: 100 });

module.exports = { authLimiter, apiLimiter, mutationLimiter };
