'use strict';
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const AppError = require('../utils/AppError');
const { getWelcomeBonus } = require('./settingsService');
const { withTransaction } = require('../utils/dbTransaction');

const positiveAmount = (amount) => {
  const value = Number(amount);
  if (!Number.isInteger(value) || value <= 0) throw new AppError('Amount must be a positive whole number', 400);
  return value;
};

const awardCredits = async (userId, amount, reason, relatedNewsId = null, options = {}) => {
  if (!options.session) {
    return withTransaction((session) => awardCredits(userId, amount, reason, relatedNewsId, { ...options, session }));
  }
  const value = positiveAmount(amount);
  const { session, dedupeKey, performedBy = null } = options;

  if (dedupeKey) {
    const existing = await CreditTransaction.findOne({ dedupeKey }).session(session);
    if (existing) return User.findById(userId).session(session);
  }

  const user = await User.findByIdAndUpdate(userId, { $inc: { credits: value } }, { new: true, session });
  if (!user) throw new AppError('User not found', 404);

  await CreditTransaction.create([{
    user: userId,
    amount: value,
    type: 'credit',
    reason,
    relatedNews: relatedNewsId,
    performedBy,
    dedupeKey,
  }], { session });
  return user;
};

const deductCredits = async (userId, amount, reason, options = {}) => {
  if (!options.session) {
    return withTransaction((session) => deductCredits(userId, amount, reason, { ...options, session }));
  }
  const value = positiveAmount(amount);
  const { session, performedBy = null, dedupeKey } = options;

  if (dedupeKey) {
    const existing = await CreditTransaction.findOne({ dedupeKey }).session(session);
    if (existing) return User.findById(userId).session(session);
  }

  const user = await User.findOneAndUpdate(
    { _id: userId, credits: { $gte: value } },
    { $inc: { credits: -value } },
    { new: true, session }
  );
  if (!user) {
    const exists = await User.exists({ _id: userId }).session(session);
    if (!exists) throw new AppError('User not found', 404);
    throw new AppError('Insufficient credits', 400);
  }

  await CreditTransaction.create([{
    user: userId,
    amount: value,
    type: 'debit',
    reason,
    performedBy,
    dedupeKey,
  }], { session });
  return user;
};

const getCreditHistory = async (userId, page = 1, limit = 20) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (safePage - 1) * safeLimit;
  const filter = { user: userId };
  const [transactions, total] = await Promise.all([
    CreditTransaction.find(filter).populate('relatedNews', 'title').sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    CreditTransaction.countDocuments(filter),
  ]);
  return { transactions, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
};

const getAllCreditHistory = async (page = 1, limit = 20) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (safePage - 1) * safeLimit;
  const [transactions, total, statsResult] = await Promise.all([
    CreditTransaction.find({}).populate('user', 'name email profilePhoto').populate('relatedNews', 'title').sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    CreditTransaction.countDocuments({}),
    CreditTransaction.aggregate([{ $group: { _id: '$type', total: { $sum: '$amount' } } }]),
  ]);
  const stats = {
    totalAwarded: statsResult.find((s) => s._id === 'credit')?.total || 0,
    totalDeducted: statsResult.find((s) => s._id === 'debit')?.total || 0,
  };
  return { transactions, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit), stats };
};

const awardWelcomeBonus = async (userId, options = {}) => {
  const amount = await getWelcomeBonus(options.session || null);
  return awardCredits(
    userId,
    amount,
    'welcome_bonus',
    null,
    { ...options, dedupeKey: options.dedupeKey || `welcome:${userId}` }
  );
};

module.exports = { awardCredits, deductCredits, getCreditHistory, getAllCreditHistory, awardWelcomeBonus };
