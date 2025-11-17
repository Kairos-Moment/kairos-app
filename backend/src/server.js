// backend/src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5001;
const insightsRoutes = require("./routes/insights.routes");
const taskRoutes = require("./routes/tasks.routes");
const goalRoutes = require("./routes/goals.routes");
const habitRoutes = require("./routes/habits.routes");

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL in development
    // For production, you'll change this to your deployed frontend URL
  })
);
app.use(express.json());

// Basic route for testing
app.get("/", (req, res) => {
  res
    .status(200)
    .send(
      '<h1 style="text-align: center; margin-top: 50px;">Welcome to Kronos API!</h1>'
    );
});

app.get("/api", (req, res) => {
  res
    .status(200)
    .send(
      '<h1 style="text-align: center; margin-top: 50px;">Kronos API Endpoint</h1>'
    );
});

// TODO: Add your API routes here (e.g., app.use('/api/auth', authRoutes))
app.use("/api/insights", insightsRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/habits", habitRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
