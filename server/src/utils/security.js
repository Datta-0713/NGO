'use strict';
const crypto = require('crypto');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const createOpaqueToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { hashToken, createOpaqueToken, escapeRegex };
