// backend/src/server.js

// --- 1. CONFIGURATION (Moved to the top for clarity) ---
const path = require('path');
// ROBUST: Loads the single .env file from the project's root directory
require('dotenv').config({ path: path.join(process.cwd(), '../.env') });

// --- 2. IMPORTS ---
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const pgSession = require('connect-pg-simple')(session); // For persistent sessions
const { pool } = require('./config/database'); // Import your database pool
const { GitHub } = require("./config/auth"); // Your GitHub strategy

// --- 3. INITIALIZATION ---
const app = express();
const PORT = process.env.PORT || 5001; // Render uses 10000 by default

// --- 4. MIDDLEWARE SETUP ---

// CORS Configuration (should be one of the first middleware)
app.use(
  cors({
    origin: 'https://kairos-app.onrender.com', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parser Middleware (to read JSON from requests)
app.use(express.json());

// This line is also needed for the proxy to work correctly
app.set('trust proxy', 1);

app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: 'user_sessions',
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: true,       // MUST be true for Render (HTTPS)
      httpOnly: true,     // Good security practice
      sameSite: 'none'    // CRITICAL for the proxy setup to work in all browsers
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(GitHub);

// Passport session serialization
passport.serializeUser((user, done) => {
  // Store only the necessary user info in the session to keep it small
  done(null, user.id); // Assuming 'user' object from the db has an 'id'
});

passport.deserializeUser(async (id, done) => {
  // Fetch the full user object from the database using the id from the session
  try {
    const results = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = results.rows[0];
    done(null, user); // Attach the user object to req.user
  } catch (error) {
    done(error, null);
  }
});

// --- 5. ROUTES ---

// Basic welcome route
app.get("/", (req, res) => {
  res.status(200).send('<h1 style="text-align: center; margin-top: 50px;">Welcome to Kairos API!</h1>');
});

// Import and mount all API and auth routes
const insightsRoutes = require("./routes/insights.routes");
const taskRoutes = require("./routes/tasks.routes");
const goalRoutes = require("./routes/goals.routes");
const habitRoutes = require("./routes/habits.routes");
const focusSessionRoutes = require("./routes/focus-sessions.routes");
const habitLogRoutes = require("./routes/habit-logs.routes");
const authRoutes = require("./routes/auth.routes.js");

app.use("/api/insights", insightsRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/focus-sessions", focusSessionRoutes);
app.use("/api/habit-logs", habitLogRoutes);
app.use("/api/auth", authRoutes);

// --- 6. SERVER LISTENER ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});