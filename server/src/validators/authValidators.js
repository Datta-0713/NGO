'use strict';
const { body } = require('express-validator');

const passwordValidation = body('password')
  .isString().withMessage('Password must be a string')
  .isLength({ min: 8, max: 72 }).withMessage('Password must be between 8 and 72 characters');

const registerValidation = [
  body('name').isString().withMessage('Name is required').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  passwordValidation,
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isString().notEmpty().isLength({ max: 72 }).withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
];

const resetPasswordValidation = [passwordValidation];

module.exports = { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation };
