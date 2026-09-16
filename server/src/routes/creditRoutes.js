'use strict';
const express = require('express');
const { getCreditHistory, getAllTransactions, adminAdjustCredits } = require('../controllers/creditController');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

router.get('/history', protect, getCreditHistory);
router.get('/all', protect, restrictTo('admin'), getAllTransactions);
router.post('/adjust', protect, restrictTo('admin'), adminAdjustCredits);

module.exports = router;
