// backend/src/routes/tasks.routes.js

const express = require("express");
const TasksController = require("../controllers/tasks.controller.js");
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth.middleware');

// --- THIS IS THE CRITICAL "MERGE" STEP ---
// Apply the 'ensureAuthenticated' middleware to ALL routes defined in this file.
// This line must come BEFORE your individual route definitions.
router.use(ensureAuthenticated);

// --- ALL ROUTES BELOW ARE NOW PROTECTED ---

// HTTP GET /api/tasks/
// (Will now only work for logged-in users)
router.get("/", TasksController.getTasksByUserId);

// HTTP POST /api/tasks
// (Will now only work for logged-in users)
router.post("/", TasksController.createTask);

// HTTP GET /api/tasks/:id
// (Will now only work for logged-in users)
router.get("/:id", TasksController.getTaskById);

// HTTP PATCH /api/tasks/:id
// (Will now only work for logged-in users)
router.patch("/:id", TasksController.updateTask);

// HTTP DELETE /api/tasks/:id
// (Will now only work for logged-in users)
router.delete("/:id", TasksController.deleteTask);

module.exports = router;