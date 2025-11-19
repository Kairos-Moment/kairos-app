// Created by: Jorge Valdes-Santiago
//
//
// This script contains the endpoints to the focus_sessions controller functions
const express = require("express"); //import express from "express";
const FocusSessionsController = require("../controllers/focus-sessions.controller.js");
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth.middleware');

router.use(ensureAuthenticated);


// HTTP GET /api/focus-sessions/
router.get("/", FocusSessionsController.getFocusSessionsByUserId);

// HTTP POST /api/focus-sessions
router.post("/", FocusSessionsController.createFocusSession);

// HTTP GET /api/focus-sessions/:id
router.get("/:id", FocusSessionsController.getFocusSessionById);

// HTTP PATCH /api/focus-sessions/:id
router.patch("/:id", FocusSessionsController.updateFocusSession);

// HTTP DELETE /api/focus-sessions/:id
router.delete("/:id", FocusSessionsController.deleteFocusSession);

module.exports = router; //export default router;
