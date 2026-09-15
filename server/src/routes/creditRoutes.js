'use strict';
const express = require('express');
const { getCreditHistory } = require('../controllers/creditController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/history', protect, getCreditHistory);

module.exports = router;
