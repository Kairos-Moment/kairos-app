// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;
const insightsRoutes = require('./routes/insights.routes');

// Middleware
app.use(cors({
    origin: 'http://localhost:5173' // Your frontend URL in development
    // For production, you'll change this to your deployed frontend URL
}));
app.use(express.json());
app.use('/api/insights', insightsRoutes);

// Basic route for testing
app.get('/api', (req, res) => {
    res.json({ message: "Welcome to the Kairos API!" });
});

// TODO: Add your API routes here (e.g., app.use('/api/auth', authRoutes))

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});