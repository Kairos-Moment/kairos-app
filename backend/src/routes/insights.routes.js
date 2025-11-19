const express = require('express');
const router = express.Router();
const { getOracleInsight } = require('../controllers/insights.controller');
const { ensureAuthenticated } = require('../middleware/auth.middleware');

router.use(ensureAuthenticated);

// Defines the route: GET /api/insights/
router.get('/', getOracleInsight);

module.exports = router;