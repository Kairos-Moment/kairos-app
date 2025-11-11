const { generateOracleInsight } = require('../services/analytics.service');

const getInsights = async (req, res) => {
  try {
    // In a real app, you would get the user ID from the auth token
    const userId = 1; // Hardcoded for now
    const insight = await generateOracleInsight(userId);
    res.status(200).json(insight);
  } catch (error) {
    res.status(500).json({ message: 'Error generating insights', error: error.message });
  }
};

module.exports = { getInsights };