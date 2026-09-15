'use strict';
const express = require('express');
const { submitNews, getMySubmissions } = require('../controllers/submissionController');
const { createNewsValidation } = require('../validators/newsValidators');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const { uploadMedia } = require('../middlewares/upload');

const router = express.Router();

router.post('/', protect, uploadMedia, createNewsValidation, validate, submitNews);
router.get('/mine', protect, getMySubmissions);

module.exports = router;
