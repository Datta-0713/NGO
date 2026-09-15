'use strict';
const { body } = require('express-validator');

const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('bio').optional().trim().isLength({ max: 300 }).withMessage('Bio cannot exceed 300 characters'),
  body('location').optional().trim()
];

module.exports = { updateProfileValidation };
