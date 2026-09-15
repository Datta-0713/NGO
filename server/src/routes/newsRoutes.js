'use strict';
const express = require('express');
const { getFeed, getNewsById, createAdminNews, likeNews, deleteNews } = require('../controllers/newsController');
const { createNewsValidation } = require('../validators/newsValidators');
const validate = require('../middlewares/validate');
const { protect, requireAdmin } = require('../middlewares/auth');
const { uploadMedia } = require('../middlewares/upload');

const router = express.Router();

router.get('/', getFeed);
router.get('/:id', getNewsById);
router.post('/', protect, requireAdmin, uploadMedia, createNewsValidation, validate, createAdminNews);
router.patch('/:id/like', protect, likeNews);
router.delete('/:id', protect, requireAdmin, deleteNews);

module.exports = router;
