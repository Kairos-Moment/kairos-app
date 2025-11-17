// Created by: Jorge Valdes-Santiago
//
//
// This script contains the functions for perfoming CRUD operations on the "goals" table

const { pool } = require("../config/database.js"); //import { pool } from "../config/database.js";

const createHabit = async (req, res) => {
  try {
    // Get parameters from HTTP POST request
    const { user_id, title, description, frequency, is_active } = req.body;

    // Get current time
    const created_at = new Date.now().toISOString(); // Get date in UTC (this can be converted to the local timezone in the frontend)

    // Query to add a new habit to the habits table
    const query = `
    INSERT INTO habits (user_id, title, description, frequency, is_active, created_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    `;

    // Send query to the database
    const results = await pool.query(query, [
      user_id,
      title,
      description,
      frequency,
      is_active,
      created_at,
    ]);

    // Request successful
    res.status(201).json(results.rows[0]);
    console.log("New habit created");
  } catch (err) {
    // Request not successful
    res.status(409).json({ error: error.message });
    console.log("Error:", error.message);
  }
};

const getHabitById = async (req, res) => {
  try {
    const query = `SELECT * FROM habits asks WHERE id = $1`;
    const id = parseInt(req.params.id); // Get item id (IMPORTANT: THE PARAMETER MUST MATCH THE ONE USED IN THE routes file)

    const results = await pool.query(query, [id]);

    res.status(200).json(results.rows[0]); // Request successful, send message to client
  } catch (err) {
    // Request not successful
    res.status(409).json({ error: error.message });
    console.log("Error:", error.message);
  }
};

const getHabitsByUserId = async (req, res) => {
  try {
    // Get all habits from a user id
    const { user_id } = req.body; // Get user_id from the request body

    const query = `SELECT * FROM habits WHERE user_id = $1`;

    const results = await pool.query(query, [user_id]); // Send query to the database

    res.status(200).json(results.rows); // Request successful, send data to client
  } catch (err) {
    // Request not successful
    res.status(409).json({ error: error.message });
    console.log("Error:", error.message);
  }
};

const updateHabit = async (req, res) => {
  try {
    const id = parseInt(req.params.id); //  parse the ID from the URL parameter and convert it to an integer.

    // Get parameters from HTTP PATCH request
    const { user_id, title, description, frequency, is_active } = req.body;

    const query = `
    UPDATE tasks SET title = $1, description = $2, frequency = $3, 
    is_active = $4 WHERE id = $5`;
    const results = await pool.query(query, [
      title,
      description,
      frequency,
      is_active,
      id,
    ]);

    res.status(200).json(results.rows); // Request successful, send response to client
    console.log("Task updated");
  } catch (err) {
    // Request not successful
    res.status(409).json({ error: error.message });
    console.log("Error:", error.message);
  }
};

const deleteHabit = async (req, res) => {
  try {
    const id = parseInt(req.params.id); //  parse the ID from the URL parameter and convert it to an integer.
    // (IMPORTANT: THE PARAMETER MUST MATCH THE ONE USED IN THE routes file)

    // Query to delete the selected habit
    const query = `DELETE FROM habits WHERE id = $1`;

    const results = await pool.query(query, [id]);
  } catch (err) {
    // Request not successful
    res.status(409).json({ error: error.message });
    console.log("Error:", error.message);
  }
};

module.exports = {
  createHabit,
  getHabitById,
  getHabitsByUserId,
  updateHabit,
  deleteHabit,
};
