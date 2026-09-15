'use strict';
const User = require('../models/User');
const News = require('../models/News');
const ContributorHighlight = require('../models/ContributorHighlight');

const calculateTopContributor = async (periodStart, periodEnd, period) => {
  const result = await News.aggregate([
    { 
      $match: { 
        status: 'published',
        publishedAt: { $gte: periodStart, $lte: periodEnd },
        submittedBy: { $exists: true, $ne: null }
      } 
    },
    { 
      $group: { 
        _id: '$submittedBy', 
        count: { $sum: 1 } 
      } 
    },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);

  if (result.length > 0) {
    const { _id: userId, count } = result[0];
    await ContributorHighlight.create({
      period,
      user: userId,
      count,
      periodStart,
      periodEnd
    });
  }
};

const calculateWeeklyTopContributor = async () => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 7);
  await calculateTopContributor(start, end, 'weekly');
};

const calculateMonthlyTopContributor = async () => {
  const end = new Date();
  const start = new Date(end);
  start.setMonth(end.getMonth() - 1);
  await calculateTopContributor(start, end, 'monthly');
};

const getUnshownHighlight = async () => {
  return await ContributorHighlight.findOne({ shownToUsers: false })
    .sort({ createdAt: -1 })
    .populate('user', 'name profilePhoto');
};

const markHighlightShown = async (highlightId) => {
  return await ContributorHighlight.findByIdAndUpdate(highlightId, { shownToUsers: true });
};

module.exports = {
  calculateWeeklyTopContributor,
  calculateMonthlyTopContributor,
  getUnshownHighlight,
  markHighlightShown
};
