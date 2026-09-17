'use strict';
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const creditService = require('../services/creditService');
const { withTransaction } = require('../utils/dbTransaction');
const { writeAuditLog } = require('../utils/audit');
const AppError = require('../utils/AppError');

const normalize = (page, limit) => ({
  page: Math.max(1, Number(page) || 1),
  limit: Math.min(100, Math.max(1, Number(limit) || 20)),
});

const getCreditHistory = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, await creditService.getCreditHistory(req.user._id, req.query.page, req.query.limit));
});

const getAllTransactions = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, await creditService.getAllCreditHistory(req.query.page, req.query.limit));
});

const adminAdjustCredits = asyncHandler(async (req, res) => {
  const { amount, reason, action } = req.body;
  const userId = req.params.userId || req.body.userId;
  if (!mongoose.isValidObjectId(userId)) throw new AppError('Invalid user id', 400);
  if (!['credit', 'debit'].includes(action)) throw new AppError('Action must be credit or debit', 400);
  if (!String(reason || '').trim() || String(reason).length > 500) throw new AppError('A reason of up to 500 characters is required', 400);

  const result = await withTransaction(async (session) => {
    const userBefore = await mongoose.model('User').findById(userId).session(session);
    if (!userBefore) throw new AppError('User not found', 404);
    const beforeBalance = userBefore.credits;
    const user = action === 'credit'
      ? await creditService.awardCredits(userId, amount, `Admin adjustment: ${reason}`, null, { session, performedBy: req.user._id })
      : await creditService.deductCredits(userId, amount, `Admin adjustment: ${reason}`, { session, performedBy: req.user._id });
    await writeAuditLog({
      admin: req.user._id,
      action: action === 'credit' ? 'credit_adjustment' : 'debit_adjustment',
      entityType: 'User', entityId: userId,
      before: { credits: beforeBalance }, after: { credits: user.credits, amount: Number(amount), action },
      reason, req, session,
    });
    return user;
  });

  sendSuccess(res, 200, { user: result }, `Credits ${action === 'credit' ? 'credited' : 'debited'} successfully`);
});

module.exports = { getCreditHistory, getAllTransactions, adminAdjustCredits };
