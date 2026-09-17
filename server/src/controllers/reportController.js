'use strict';
const News = require('../models/News');
const Report = require('../models/Report');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { writeAuditLog } = require('../utils/audit');

const reportNews = asyncHandler(async (req, res) => {
  const news = await News.exists({ _id: req.params.id, status: 'published', deletedAt: null });
  if (!news) throw new AppError('News not found', 404);
  const reason = String(req.body.reason || 'Inappropriate content').trim().slice(0, 500);
  try {
    await Report.create({ news: req.params.id, reportedBy: req.user._id, reason });
  } catch (error) {
    if (error.code === 11000) return sendSuccess(res, 200, null, 'Already reported');
    throw error;
  }
  sendSuccess(res, 201, null, 'Report submitted. Our team will review it.');
});

const getReports = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const filter = {};
  if (['open', 'reviewed', 'dismissed', 'actioned'].includes(req.query.status)) filter.status = req.query.status;
  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('news', 'title status')
      .populate('reportedBy', 'name email profilePhoto')
      .populate('reviewedBy', 'name'),
    Report.countDocuments(filter),
  ]);
  sendSuccess(res, 200, { reports, total, page, limit, totalPages: Math.ceil(total / limit) });
});

const resolveReport = asyncHandler(async (req, res) => {
  const allowed = ['reviewed', 'dismissed', 'actioned'];
  if (!allowed.includes(req.body.status)) throw new AppError('Invalid report resolution', 400);
  const report = await Report.findByIdAndUpdate(req.params.id, {
    status: req.body.status,
    resolution: String(req.body.resolution || '').trim().slice(0, 500),
    reviewedBy: req.user._id,
    reviewedAt: new Date(),
  }, { new: true });
  if (!report) throw new AppError('Report not found', 404);
  await writeAuditLog({
    admin: req.user._id, action: 'report_resolved', entityType: 'Report', entityId: report._id,
    after: { status: report.status, resolution: report.resolution }, reason: report.resolution, req,
  });
  sendSuccess(res, 200, { report }, 'Report updated');
});

module.exports = { reportNews, getReports, resolveReport };
