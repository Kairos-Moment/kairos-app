// Created by: Jorge Valdes-Santiago
//
//
// This script contains the functions for perfoming CRUD operations on the "tasks" table
const { pool } = require("../config/database.js"); //import { pool } from "../config/database.js";

const createTask = async (req, res) => {
  // Send query to the database
  try {
    // Get parameters from HTTP POST request
    const {
      user_id,
      goal_id,
      title,
      description,
      is_urgent,

      is_important,
      target_date,
      est_time_minutes,
      status,
    } = req.body;

    // Get current time
    const created_at = new Date.now().toISOString(); // Get date in UTC (this can be converted to the local timezone in the frontend)

    // Query to add a new task to the tasks table
    const query = `
    INSERT INTO tasks (user_id, goal_id, title, description, is_urgent, is_important, target_date, est_time_minutes, status, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    const results = await pool.query(query, [
      user_id,
      goal_id,
      title,
      description,
      is_urgent,

      is_important,
      target_date,
      est_time_minutes,
      status,
      created_at,
    ]);

    // Request successful
    res.status(201).json(results.rows[0]);
    console.log("New task created");
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: error.message });
    console.log("Error:", error.message);
  }
};

const getTaskById = async (req, res) => {
  try {
    const query = `SELECT * FROM tasks WHERE id = $1`;
    const id = parseInt(req.params.id); // Get item id (IMPORTANT: THE PARAMETER MUST MATCH THE ONE USED IN THE routes file)

    const results = await pool.query(query, [id]);

    res.status(200).json(results.rows[0]); // Request successful, send message to client
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: err.message });
    console.log("Error:", error.message);
  }
};

const getTasksByUserId = async (req, res) => {
  try {
    // Get all tasks from a user id
    const { user_id } = req.body; // Get user_id from the request body

    const query = `SELECT * FROM tasks WHERE user_id = $1`;

    const results = await pool.query(query, [user_id]); // Send query to the database

    res.status(200).json(results.rows); // Request successful, send data to client
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: err.message });
    console.log("Error:", error.message);
  }
};

const updateTask = async (req, res) => {
  try {
    const id = parseInt(req.params.id); //  parse the ID from the URL parameter and convert it to an integer.

    // Get parameters from HTTP PATCH request
    const {
      user_id,
      goal_id,
      title,
      description,
      is_urgent,

      is_important,
      target_date,
      est_time_minutes,
      status,
    } = req.body;

    const query = `
    UPDATE tasks SET title = $1, description = $2, is_urgent = $3, 
    is_important = $4, target_date = $5, est_time_minutes = $6, 
    status = $7 WHERE id = $8`;
    const results = await pool.query(query, [
      title,
      description,
      is_urgent,

      is_important,
      target_date,
      est_time_minutes,
      status,
      id,
    ]);
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: err.message });
    console.log("Error:", error.message);
  }
};

const deleteTask = async (req, res) => {
  try {
    const id = parseInt(req.params.id); //  parse the ID from the URL parameter and convert it to an integer.
    // (IMPORTANT: THE PARAMETER MUST MATCH THE ONE USED IN THE routes file)

    // Query to delete the selected task
    const query = `DELETE FROM tasks WHERE id = $1`;

    const results = await pool.query(query, [id]);

    // HTTP DELETE request
    res.status(200).json(results.rows[0]); // Request successful, send message to client
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: err.message });
    console.log("Error:", error.message);
  }
};

module.exports = {
  createTask,
  getTaskById,
  getTasksByUserId,
  updateTask,
  deleteTask,
};
/*
export default {
  createTask,
  getTaskById,
  getTasksByUserId,
  updateTask,
  deleteTask,
};
*/
