'use strict';
const { body } = require('express-validator');

const createNewsValidation = [
  body('title').notEmpty().withMessage('Title is required').trim().isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description').notEmpty().withMessage('Description is required').isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('location').notEmpty().withMessage('Location is required').trim(),
  body('date').isISO8601().withMessage('Date must be a valid ISO8601 string'),
  body('category').isIn(['Community', 'Education', 'Environment', 'Health', 'Events']).withMessage('Invalid category')
];

const updateStatusValidation = [
  body('status').isIn(['published', 'rejected']).withMessage('Status must be published or rejected'),
  body('rejectionMessage').optional().trim()
];

module.exports = { createNewsValidation, updateStatusValidation };
