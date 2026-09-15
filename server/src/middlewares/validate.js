'use strict';
const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Runs after express-validator chains. Collects errors and throws AppError(400)
 * with a formatted message if any validation failed.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => `${e.path}: ${e.msg}`).join(', ');
    throw new AppError(messages, 400);
  }
  next();
};

module.exports = validate;
