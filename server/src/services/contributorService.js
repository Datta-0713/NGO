'use strict';
const News = require('../models/News');
const ContributorHighlight = require('../models/ContributorHighlight');
const HighlightSeen = require('../models/HighlightSeen');

/**
 * Calculates the top contributor for a given period using an aggregation pipeline.
 * @param {Date} periodStart
 * @param {Date} periodEnd
 * @param {string} period
 * @returns {Promise<Object|null>}
 */
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

/**
 * Calculates the weekly top contributor.
 * @returns {Promise<Object|null>}
 */
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

/**
 * Calculates the monthly top contributor.
 * @returns {Promise<Object|null>}
 */
const calculateMonthlyTopContributor = async () => {
  const now = new Date();
  const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const end = new Date(currentMonthStart.getTime() - 1);
  return calculateTopContributor(start, end, 'monthly');
};

/**
 * Retrieves the most recent ContributorHighlight that the user has NOT yet marked as seen.
 *
 * This is a READ-ONLY operation. It does NOT write any data.
 * Callers MUST explicitly call markHighlightSeen(highlightId, userId) after the user
 * views or dismisses the highlight to record that it has been seen.
 *
 * @param {string} userId - The user's ID.
 * @returns {Promise<Object|null>} The unseen highlight, or null if all have been seen.
 */
const getUnseenHighlightForUser = async (userId) => {
  const highlights = await ContributorHighlight.find({}).sort({ createdAt: -1 }).limit(20).populate('user', 'name profilePhoto');
  const seenRecords = await HighlightSeen.find({ user: userId }).select('highlight').lean();
  const seenHighlightIds = new Set(seenRecords.map((r) => r.highlight.toString()));
  for (const highlight of highlights) {
    if (!seenHighlightIds.has(highlight._id.toString())) {
      return highlight;
    }
  }
  return null;
};

/**
 * Marks a highlight as seen for a user. Idempotent: if the record already exists,
 * the existing record is returned instead of throwing.
 *
 * @param {string} highlightId - The highlight's ID.
 * @param {string} userId - The user's ID.
 * @returns {Promise<Object>} The HighlightSeen document.
 */
const markHighlightSeen = async (highlightId, userId) => {
  try {
    return await HighlightSeen.create({ highlight: highlightId, user: userId });
  } catch (error) {
    if (error.code === 11000) {
      return HighlightSeen.findOne({ highlight: highlightId, user: userId });
    }
    throw error;
  }
};

module.exports = { calculateWeeklyTopContributor, calculateMonthlyTopContributor, getUnseenHighlightForUser, markHighlightSeen };