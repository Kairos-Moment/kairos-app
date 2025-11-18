const express = require('express');
const router = express.Router();
const { getInsights, getWeeklyReport } = require('../controllers/insights.controller');

router.get('/', getInsights);
router.get('/weekly', getWeeklyReport); // New route for the weekly report

module.exports = router;