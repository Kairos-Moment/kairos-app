// Created by: Jorge Valdes-Santiago
//
//
// This script contains the endpoints to the habit_logs controller functions
const express = require("express"); //import express from "express";
const HabitLogsController = require("../controllers/habit-logs.controller.js");
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth.middleware');

router.use(ensureAuthenticated);


// HTTP GET /api/habit-logs/
router.get("/", HabitLogsController.getHabitLogsByHabitId);

// HTTP POST /api/habit-logs
router.post("/", HabitLogsController.createHabitLog);

// HTTP GET /api/habit-logs/:id
router.get("/:id", HabitLogsController.getHabitLogById);

// HTTP PATCH /api/habit-logs/:id
router.patch("/:id", HabitLogsController.updateHabitLog);

// HTTP DELETE /api/habit-logs/:id
router.delete("/:id", HabitLogsController.deleteHabitLog);

module.exports = router; //export default router;
