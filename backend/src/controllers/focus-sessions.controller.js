// backend/src/controllers/focus-sessions.controller.js

const { pool } = require("../config/database.js");
const { differenceInMinutes } = require('date-fns');

/**
 * Creates a new focus session for a task owned by the logged-in user.
 */
const createFocusSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { task_id, start_time, end_time } = req.body;

    // SECURITY CHECK: First, verify that the task for this session belongs to the current user.
    const taskCheckQuery = `SELECT id FROM tasks WHERE id = $1 AND user_id = $2`;
    const taskCheckResult = await pool.query(taskCheckQuery, [task_id, userId]);

    if (taskCheckResult.rows.length === 0) {
      return res.status(403).json({ message: "Forbidden: You do not own the parent task." });
    }
    
    // BACKEND CALCULATION: Calculate duration reliably on the backend.
    const duration_minutes = differenceInMinutes(new Date(end_time), new Date(start_time));
    if (duration_minutes < 0) {
        return res.status(400).json({ message: "End time cannot be before start time." });
    }

    // If the check passes, proceed to insert the session.
    const insertQuery = `
      INSERT INTO focus_sessions (user_id, task_id, start_time, end_time, duration_minutes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const results = await pool.query(insertQuery, [
      userId,
      task_id,
      start_time,
      end_time,
      duration_minutes,
    ]);

    res.status(201).json(results.rows[0]);
    console.log(`New focus session created for user ${userId} on task ${task_id}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error creating focus session:", error.message);
  }
};

/**
 * Fetches all focus sessions for the currently logged-in user.
 */
const getFocusSessionsByUserId = async (req, res) => {
  try {
    const userId = req.user.id;

    // The query is simple because the table already has a user_id column.
    const query = `SELECT * FROM focus_sessions WHERE user_id = $1 ORDER BY start_time DESC`;
    const results = await pool.query(query, [userId]);

    res.status(200).json(results.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error getting focus sessions by user ID:", error.message);
  }
};

/**
 * Deletes a focus session, ensuring it belongs to the logged-in user.
 */
const deleteFocusSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = parseInt(req.params.id);

    // SECURITY: The WHERE clause checks both session ID and user ID before deleting.
    const query = `DELETE FROM focus_sessions WHERE id = $1 AND user_id = $2`;
    const results = await pool.query(query, [sessionId, userId]);

    if (results.rowCount === 0) {
      return res.status(404).json({ message: "Focus session not found or you do not have permission to delete it." });
    }
    
    res.status(200).json({ message: `Focus session with ID ${sessionId} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error deleting focus session:", error.message);
  }
};

// NOTE: getFocusSessionById and updateFocusSession are generally not needed for this resource.
// A session is a historical record and typically shouldn't be updated.
// If needed, they can be implemented with similar security checks.

module.exports = {
  createFocusSession,
  getFocusSessionsByUserId,
  deleteFocusSession,
};