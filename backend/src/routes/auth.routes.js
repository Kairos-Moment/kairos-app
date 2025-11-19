// backend/src/routes/auth.routes.js

const express = require("express");
const passport = require("passport");
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth.middleware'); // Import the security guard

// --- PROTECTED ROUTES ---
// These routes should only work if the user is ALREADY authenticated.

/**
 * @route GET /api/auth/login/success
 * @description Frontend calls this endpoint to check session status and get user data.
 * The `ensureAuthenticated` middleware acts as the guard.
 */
router.get("/login/success", ensureAuthenticated, (req, res) => {
  // If ensureAuthenticated passes, we know req.user exists.
  res.status(200).json({
    success: true,
    message: "User is authenticated.",
    user: req.user // Send back the user data from the session
  });
});

/**
 * @route GET /api/auth/logout
 * @description Logs out the current user.
 * The `ensureAuthenticated` middleware ensures only logged-in users can logout.
 */
router.get("/logout", ensureAuthenticated, (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err); // Pass any errors to the error handler
    }
    // Destroy the session in the database
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      // Clear the browser cookie and send a success response
      res.clearCookie("connect.sid");
      res.status(200).json({ success: true, message: "User logged out successfully." });
    });
  });
});

// --- PUBLIC ROUTES ---
// These routes are the entry points for the authentication process and MUST be public.

/**
 * @route GET /api/auth/github
 * @description The user is redirected here from the frontend to start the GitHub login process.
 */
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["read:user"], // The permission we ask from the user on GitHub
  })
);

// Standardized environment variable for the frontend URL
const FRONTEND_URL = process.env.CORS_ORIGIN || "http://localhost:5173";

/**
 * @route GET /api/auth/github/callback
 * @description The route GitHub redirects to after the user approves or denies the app.
 * Passport's `authenticate` function handles the logic. It does NOT need our middleware.
 */
router.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: FRONTEND_URL, // On success, send user to the dashboard
    failureRedirect: `${FRONTEND_URL}/login`, // On failure, send user back to the login page
  })
);

module.exports = router;