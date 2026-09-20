'use strict';
const mongoose = require('mongoose');
const News = require('../models/News');
const User = require('../models/User');
const NewsLike = require('../models/NewsLike');
const Comment = require('../models/Comment');
const SavedStory = require('../models/SavedStory');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const CreditTransaction = require('../models/CreditTransaction');
const SubmissionRevision = require('../models/SubmissionRevision');
const AdminAuditLog = require('../models/AdminAuditLog');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { writeAuditLog } = require('../utils/audit');
const { withTransaction } = require('../utils/dbTransaction');
const { deleteCloudinaryAssetsStrict } = require('../middlewares/upload');
const { normalizeMedia } = require('../utils/media');
const { escapeRegex } = require('../utils/security');

const pagination = (page, limit, fallback = 20) => ({
  page: Math.max(1, Number(page) || 1),
  limit: Math.min(100, Math.max(1, Number(limit) || fallback)),
});

const validateNewsId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid news id', 400);
  return id;
};

const populateNews = (query) => query
  .populate('submittedBy', 'name email profilePhoto bio location role credits storiesCount likesReceived isActive createdAt')
  .populate('reviewedBy', 'name email profilePhoto')
  .populate('claimedBy', 'name email profilePhoto');

const getAdminNews = asyncHandler(async (req, res) => {
  const { page, limit } = pagination(req.query.page, req.query.limit, 20);
  const view = ['active', 'archived', 'all'].includes(req.query.view) ? req.query.view : 'active';
  const filter = {};
  if (view === 'active') filter.deletedAt = null;
  if (view === 'archived') {
    filter.status = 'archived';
    filter.deletedAt = { $ne: null };
  }
  if (req.query.status && ['pending', 'under_review', 'needs_changes', 'published', 'rejected', 'archived'].includes(req.query.status)) {
    filter.status = req.query.status;
  }
  if (req.query.category && ['Community', 'Education', 'Environment', 'Health', 'Events'].includes(req.query.category)) {
    filter.category = req.query.category;
  }
  if (req.query.search?.trim()) {
    const regex = new RegExp(escapeRegex(req.query.search.trim().slice(0, 100)), 'i');
    const authors = await User.find({ name: regex }).select('_id').limit(100);
    filter.$or = [
      { title: regex }, { description: regex }, { location: regex },
      ...(authors.length ? [{ submittedBy: { $in: authors.map((a) => a._id) } }] : []),
    ];
  }

  const [news, total] = await Promise.all([
    populateNews(News.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit)),
    News.countDocuments(filter),
  ]);

  sendSuccess(res, 200, {
    news: news.map((item) => {
      const value = item.toJSON();
      value.media = normalizeMedia(item.media);
      return value;
    }),
    total, page, limit, totalPages: Math.ceil(total / limit), view,
  });
});

const getAdminNewsById = asyncHandler(async (req, res) => {
  const id = validateNewsId(req.params.id);
  const news = await populateNews(News.findById(id).select('+adminNotes +evidenceNotes'));
  if (!news) throw new AppError('News not found', 404);

  const [comments, revisions, reports, notificationsCount, savedCount, likesCount, auditLogs] = await Promise.all([
    Comment.find({ news: id }).sort({ createdAt: -1 }).populate('user', 'name email profilePhoto').limit(200),
    SubmissionRevision.find({ submission: id }).sort({ revisionNumber: -1 }).limit(50).populate('author', 'name email profilePhoto'),
    Report.find({ news: id }).sort({ createdAt: -1 }).limit(100).populate('reportedBy', 'name email profilePhoto').populate('reviewedBy', 'name'),
    Notification.countDocuments({ 'relatedEntity.entityId': id, 'relatedEntity.entityType': 'News' }),
    SavedStory.countDocuments({ news: id }),
    NewsLike.countDocuments({ news: id }),
    AdminAuditLog.find({ entityType: 'News', entityId: id }).sort({ createdAt: -1 }).limit(50).populate('admin', 'name email'),
  ]);

  const value = news.toJSON();
  value.adminNotes = news.adminNotes || '';
  value.evidenceNotes = news.evidenceNotes || '';
  value.media = normalizeMedia(news.media);
  sendSuccess(res, 200, {
    news: value,
    comments,
    revisions,
    reports,
    auditLogs,
    engagement: { likes: likesCount, comments: comments.length, saves: savedCount, views: news.views || 0 },
    notificationsCount,
  });
});

const updateAdminNews = asyncHandler(async (req, res) => {
  const id = validateNewsId(req.params.id);
  const uploaded = req.uploadedMedia || [];
  try {
    const updated = await withTransaction(async (session) => {
      const news = await News.findById(id).select('+adminNotes +evidenceNotes').session(session);
      if (!news) throw new AppError('News not found', 404);

      const fields = ['title', 'description', 'location', 'sourceUrl'];
      fields.forEach((field) => {
        if (req.body[field] !== undefined) {
          const value = String(req.body[field]).trim();
          if (field === 'title' && (value.length < 10 || value.length > 200)) throw new AppError('Title must be between 10 and 200 characters', 400);
          if (field === 'description' && (value.length < 20 || value.length > 5000)) throw new AppError('Description must be between 20 and 5000 characters', 400);
          if (field === 'location' && (!value || value.length > 150)) throw new AppError('Location is required and must be at most 150 characters', 400);
          news[field] = value;
        }
      });
      if (req.body.category !== undefined) {
        const category = String(req.body.category);
        if (!['Community', 'Education', 'Environment', 'Health', 'Events'].includes(category)) throw new AppError('Invalid category', 400);
        news.category = category;
      }
      if (req.body.date !== undefined) {
        const date = new Date(req.body.date);
        if (Number.isNaN(date.getTime())) throw new AppError('Invalid news date', 400);
        news.date = date;
      }
      if (req.body.geo !== undefined) {
        try {
          const geo = typeof req.body.geo === 'string' ? JSON.parse(req.body.geo) : req.body.geo;
          if (geo == null) news.geo = undefined;
          else news.geo = geo;
        } catch { throw new AppError('Invalid geo data', 400); }
      }
      const before = news.toJSON();
      if (uploaded.length) news.media = [...news.media, ...uploaded];
      await news.save({ session, validateBeforeSave: true });
      await writeAuditLog({
        admin: req.user._id, action: 'news_updated', entityType: 'News', entityId: news._id,
        before, after: news.toJSON(), req, session,
      });
      return news;
    });
    const value = updated.toJSON();
    value.media = normalizeMedia(updated.media);
    sendSuccess(res, 200, { news: value }, 'News updated successfully');
  } catch (error) {
    await deleteCloudinaryAssetsStrictSafe(uploaded);
    throw error;
  }
});

const deleteCloudinaryAssetsStrictSafe = async (assets) => {
  if (!assets?.length) return;
  try { await deleteCloudinaryAssetsStrict(assets); }
  catch (error) { throw error; }
};

const archiveNews = asyncHandler(async (req, res) => {
  const id = validateNewsId(req.params.id);
  const news = await withTransaction(async (session) => {
    const current = await News.findOne({ _id: id, deletedAt: null }).session(session);
    if (!current) throw new AppError('News not found or already archived', 404);
    const before = { status: current.status, deletedAt: current.deletedAt };
    current.archivedFromStatus = current.status === 'archived' ? (current.archivedFromStatus || 'published') : current.status;
    current.status = 'archived';
    current.deletedAt = new Date();
    current.deletedBy = req.user._id;
    current.claimedBy = null;
    current.claimedAt = null;
    await current.save({ session });
    await writeAuditLog({
      admin: req.user._id, action: 'news_archived', entityType: 'News', entityId: current._id,
      before, after: { status: current.status, deletedAt: current.deletedAt }, req, session,
    });
    return current;
  });
  sendSuccess(res, 200, { news: news.toJSON() }, 'News archived successfully');
});

const restoreNews = asyncHandler(async (req, res) => {
  const id = validateNewsId(req.params.id);
  const news = await withTransaction(async (session) => {
    const current = await News.findOne({ _id: id, status: 'archived' }).session(session);
    if (!current) throw new AppError('Archived news not found', 404);
    const before = { status: current.status, deletedAt: current.deletedAt };
    current.status = current.archivedFromStatus || 'published';
    if (current.status === 'archived') current.status = 'published';
    current.deletedAt = null;
    current.deletedBy = null;
    await current.save({ session });
    await writeAuditLog({
      admin: req.user._id, action: 'news_restored', entityType: 'News', entityId: current._id,
      before, after: { status: current.status, deletedAt: current.deletedAt }, req, session,
    });
    return current;
  });
  sendSuccess(res, 200, { news: news.toJSON() }, 'News restored successfully');
});

const permanentlyDeleteNews = asyncHandler(async (req, res) => {
  const id = validateNewsId(req.params.id);
  const current = await News.findById(id);
  if (!current) throw new AppError('News not found', 404);

  // Refuse the destructive DB operation when storage cleanup cannot be completed.
  if (current.media?.length) await deleteCloudinaryAssetsStrict(current.media);

  try {
    const result = await withTransaction(async (session) => {
      const fresh = await News.findById(id).session(session);
      if (!fresh) throw new AppError('News not found', 404);
      const submittedBy = fresh.submittedBy;
      const wasPublishedContributorStory = Boolean(submittedBy && !fresh.createdByAdmin && fresh.status === 'published');
      const authorLikeCount = submittedBy
        ? await NewsLike.countDocuments({ news: id, user: { $ne: submittedBy } }).session(session)
        : 0;

      await Promise.all([
        Comment.deleteMany({ news: id }, { session }),
        NewsLike.deleteMany({ news: id }, { session }),
        SavedStory.deleteMany({ news: id }, { session }),
        Report.deleteMany({ news: id }, { session }),
        Notification.deleteMany({ 'relatedEntity.entityId': id, 'relatedEntity.entityType': 'News' }, { session }),
        SubmissionRevision.deleteMany({ submission: id }, { session }),
        CreditTransaction.updateMany({ relatedNews: id }, { $set: { relatedNews: null } }, { session }),
      ]);
      if (wasPublishedContributorStory) {
        await User.findOneAndUpdate({ _id: submittedBy, storiesCount: { $gt: 0 } }, { $inc: { storiesCount: -1 } }, { session });
      }
      if (submittedBy && authorLikeCount > 0) {
        await User.findOneAndUpdate({ _id: submittedBy }, { $inc: { likesReceived: -authorLikeCount } }, { session });
      }
      await News.deleteOne({ _id: id }, { session });
      await writeAuditLog({
        admin: req.user._id, action: 'news_permanently_deleted', entityType: 'News', entityId: id,
        before: { title: fresh.title, status: fresh.status, mediaCount: fresh.media?.length || 0 },
        after: { deleted: true }, req, session,
      });
      return { mediaCount: fresh.media?.length || 0 };
    });
    sendSuccess(res, 200, { deleted: true, ...result }, 'News permanently deleted');
  } catch (error) {
    // The DB transaction failed after storage was removed. Surface this honestly so it can be retried rather than masking it.
    error.message = `${error.message || 'Database deletion failed'} Storage cleanup already completed; retry the deletion if the record is still present.`;
    throw error;
  }
});

const deleteNewsMedia = asyncHandler(async (req, res) => {
  const id = validateNewsId(req.params.id);
  const index = Number(req.params.mediaIndex);
  if (!Number.isInteger(index) || index < 0) throw new AppError('Invalid media index', 400);
  const news = await News.findById(id);
  if (!news) throw new AppError('News not found', 404);
  if (index >= news.media.length) throw new AppError('Media item not found', 404);
  const asset = news.media[index];
  await deleteCloudinaryAssetsStrict([asset]);

  try {
    const updated = await withTransaction(async (session) => {
      const current = await News.findById(id).session(session);
      if (!current || index >= current.media.length) throw new AppError('Media item no longer exists', 409);
      const before = current.media.map((item) => item.toObject ? item.toObject() : item);
      current.media.splice(index, 1);
      await current.save({ session });
      await writeAuditLog({
        admin: req.user._id, action: 'news_media_deleted', entityType: 'News', entityId: current._id,
        before: { media: before }, after: { media: current.media }, req, session,
      });
      return current;
    });
    const value = updated.toJSON();
    value.media = normalizeMedia(updated.media);
    sendSuccess(res, 200, { news: value }, 'Media deleted permanently');
  } catch (error) {
    error.message = `${error.message || 'Database update failed'} Storage cleanup already completed; retry the operation if necessary.`;
    throw error;
  }
});

const updateAdminNewsNotes = asyncHandler(async (req, res) => {
  const id = validateNewsId(req.params.id);
  const adminNotes = req.body.adminNotes !== undefined ? String(req.body.adminNotes).slice(0, 5000) : undefined;
  const evidenceNotes = req.body.evidenceNotes !== undefined ? String(req.body.evidenceNotes).slice(0, 5000) : undefined;
  if (adminNotes === undefined && evidenceNotes === undefined) throw new AppError('At least one note field is required', 400);
  const news = await News.findById(id).select('+adminNotes +evidenceNotes');
  if (!news) throw new AppError('News not found', 404);
  const before = { adminNotes: news.adminNotes || '', evidenceNotes: news.evidenceNotes || '' };
  if (adminNotes !== undefined) news.adminNotes = adminNotes;
  if (evidenceNotes !== undefined) news.evidenceNotes = evidenceNotes;
  await news.save();
  await writeAuditLog({
    admin: req.user._id, action: 'news_notes_updated', entityType: 'News', entityId: news._id,
    before, after: { adminNotes: news.adminNotes || '', evidenceNotes: news.evidenceNotes || '' }, req,
  });
  sendSuccess(res, 200, { adminNotes: news.adminNotes || '', evidenceNotes: news.evidenceNotes || '' }, 'Internal notes saved');
});

const deleteAdminComment = asyncHandler(async (req, res) => {
  const newsId = validateNewsId(req.params.id);
  if (!mongoose.isValidObjectId(req.params.commentId)) throw new AppError('Invalid comment id', 400);
  const comment = await Comment.findOneAndDelete({ _id: req.params.commentId, news: newsId });
  if (!comment) throw new AppError('Comment not found', 404);
  await writeAuditLog({
    admin: req.user._id, action: 'comment_deleted', entityType: 'Comment', entityId: comment._id,
    before: { news: newsId, user: comment.user, text: comment.text }, after: { deleted: true }, req,
  });
  const commentsCount = await Comment.countDocuments({ news: newsId });
  sendSuccess(res, 200, { commentsCount }, 'Comment permanently deleted');
});

module.exports = {
  getAdminNews,
  getAdminNewsById,
  updateAdminNews,
  archiveNews,
  restoreNews,
  permanentlyDeleteNews,
  deleteNewsMedia,
  updateAdminNewsNotes,
  deleteAdminComment,
};
