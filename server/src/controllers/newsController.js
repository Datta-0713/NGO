'use strict';
const mongoose = require('mongoose');
const News = require('../models/News');
const User = require('../models/User');
const NewsLike = require('../models/NewsLike');
const Comment = require('../models/Comment');
const SavedStory = require('../models/SavedStory');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { escapeRegex } = require('../utils/security');
const { deleteCloudinaryAssets } = require('../middlewares/upload');
const { writeAuditLog } = require('../utils/audit');
const { withTransaction } = require('../utils/dbTransaction');
const { normalizeMedia } = require('../utils/media');

const normalizePagination = (page, limit, defaultLimit = 10) => ({
  page: Math.max(1, Number(page) || 1),
  limit: Math.min(100, Math.max(1, Number(limit) || defaultLimit)),
});

const enrichNews = async (newsDocs, userId = null) => {
  if (!newsDocs.length) return [];
  const ids = newsDocs.map((doc) => doc._id);
  const [likeCounts, commentCounts, savedIds, likedIds] = await Promise.all([
    NewsLike.aggregate([{ $match: { news: { $in: ids } } }, { $group: { _id: '$news', count: { $sum: 1 } } }]),
    Comment.aggregate([{ $match: { news: { $in: ids }, deletedAt: null } }, { $group: { _id: '$news', count: { $sum: 1 } } }]),
    userId ? SavedStory.find({ news: { $in: ids }, user: userId }).select('news') : [],
    userId ? NewsLike.find({ news: { $in: ids }, user: userId }).select('news') : [],
  ]);
  const likeMap = new Map(likeCounts.map((x) => [String(x._id), x.count]));
  const commentMap = new Map(commentCounts.map((x) => [String(x._id), x.count]));
  const savedSet = new Set(savedIds.map((x) => String(x.news)));
  const likedSet = new Set(likedIds.map((x) => String(x.news)));

  return newsDocs.map((doc) => {
    const json = doc.toJSON();
    json.media = normalizeMedia(doc.media);
    json.likesCount = likeMap.get(String(doc._id)) || 0;
    json.commentsCount = commentMap.get(String(doc._id)) || 0;
    json.liked = likedSet.has(String(doc._id));
    json.saved = savedSet.has(String(doc._id));
    return json;
  });
};

const findAuthorIds = async (search) => {
  if (!search) return [];
  const regex = new RegExp(escapeRegex(search), 'i');
  const authors = await User.find({ name: regex }).select('_id').limit(100);
  return authors.map((author) => author._id);
};

const getFeed = asyncHandler(async (req, res) => {
  const { page, limit } = normalizePagination(req.query.page, req.query.limit, 10);
  const skip = (page - 1) * limit;
  const { category, search } = req.query;
  const query = { status: 'published', deletedAt: null };
  if (category) query.category = category;

  if (search?.trim()) {
    const term = search.trim().slice(0, 100);
    const regex = new RegExp(escapeRegex(term), 'i');
    const authorIds = await findAuthorIds(term);
    query.$or = [
      { title: regex },
      { description: regex },
      { location: regex },
      ...(authorIds.length ? [{ submittedBy: { $in: authorIds } }] : []),
    ];
  }

  const [newsDocs, total] = await Promise.all([
    News.find(query)
      .populate('submittedBy', 'name profilePhoto')
      .sort({ publishedAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit),
    News.countDocuments(query),
  ]);

  const news = await enrichNews(newsDocs, req.user?._id || null);
  sendSuccess(res, 200, { news, total, page, limit, totalPages: Math.ceil(total / limit) });
});

const getNewsById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('Invalid news id', 400);
  const newsDoc = await News.findOneAndUpdate(
    { _id: req.params.id, status: 'published', deletedAt: null },
    { $inc: { views: 1 } },
    { new: true }
  ).populate('submittedBy', 'name profilePhoto location storiesCount likesReceived');
  if (!newsDoc) throw new AppError('News not found', 404);
  const [news] = await enrichNews([newsDoc], req.user?._id || null);
  sendSuccess(res, 200, { news });
});

const createAdminNews = asyncHandler(async (req, res) => {
  const { title, description, location, date, category, sourceUrl, geo } = req.body;
  const uploaded = req.uploadedMedia || [];
  try {
    const news = await News.create({
      title, description, location, date, category, sourceUrl: sourceUrl || '',
      geo: geo || undefined,
      media: uploaded,
      status: 'published',
      createdByAdmin: true,
      publishedAt: new Date(),
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
    });
    sendSuccess(res, 201, { news: news.toJSON() }, 'News created successfully');
  } catch (error) {
    await deleteCloudinaryAssets(uploaded);
    throw error;
  }
});

const setLike = asyncHandler(async (req, res) => {
  const news = await News.findOne({ _id: req.params.id, status: 'published', deletedAt: null }).select('_id submittedBy');
  if (!news) throw new AppError('News not found', 404);
  const userId = req.user._id;
  try {
    await NewsLike.create({ news: news._id, user: userId });
    if (news.submittedBy && String(news.submittedBy) !== String(userId)) {
      await User.findByIdAndUpdate(news.submittedBy, { $inc: { likesReceived: 1 } });
    }
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
  const likesCount = await NewsLike.countDocuments({ news: news._id });
  sendSuccess(res, 200, { likesCount, liked: true }, 'Story liked');
});

const removeLike = asyncHandler(async (req, res) => {
  const news = await News.findOne({ _id: req.params.id, status: 'published', deletedAt: null }).select('_id submittedBy');
  if (!news) throw new AppError('News not found', 404);
  const deleted = await NewsLike.findOneAndDelete({ news: news._id, user: req.user._id });
  if (deleted && news.submittedBy && String(news.submittedBy) !== String(req.user._id)) {
    await User.updateOne({ _id: news.submittedBy, likesReceived: { $gt: 0 } }, { $inc: { likesReceived: -1 } });
  }
  const likesCount = await NewsLike.countDocuments({ news: news._id });
  sendSuccess(res, 200, { likesCount, liked: false }, 'Story unliked');
});

// Compatibility endpoint for older mobile builds. New clients use PUT/DELETE.
const likeNews = asyncHandler(async (req, res) => {
  const existing = await NewsLike.findOne({ news: req.params.id, user: req.user._id });
  if (existing) return removeLike(req, res);
  return setLike(req, res);
});

const saveNews = asyncHandler(async (req, res) => {
  const news = await News.exists({ _id: req.params.id, status: 'published', deletedAt: null });
  if (!news) throw new AppError('News not found', 404);
  await SavedStory.updateOne(
    { news: req.params.id, user: req.user._id },
    { $setOnInsert: { news: req.params.id, user: req.user._id } },
    { upsert: true }
  );
  sendSuccess(res, 200, { saved: true }, 'Story saved');
});

const unsaveNews = asyncHandler(async (req, res) => {
  await SavedStory.deleteOne({ news: req.params.id, user: req.user._id });
  sendSuccess(res, 200, { saved: false }, 'Story removed from saved stories');
});

const getSavedNews = asyncHandler(async (req, res) => {
  const { page, limit } = normalizePagination(req.query.page, req.query.limit, 20);
  const [saved, total] = await Promise.all([
    SavedStory.find({ user: req.user._id }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate({
      path: 'news',
      match: { status: 'published', deletedAt: null },
      populate: { path: 'submittedBy', select: 'name profilePhoto' },
    }),
    SavedStory.countDocuments({ user: req.user._id }),
  ]);
  const staleIds = saved.filter((item) => !item.news).map((item) => item._id);
  if (staleIds.length) await SavedStory.deleteMany({ _id: { $in: staleIds }, user: req.user._id });
  const newsDocs = saved.map((x) => x.news).filter(Boolean);
  const news = await enrichNews(newsDocs, req.user._id);
  const cleanTotal = Math.max(0, total - staleIds.length);
  sendSuccess(res, 200, { news, total: cleanTotal, page, limit, totalPages: Math.ceil(cleanTotal / limit) });
});

const deleteNews = asyncHandler(async (req, res) => {
  const result = await withTransaction(async (session) => {
    const current = await News.findOne({ _id: req.params.id, deletedAt: null }).session(session);
    if (!current) throw new AppError('News not found', 404);
    const before = { status: current.status, deletedAt: current.deletedAt };
    current.archivedFromStatus = current.status === 'archived' ? (current.archivedFromStatus || 'published') : current.status;
    current.status = 'archived';
    current.deletedAt = new Date();
    current.deletedBy = req.user._id;
    await current.save({ session });
    await writeAuditLog({
      admin: req.user._id, action: 'news_archived', entityType: 'News', entityId: current._id,
      before, after: { status: current.status, deletedAt: current.deletedAt }, req, session,
    });
    return current;
  });
  sendSuccess(res, 200, { news: result }, 'News archived successfully');
});

const getComments = asyncHandler(async (req, res) => {
  const news = await News.findOne({ _id: req.params.id, status: 'published', deletedAt: null }).select('_id');
  if (!news) throw new AppError('News not found', 404);
  const comments = await Comment.find({ news: news._id, deletedAt: null })
    .sort({ createdAt: -1 })
    .populate('user', 'name profilePhoto');
  sendSuccess(res, 200, { comments, total: comments.length });
});

const addComment = asyncHandler(async (req, res) => {
  const text = String(req.body.text || '').trim();
  if (!text || text.length > 1000) throw new AppError('Comment must be between 1 and 1000 characters', 400);
  const news = await News.findOne({ _id: req.params.id, status: 'published', deletedAt: null }).select('_id');
  if (!news) throw new AppError('News not found', 404);
  const comment = await Comment.create({ news: news._id, user: req.user._id, text });
  await comment.populate('user', 'name profilePhoto');
  const commentsCount = await Comment.countDocuments({ news: news._id, deletedAt: null });
  sendSuccess(res, 201, { comment, commentsCount }, 'Comment added');
});

const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findOne({ _id: req.params.commentId, news: req.params.id });
  if (!comment) throw new AppError('Comment not found', 404);
  if (String(comment.user) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('Not authorised to delete this comment', 403);
  }
  await Comment.deleteOne({ _id: comment._id });
  const commentsCount = await Comment.countDocuments({ news: req.params.id });
  sendSuccess(res, 200, { commentsCount }, 'Comment permanently deleted');
});

module.exports = {
  getFeed, getNewsById, createAdminNews, likeNews, setLike, removeLike, saveNews, unsaveNews, getSavedNews,
  deleteNews, getComments, addComment, deleteComment,
};
