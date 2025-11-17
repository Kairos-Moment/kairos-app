// Created by: Jorge Valdes-Santiago
//
//
// This script contains the functions for perfoming CRUD operations on the "habit_logs" table
const { pool } = require("../config/database.js"); //import { pool } from "../config/database.js";

const createHabitLog = async (req, res) => {
  // Send query to the database
  try {
    // Get parameters from HTTP POST request
    const { habit_id, completion_date, notes } = req.body;

    // Query to add a new habit log to the habit_logs table
    const query = `
    INSERT INTO habit_logs (habit_id, completion_date, notes)
    VALUES ($1, $2, $3)
    `;

    const results = await pool.query(query, [habit_id, completion_date, notes]);

    // Request successful
    res.status(201).json(results.rows[0]);
    console.log("New habit log created");
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: error.message });
    console.log("Error:", error.message);
  }
};

const getHabitLogById = async (req, res) => {
  try {
    const query = `SELECT * FROM habit_logs WHERE id = $1`;
    const id = parseInt(req.params.id); // Get item id (IMPORTANT: THE PARAMETER MUST MATCH THE ONE USED IN THE routes file)

    const results = await pool.query(query, [id]);

    res.status(200).json(results.rows[0]); // Request successful, send message to client
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: err.message });
    console.log("Error:", error.message);
  }
};

const getHabitLogsByHabitId = async (req, res) => {
  try {
    // Get all habit logs from a habit id
    const { habit_id } = req.body; // Get habit_id from the request body

    const query = `SELECT * FROM habit_logs WHERE habit_id = $1`;

    const results = await pool.query(query, [habit_id]); // Send query to the database

    res.status(200).json(results.rows); // Request successful, send data to client
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: err.message });
    console.log("Error:", error.message);
  }
};

const updateHabitLog = async (req, res) => {
  try {
    const id = parseInt(req.params.id); //  parse the ID from the URL parameter and convert it to an integer.

    // Get parameters from HTTP PATCH request
    const { habit_id, completion_date, notes } = req.body;

    const query = `
    UPDATE habit_logs SET notes = $1 WHERE id = $2`;
    const results = await pool.query(query, [notes, id]);

    res.status(200).json(results.rows); // Request successful, send response to client
    console.log("Habit Log updated");
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: err.message });
    console.log("Error:", error.message);
  }
};

const deleteHabitLog = async (req, res) => {
  try {
    const id = parseInt(req.params.id); //  parse the ID from the URL parameter and convert it to an integer.
    // (IMPORTANT: THE PARAMETER MUST MATCH THE ONE USED IN THE routes file)

    // Query to delete the selected habit log
    const query = `DELETE FROM habit_logs WHERE id = $1`;

    const results = await pool.query(query, [id]);

    // HTTP DELETE request
    res.status(200).json(results.rows); // Request successful, send message to client
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: err.message });
    console.log("Error:", error.message);
  }
};

module.exports = {
  createHabitLog,
  getHabitLogById,
  getHabitLogsByHabitId,
  updateHabitLog,
  deleteHabitLog,
};
