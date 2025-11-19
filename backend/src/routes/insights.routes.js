const express = require('express');
const router = express.Router();
const { getOracleInsight } = require('../controllers/insights.controller');

// Defines the route: GET /api/insights/
router.get('/', getOracleInsight);

module.exports = router;