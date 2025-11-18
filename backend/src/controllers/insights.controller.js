const { generateOracleInsight, generateWeeklyReport } = require('../services/analytics.service');

// ... existing getInsights function ...

const getWeeklyReport = async (req, res) => {
  try {
    const userId = 1; // Hardcoded for now
    const report = await generateWeeklyReport(userId);
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error generating weekly report', error: error.message });
  }
};

module.exports = { getInsights, getWeeklyReport };