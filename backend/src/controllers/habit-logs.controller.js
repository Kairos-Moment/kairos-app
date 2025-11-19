// backend/src/controllers/habit-logs.controller.js

const { pool } = require("../config/database.js");

/**
 * Creates a new log for a habit, but only if the user owns the parent habit.
 */
const createHabitLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { habit_id, completion_date, notes } = req.body;

    // SECURITY CHECK: First, verify that the habit being logged belongs to the current user.
    const habitCheckQuery = `SELECT id FROM habits WHERE id = $1 AND user_id = $2`;
    const habitCheckResult = await pool.query(habitCheckQuery, [habit_id, userId]);

    if (habitCheckResult.rows.length === 0) {
      return res.status(403).json({ message: "Forbidden: You do not own the parent habit." });
    }

    // If the check passes, proceed to insert the log.
    const insertQuery = `
      INSERT INTO habit_logs (habit_id, completion_date, notes)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const results = await pool.query(insertQuery, [habit_id, completion_date, notes]);

    res.status(201).json(results.rows[0]);
    console.log(`New habit log created for habit ${habit_id}`);
  } catch (error) {
    // Check for unique constraint violation (logging the same habit on the same day)
    if (error.code === '23505') {
      return res.status(409).json({ message: "A log for this habit already exists on this date." });
    }
    res.status(500).json({ error: error.message });
    console.log("Error creating habit log:", error.message);
  }
};

/**
 * Fetches all logs for a specific habit, but only if the user owns that habit.
 */
const getHabitLogsByHabitId = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get habit_id from URL parameters, which is better REST practice.
    const habitId = parseInt(req.params.habitId); 

    // SECURITY CHECK: Use a JOIN to fetch logs only if the parent habit's user_id matches.
    const query = `
      SELECT hl.* FROM habit_logs hl
      JOIN habits h ON hl.habit_id = h.id
      WHERE hl.habit_id = $1 AND h.user_id = $2
      ORDER BY hl.completion_date DESC;
    `;
    const results = await pool.query(query, [habitId, userId]);

    // It's not an error to have zero logs, so we just return the (possibly empty) array.
    res.status(200).json(results.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error getting habit logs by habit ID:", error.message);
  }
};

/**
 * Deletes a habit log, ensuring the user owns the parent habit.
 */
const deleteHabitLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const logId = parseInt(req.params.id);

    // SECURITY CHECK: Use a subquery to find the user_id from the parent habit.
    // This query says "Delete from habit_logs where the ID matches AND the habit_id
    // belongs to a habit owned by the current user."
    const query = `
      DELETE FROM habit_logs
      WHERE id = $1 AND habit_id IN (SELECT id FROM habits WHERE user_id = $2)
      RETURNING *;
    `;
    const results = await pool.query(query, [logId, userId]);

    if (results.rowCount === 0) {
      return res.status(404).json({ message: "Habit log not found or you do not have permission to delete it." });
    }

    res.status(200).json({ message: `Habit log with ID ${logId} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error deleting habit log:", error.message);
  }
};

// NOTE: getHabitLogById and updateHabitLog are less common for this resource.
// Users typically interact with a collection of logs for a specific habit.
// If you need them, they can be implemented with similar security checks.

module.exports = {
  createHabitLog,
  getHabitLogsByHabitId,
  deleteHabitLog,
};