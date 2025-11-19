// Created by: Jorge Valdes-Santiago
//
//
// This script sets up the routes to the functions that handle user authentication and logout
const express = require("express");
const passport = require("passport");
const router = express.Router();

// HTTP GET /auth/login/success
router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({ success: true, user: req.user });
  }
});

// HTTP GET /auth/login/failed
router.get("/login/failed", (req, res) => {
  res.status(401).json({ success: true, message: "failure" });
});

// HTTP GET /auth/logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      //  If an error occurs during the logout process, pass the error to the next middleware function.
      return next(error);
    }

    // Remove the session data from the session store
    req.session.destroy((err) => {
      res.clearCookie("connect.sid"); // Clear cookie
      res.json({ status: "logout", user: {} });
    });
  });
});

// Authenticate user via GitHub
// HTTP GET /auth/github
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["read:user"],
  })
);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"; // To redirect users to the client page after login attempt

// HTTP GET /auth/github/callback
router.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: `${CLIENT_URL}`, // If successful login, redirect user to this page
    failureRedirect: `${CLIENT_URL}/destinations`, // If unsuccessful, redirect user to this page
  })
);

module.exports = router;
