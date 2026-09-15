'use strict';
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const AppError = require('../utils/AppError');
const { WELCOME_BONUS_CREDITS } = require('../config/env');

const awardCredits = async (userId, amount, reason, relatedNewsId = null) => {
  if (amount <= 0) throw new AppError('Amount must be positive', 400);

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { credits: amount } },
    { new: true }
  );

  await CreditTransaction.create({
    user: userId,
    amount,
    type: 'credit',
    reason,
    relatedNews: relatedNewsId
  });

  return user;
};

const deductCredits = async (userId, amount, reason) => {
  if (amount <= 0) throw new AppError('Amount must be positive', 400);

  const user = await User.findById(userId);
  if (user.credits < amount) {
    throw new AppError('Insufficient credits', 400);
  }

  user.credits -= amount;
  await user.save();

  await CreditTransaction.create({
    user: userId,
    amount,
    type: 'debit',
    reason
  });

  return user;
};

const getCreditHistory = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const transactions = await CreditTransaction.find({ user: userId })
    .populate('relatedNews', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await CreditTransaction.countDocuments({ user: userId });
  return { transactions, total, page, totalPages: Math.ceil(total / limit) };
};

const awardWelcomeBonus = async (userId) => {
  return await awardCredits(userId, WELCOME_BONUS_CREDITS, 'welcome_bonus');
};

module.exports = {
  awardCredits,
  deductCredits,
  getCreditHistory,
  awardWelcomeBonus
};
