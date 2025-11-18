// backend/src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport"); // Needed for authentication
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 5001;
const insightsRoutes = require("./routes/insights.routes");
const taskRoutes = require("./routes/tasks.routes");
const goalRoutes = require("./routes/goals.routes");
const habitRoutes = require("./routes/habits.routes");
const focusSessionRoutes = require("./routes/focus-sessions.routes");
const habitLogRoutes = require("./routes/habit-logs.routes");
const authRoutes = require("./routes/auth.routes.js");

const { GitHub } = require("./config/auth"); // Import the GitHub object from the authentication script

// Middleware
app.use(
  // Session middleware
  session({
    secret: "codepath", // Secret key for the session's secret option. This key is used to sign the session ID cookie.
    resave: false, // If true, this option forces the session to be saved back to the session store, even if the session was never modified during the request.
    // If false, the session will only be stored in the session store if something in the session has changed

    saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store. A session is considered "unintialized" when it is new and not modified.
  })
);

app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL in development
    // For production, you'll change this to your deployed frontend URL

    methods: "GET,POST,PUT,DELETE,PATCH", // Specify acceptable CORS requests
    credentials: true, // Allow cookies (or other credentials) to be included in CORS requests
  })
);
app.use(express.json());

// Passport Middleware
app.use(passport.initialize()); // Initialize session
app.use(passport.session()); // "remember" the authenticated user
passport.use(GitHub); // Use the GitHub strategy

// Set up session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

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
app.use("/api/focus-sessions", focusSessionRoutes);
app.use("/api/habit-logs", habitLogRoutes);
app.use("/auth/", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
