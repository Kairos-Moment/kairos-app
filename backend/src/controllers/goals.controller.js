// Created by: Jorge Valdes-Santiago
//
//
// This script contains the functions for perfoming CRUD operations on the "goals" table
const { pool } = require("../config/database.js"); //import { pool } from "../config/database.js";

const createGoal = async (req, res) => {
  try {
    // Get parameters from HTTP POST request
    const { user_id, title, description, status, target_date } = req.body;

    // Get current time
    const created_at = new Date.now().toISOString(); // Get date in UTC (this can be converted to the local timezone in the frontend)

    // Query to add a new goal to the goals table
    const query = `
    INSERT INTO goals (user_id, title, description, status, target_date, created_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    `;

    // Send query to database
    const results = await pool.query(query, [
      user_id,
      title,
      description,
      status,
      target_date,
      created_at,
    ]);

    // Request successful
    res.status(201).json(results.rows[0]);
    console.log("New goal created");
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: error.message });
    console.log("Error:", error.message);
  }
};

const getGoalById = async (req, res) => {
  try {
    const query = `SELECT * FROM goals WHERE id = $1`;
    const id = parseInt(req.params.id); // Get item id (IMPORTANT: THE PARAMETER MUST MATCH THE ONE USED IN THE routes file)

    const results = await pool.query(query, [id]);

    res.status(200).json(results.rows[0]); // Request successful, send data to client
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: error.message });
    console.log("Error:", error.message);
  }
};

// Gets goals by user id
const getGoalsByUserId = async (req, res) => {
  try {
    // Get all goals from a user id
    const { user_id } = req.body; // Get user_id from the request body

    const query = `SELECT * FROM goals WHERE user_id = $1`;

    const results = await pool.query(query, [user_id]); // Send query to the database

    res.status(200).json(results.rows); // Request successful, send data to client
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: error.message });
    console.log("Error:", error.message);
  }
};

const updateGoal = async (req, res) => {
  try {
    const id = parseInt(req.params.id); //  parse the ID from the URL parameter and convert it to an integer.

    // Get parameters from HTTP PATCH request
    const { user_id, title, description, status, target_date } = req.body;

    const query = `
    UPDATE goals SET title = $1, description = $2, status = $3, 
    target_date = $5 WHERE id = $6`;
    const results = await pool.query(query, [
      title,
      description,
      status,
      target_date,
      id,
    ]);

    res.status(200).json(results.rows); // Request successful, send response to client
    console.log("Goal updated");
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: error.message });
    console.log("Error:", error.message);
  }
};

const deleteGoal = async (req, res) => {
  try {
    const id = parseInt(req.params.id); //  parse the ID from the URL parameter and convert it to an integer.
    // (IMPORTANT: THE PARAMETER MUST MATCH THE ONE USED IN THE routes file)

    // Query to delete the selected goal
    const query = `DELETE FROM goals WHERE id = $1`;

    const results = await pool.query(query, [id]);

    // HTTP DELETE request
    res.status(200).json(results.rows[0]); // Request successful, send message to client
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: error.message });
    console.log("Error:", error.message);
  }
};

module.exports = {
  createGoal,
  getGoalById,
  getGoalsByUserId,
  updateGoal,
  deleteGoal,
};
/*
export default {
  createGoal,
  getGoalById,
  getGoalsByUserId,
  updateGoal,
  deleteGoal,
};
*/
