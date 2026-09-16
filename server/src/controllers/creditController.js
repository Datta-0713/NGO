'use strict';
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const creditService = require('../services/creditService');

const getCreditHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  
  const result = await creditService.getCreditHistory(req.user._id, page, limit);
  sendSuccess(res, 200, result);
});

const getAllTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  
  const result = await creditService.getAllCreditHistory(page, limit);
  sendSuccess(res, 200, result);
});

const adminAdjustCredits = asyncHandler(async (req, res) => {
  const { userId, amount, reason, action } = req.body; // action: 'credit' or 'debit'
  
  let user;
  if (action === 'credit') {
    user = await creditService.awardCredits(userId, amount, reason);
  } else if (action === 'debit') {
    user = await creditService.deductCredits(userId, amount, reason);
  }
  
  sendSuccess(res, 200, { user }, `Credits ${action}ed successfully`);
});

module.exports = { getCreditHistory, getAllTransactions, adminAdjustCredits };
