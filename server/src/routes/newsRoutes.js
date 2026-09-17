'use strict';
const express = require('express');
const { getFeed, getNewsById, createAdminNews, likeNews, setLike, removeLike, saveNews, unsaveNews, getSavedNews, deleteNews, getComments, addComment, deleteComment } = require('../controllers/newsController');
const { reportNews } = require('../controllers/reportController');
const { createNewsValidation, listValidation } = require('../validators/newsValidators');
const validate = require('../middlewares/validate');
const { protect, optionalProtect, requireAdmin } = require('../middlewares/auth');
const { uploadMedia } = require('../middlewares/upload');
const { mutationLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.get('/', optionalProtect, listValidation, validate, getFeed);
router.get('/saved/mine', protect, getSavedNews);
router.get('/:id', optionalProtect, getNewsById);
router.post('/', protect, requireAdmin, mutationLimiter, uploadMedia, createNewsValidation, validate, createAdminNews);
router.put('/:id/like', protect, mutationLimiter, setLike);
router.delete('/:id/like', protect, mutationLimiter, removeLike);
router.patch('/:id/like', protect, mutationLimiter, likeNews); // backward compatibility
router.put('/:id/save', protect, mutationLimiter, saveNews);
router.delete('/:id/save', protect, mutationLimiter, unsaveNews);
router.delete('/:id', protect, requireAdmin, mutationLimiter, deleteNews);
router.post('/:id/report', protect, mutationLimiter, reportNews);
router.get('/:id/comments', getComments);
router.post('/:id/comments', protect, mutationLimiter, addComment);
router.delete('/:id/comments/:commentId', protect, mutationLimiter, deleteComment);

module.exports = router;
