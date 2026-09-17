'use strict';
const express = require('express');
const { submitNews, getMySubmissions, getMySubmissionById, getMySubmissionHistory, resubmitNews } = require('../controllers/submissionController');
const { createNewsValidation } = require('../validators/newsValidators');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const { mutationLimiter } = require('../middlewares/rateLimiter');
const { uploadMedia } = require('../middlewares/upload');

const router = express.Router();

router.post('/', protect, mutationLimiter, uploadMedia, createNewsValidation, validate, submitNews);
router.get('/mine', protect, getMySubmissions);
router.get('/:id/history', protect, getMySubmissionHistory);
router.get('/:id', protect, getMySubmissionById);
router.patch('/:id/resubmit', protect, mutationLimiter, uploadMedia, createNewsValidation, validate, resubmitNews);

module.exports = router;
