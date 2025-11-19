// backend/src/routes/auth.routes.js

const express = require("express");
const passport = require("passport");
const router = express.Router();

// This is a useful endpoint for the frontend to check if a user is logged in
router.get("/login/success", (req, res) => {
  if (req.user) {
    // req.user is populated by Passport's deserializeUser function
    res.status(200).json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false, message: "User is not authenticated" });
  }
});

// This endpoint is less commonly used, as the failureRedirect handles it
router.get("/login/failed", (req, res) => {
  res.status(401).json({ success: false, message: "Login failure" });
});

// The logout route is well-made, no changes needed
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie("connect.sid"); // Clear the session cookie
      res.status(200).json({ status: "logout", message: "User logged out successfully." });
    });
  });
});

// Authenticate user via GitHub
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["read:user"], // The scope requests permission to read user profile data
  })
);

// CHANGED: Standardized the environment variable to use CORS_ORIGIN
// This ensures we have a single source of truth for the frontend URL.
const FRONTEND_URL = process.env.CORS_ORIGIN || "http://localhost:5173";

// The callback route GitHub redirects to after authentication
router.get(
  "/github/callback",
  passport.authenticate("github", {
    // If successful login, redirect user to the frontend's root/dashboard page
    successRedirect: FRONTEND_URL,
    
    // IMPROVED: If unsuccessful, redirect user back to the frontend's login page
    failureRedirect: `${FRONTEND_URL}/login`,
  })
);

module.exports = router;