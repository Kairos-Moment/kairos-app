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
const focusSessionRoutes = require("./routes/focus-sessions.routes");
const habitLogRoutes = require("./routes/habit-logs.routes");

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
app.use(express.json());

// Basic route for testing
app.get("/", (req, res) => {
  res
    .status(200)
    .send(
      '<h1 style="text-align: center; margin-top: 50px;">Welcome to Kairos API!</h1>'
    );
});

app.get("/api", (req, res) => {
  res
    .status(200)
    .send(
      '<h1 style="text-align: center; margin-top: 50px;">Kairos API Endpoint</h1>'
    );
});

// TODO: Add your API routes here (e.g., app.use('/api/auth', authRoutes))
app.use("/api/insights", insightsRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/focus-sessions", focusSessionRoutes);
app.use("/api/habit-logs", habitLogRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
