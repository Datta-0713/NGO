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

const getAllCreditHistory = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const transactions = await CreditTransaction.find({})
    .populate('user', 'name email profilePhoto')
    .populate('relatedNews', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await CreditTransaction.countDocuments({});
  
  // Aggregate stats
  const statsResult = await CreditTransaction.aggregate([
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" }
      }
    }
  ]);
  
  const stats = {
    totalAwarded: statsResult.find(s => s._id === 'credit')?.total || 0,
    totalDeducted: statsResult.find(s => s._id === 'debit')?.total || 0,
  };

  return { transactions, total, page, totalPages: Math.ceil(total / limit), stats };
};

const awardWelcomeBonus = async (userId) => {
  return await awardCredits(userId, WELCOME_BONUS_CREDITS, 'welcome_bonus');
};

module.exports = {
  awardCredits,
  deductCredits,
  getCreditHistory,
  getAllCreditHistory,
  awardWelcomeBonus
};
