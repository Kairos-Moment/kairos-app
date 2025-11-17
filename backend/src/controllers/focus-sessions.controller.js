// Created by: Jorge Valdes-Santiago
//
//
// This script contains the functions for perfoming CRUD operations on the "focus_sessions" table

// Work in progress

const createFocusSession = async (req, res) => {
  // Send query to the database
  try {
    // Get parameters from HTTP POST request
    const {
      user_id,
      task_id,
      start_time,
      end_time,
      duration_minutes, // NOTE: Considering removing this since it can be calculated on the front-end
    } = req.body;

    // Get current time
    const created_at = new Date.now().toISOString(); // Get date in UTC (this can be converted to the local timezone in the frontend)

    // Query to add a new focus session to the focus_sessions table
    const query = `
    INSERT INTO focus_sessions (user_id, task_id, start_time, end_time, duration_minutes)
    VALUES ($1, $2, $3, $4, $5)
    `;

    const results = await pool.query(query, [
      user_id,
      task_id,
      start_time,
      end_time,
      duration_minutes, // NOTE: Considering removing this since it can be calculated on the front-end
    ]);

    // Request successful
    res.status(201).json(results.rows[0]);
    console.log("New focus session created");
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: error.message });
    console.log("Error:", error.message);
  }
};

const getFocusSessionById = async (req, res) => {
  try {
    const query = `SELECT * FROM focus_sessions WHERE id = $1`;
    const id = parseInt(req.params.id); // Get item id (IMPORTANT: THE PARAMETER MUST MATCH THE ONE USED IN THE routes file)

    const results = await pool.query(query, [id]);

    res.status(200).json(results.rows[0]); // Request successful, send message to client
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: err.message });
    console.log("Error:", error.message);
  }
};

const getFocusSessionsByUserId = async (req, res) => {
  try {
    // Get all focus sessions from a user id
    const { user_id } = req.body; // Get user_id from the request body

    const query = `SELECT * FROM focus_sessions WHERE user_id = $1`;

    const results = await pool.query(query, [user_id]); // Send query to the database

    res.status(200).json(results.rows); // Request successful, send data to client
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: err.message });
    console.log("Error:", error.message);
  }
};

const updateFocusSession = async (req, res) => {
  try {
    const id = parseInt(req.params.id); //  parse the ID from the URL parameter and convert it to an integer.

    // Get parameters from HTTP PATCH request
    const {
      user_id,
      task_id,
      start_time,
      end_time,
      duration_minutes, // NOTE: Considering removing this since it can be calculated on the front-end
    } = req.body;

    const query = `
    UPDATE focus_sessions SET start_time = $1, end_time = $2,
    duration_minutes = $3 
    WHERE id = $4`;

    const results = await pool.query(query, [
      start_time,
      end_time,
      duration_minutes, // NOTE: Considering removing this since it can be calculated on the front-end
      id,
    ]);

    res.status(200).json(results.rows); // Request successful, send response to client
    console.log("Focus Session updated");
  } catch (error) {
    // Request not successful
    res.status(409).json({ error: err.message });
    console.log("Error:", error.message);
  }
};

const deleteFocusSession = async (req, res) => {
  try {
    const id = parseInt(req.params.id); //  parse the ID from the URL parameter and convert it to an integer.
    // (IMPORTANT: THE PARAMETER MUST MATCH THE ONE USED IN THE routes file)

    // Query to delete the selected focus session
    const query = `DELETE FROM focus_sessions WHERE id = $1`;

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
  createFocusSession,
  getFocusSessionById,
  getFocusSessionsByUserId,
  updateFocusSession,
  deleteFocusSession,
};
