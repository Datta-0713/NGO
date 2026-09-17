'use strict';
const { body, query } = require('express-validator');

const CATEGORIES = ['Community', 'Education', 'Environment', 'Health', 'Events'];

const createNewsValidation = [
  body('title').isString().withMessage('Title is required').trim().isLength({ min: 10, max: 200 }).withMessage('Title must be between 10 and 200 characters'),
  body('description').isString().withMessage('Description is required').trim().isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters'),
  body('location').isString().withMessage('Location is required').trim().isLength({ min: 2, max: 150 }).withMessage('Location is invalid'),
  body('date').isISO8601().withMessage('Date must be a valid ISO8601 string').toDate(),
  body('category').isIn(CATEGORIES).withMessage('Invalid category'),
  body('sourceUrl').optional({ values: 'falsy' }).isURL({ require_protocol: true }).withMessage('Source URL must be a valid URL'),
  body('geo.lat').optional().isFloat({ min: -90, max: 90 }).toFloat(),
  body('geo.lng').optional().isFloat({ min: -180, max: 180 }).toFloat(),
];

const moderationMessageValidation = [
  body('rejectionMessage').optional().isString().trim().isLength({ max: 1000 }),
];

const listValidation = [
  query('page').optional().isInt({ min: 1, max: 100000 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().trim().isLength({ max: 100 }),
];

module.exports = { createNewsValidation, moderationMessageValidation, listValidation, CATEGORIES };
