'use strict';
const express = require('express');
const { getCreditHistory, getAllTransactions, adminAdjustCredits } = require('../controllers/creditController');
const { protect, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/history', protect, getCreditHistory);
router.get('/all', protect, requireAdmin, getAllTransactions);
router.post('/adjust', protect, requireAdmin, adminAdjustCredits);

module.exports = router;
