'use strict';
const News = require('../models/News');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const getFeed = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const { category, search } = req.query;

  const query = { status: 'published' };
  if (category) query.category = category;
  if (search) query.$text = { $search: search };

  const news = await News.find(query)
    .populate('submittedBy', 'name profilePhoto')
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await News.countDocuments(query);
  sendSuccess(res, 200, { news, total, page, totalPages: Math.ceil(total / limit) });
});

const getNewsById = asyncHandler(async (req, res) => {
  // Atomically increment views and return the updated document
  const news = await News.findOneAndUpdate(
    { _id: req.params.id, status: 'published' },
    { $inc: { views: 1 } },
    { new: true }
  ).populate('submittedBy', 'name profilePhoto credits');

  if (!news) {
    throw new AppError('News not found', 404);
  }

  sendSuccess(res, 200, { news });
});

const createAdminNews = asyncHandler(async (req, res) => {
  const { title, description, location, date, category } = req.body;
  const news = await News.create({
    title,
    description,
    location,
    date,
    category,
    media: req.uploadedMedia || [],
    status: 'published',
    createdByAdmin: true,
    publishedAt: new Date(),
    reviewedBy: req.user._id
  });

  sendSuccess(res, 201, { news }, 'News created successfully');
});

const likeNews = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news || news.status !== 'published') throw new AppError('News not found', 404);

  const userId = req.user._id;
  const hasLiked = news.likes.includes(userId);

  if (hasLiked) {
    news.likes.pull(userId);
  } else {
    news.likes.push(userId);
  }
  
  await news.save();
  sendSuccess(res, 200, { likesCount: news.likes.length, liked: !hasLiked });
});

const deleteNews = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news) throw new AppError('News not found', 404);

  await news.deleteOne();
  sendSuccess(res, 200, null, 'News deleted successfully');
});

module.exports = { getFeed, getNewsById, createAdminNews, likeNews, deleteNews };
