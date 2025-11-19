const { generateOracleInsight } = require('../services/analytics.service');

const getOracleInsight = async (req, res) => {
  try {
    // In a real application with authentication, you would get this from a JWT token.
    // For the capstone, we will hardcode it to the first user.
    const userId = 1; // TODO: Replace with authenticated user ID

    const insight = await generateOracleInsight(userId);
    
    res.status(200).json(insight);
  } catch (error) {
    console.error("Error generating Oracle insight:", error);
    res.status(500).json({ message: "An error occurred on the server." });
  }
};

module.exports = { getOracleInsight };