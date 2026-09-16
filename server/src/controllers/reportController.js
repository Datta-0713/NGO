'use strict';
const News = require('../models/News');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

/** POST /api/news/:id/report — authenticated users can flag a story */
const reportNews = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news || news.status !== 'published') {
    return res.status(404).json({ success: false, message: 'News not found' });
  }

  // Prevent duplicate reports from same user
  const alreadyReported = news.reports?.some(
    (r) => r.user?.toString() === req.user._id.toString()
  );
  if (alreadyReported) {
    return sendSuccess(res, 200, null, 'Already reported');
  }

  await News.findByIdAndUpdate(req.params.id, {
    $push: {
      reports: {
        user: req.user._id,
        reason: req.body.reason || 'Inappropriate content',
        createdAt: new Date(),
      },
    },
  });

  sendSuccess(res, 200, null, 'Report submitted. Our team will review it.');
});

module.exports = { reportNews };
