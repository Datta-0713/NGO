'use strict';
const News = require('../models/News');
const ContributorHighlight = require('../models/ContributorHighlight');
const HighlightSeen = require('../models/HighlightSeen');

const calculateTopContributor = async (periodStart, periodEnd, period) => {
  const result = await News.aggregate([
    { $match: { status: 'published', deletedAt: null, publishedAt: { $gte: periodStart, $lte: periodEnd }, submittedBy: { $exists: true, $ne: null } } },
    { $group: { _id: '$submittedBy', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: 1 },
  ]);
  if (!result.length) return null;
  const { _id: userId, count } = result[0];
  return ContributorHighlight.findOneAndUpdate(
    { period, periodStart },
    { $setOnInsert: { period, user: userId, count, periodStart, periodEnd } },
    { upsert: true, new: true }
  );
};

const calculateWeeklyTopContributor = async () => {
  const now = new Date();
  const day = now.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  const currentMonday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday));
  const start = new Date(currentMonday);
  start.setUTCDate(start.getUTCDate() - 7);
  const end = new Date(currentMonday.getTime() - 1);
  return calculateTopContributor(start, end, 'weekly');
};

const calculateMonthlyTopContributor = async () => {
  const now = new Date();
  const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const end = new Date(currentMonthStart.getTime() - 1);
  return calculateTopContributor(start, end, 'monthly');
};

const getUnseenHighlightForUser = async (userId) => {
  const highlights = await ContributorHighlight.find({}).sort({ createdAt: -1 }).limit(20).populate('user', 'name profilePhoto');
  for (const highlight of highlights) {
    try {
      await HighlightSeen.create({ highlight: highlight._id, user: userId });
      return highlight;
    } catch (error) {
      if (error.code === 11000) continue;
      throw error;
    }
  }
  return null;
};

module.exports = { calculateWeeklyTopContributor, calculateMonthlyTopContributor, getUnseenHighlightForUser };
