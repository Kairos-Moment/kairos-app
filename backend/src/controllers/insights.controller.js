// backend/src/controllers/insights.controller.js

const { generateOracleInsight } = require('../services/analytics.service');

/**
 * Generates and returns a personalized Oracle insight for the currently
 * authenticated user. This route is protected by the 'ensureAuthenticated' middleware.
 */
const getOracleInsight = async (req, res) => {
  try {
    // --- THIS IS THE KEY CHANGE ---
    // Instead of a hardcoded ID, we get the real user's ID from the session.
    // Passport's `deserializeUser` function makes this available on `req.user`.
    const userId = req.user.id;

    // The analytics engine now runs for the logged-in user.
    const insight = await generateOracleInsight(userId);
    
    // Send the personalized insight back to the frontend.
    res.status(200).json(insight);
  } catch (error)
  {
    console.error(`Error generating Oracle insight for user ${req.user ? req.user.id : 'unknown'}:`, error);
    res.status(500).json({ message: "An error occurred while generating your insight." });
  }
};

module.exports = { getOracleInsight };