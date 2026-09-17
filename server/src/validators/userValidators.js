'use strict';
const { body } = require('express-validator');

const updateProfileValidation = [
  body('name').optional().isString().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('bio').optional().isString().trim().isLength({ max: 300 }).withMessage('Bio cannot exceed 300 characters'),
  body('location').optional().isString().trim().isLength({ max: 150 }).withMessage('Location cannot exceed 150 characters'),
];

const pushTokenValidation = [
  body('pushToken').isString().trim().isLength({ min: 10, max: 500 }).withMessage('A valid push token is required'),
  body('platform').optional().isIn(['ios', 'android', 'web', 'unknown']),
  body('deviceId').optional().isString().trim().isLength({ max: 200 }),
  body('appVersion').optional().isString().trim().isLength({ max: 50 }),
];

module.exports = { updateProfileValidation, pushTokenValidation };
