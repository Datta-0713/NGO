'use strict';
const { body } = require('express-validator');

const updateSettingsValidation = [
  body('ngoName').optional().isString().trim().isLength({ min: 1, max: 120 }),
  body('tagline').optional().isString().trim().isLength({ max: 240 }),
  body('creditPerApproval').optional().isInt({ min: 1, max: 10000 }).toInt(),
  body('welcomeBonus').optional().isInt({ min: 0, max: 10000 }).toInt(),
];

module.exports = { updateSettingsValidation };
