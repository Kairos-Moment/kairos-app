// Created by: Jorge Valdes-Santiago
//
//
// This script contains the endpoints to the tasks controller functions
const express = require("express"); //import express from "express";
const TasksController = require("../controllers/tasks.controller.js"); //import TasksController from "../controllers/tasks.controller.js";

const router = express.Router();

// HTTP GET /api/tasks/
router.get("/", TasksController.getTasksByUserId);

// HTTP POST /api/tasks
router.post("/", TasksController.createTask);

// HTTP GET /api/tasks/:id
router.get("/:id", TasksController.getTaskById);

// HTTP PATCH /api/tasks/:id
router.patch("/:id", TasksController.updateTask);

// HTTP DELETE /api/tasks/:id
router.delete("/:id", TasksController.deleteTask);

module.exports = router; //export default router;
