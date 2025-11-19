// backend/src/controllers/habit-logs.controller.js

const { pool } = require("../config/database.js");

/**
 * Creates a new log for a habit, but only if the user owns the parent habit.
 */
const createHabitLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { habit_id, completion_date, notes } = req.body;

    if (!habit_id || !completion_date) {
        return res.status(400).json({ message: "habit_id and completion_date are required." });
    }

    // SECURITY CHECK: Verify that the parent habit belongs to the current user.
    const habitCheckQuery = `SELECT id FROM habits WHERE id = $1 AND user_id = $2`;
    const habitCheckResult = await pool.query(habitCheckQuery, [habit_id, userId]);

    if (habitCheckResult.rows.length === 0) {
      return res.status(403).json({ message: "Forbidden: You do not have permission to log this habit." });
    }

    // If the check passes, proceed to insert the log.
    const insertQuery = `
      INSERT INTO habit_logs (habit_id, completion_date, notes)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const results = await pool.query(insertQuery, [habit_id, completion_date, notes || '']);

    res.status(201).json(results.rows[0]);
    console.log(`New habit log created for habit ${habit_id}`);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: "A log for this habit already exists on this date." });
    }
    console.error("Error creating habit log:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

/**
 * Fetches all logs for a specific habit, but only if the user owns that habit.
 */
const getHabitLogsByHabitId = async (req, res) => {
  try {
    const userId = req.user.id;
    const habitId = parseInt(req.params.habitId);

    // SECURITY: Use a JOIN to fetch logs only if the parent habit's user_id matches.
    const query = `
      SELECT hl.* FROM habit_logs hl
      JOIN habits h ON hl.habit_id = h.id
      WHERE hl.habit_id = $1 AND h.user_id = $2
      ORDER BY hl.completion_date DESC;
    `;
    const results = await pool.query(query, [habitId, userId]);

    res.status(200).json(results.rows);
  } catch (error) {
    console.error("Error getting habit logs:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

/**
 * Updates the 'notes' of an existing habit log, ensuring the user owns the parent habit.
 */
const updateHabitLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const logId = parseInt(req.params.id);
    const { notes } = req.body;

    if (typeof notes === 'undefined') {
        return res.status(400).json({ message: "The 'notes' field is required for an update." });
    }

    // SECURITY: Use a subquery to ensure the log being updated belongs to a habit owned by the user.
    const query = `
      UPDATE habit_logs
      SET notes = $1
      WHERE id = $2 AND habit_id IN (SELECT id FROM habits WHERE user_id = $3)
      RETURNING *;
    `;
    const results = await pool.query(query, [notes, logId, userId]);

    if (results.rows.length === 0) {
      return res.status(404).json({ message: "Habit log not found or you do not have permission to edit it." });
    }

    res.status(200).json(results.rows[0]);
  } catch (error) {
    console.error("Error updating habit log:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

/**
 * Deletes a habit log, ensuring the user owns the parent habit.
 */
const deleteHabitLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const logId = parseInt(req.params.id);

    // SECURITY: Use a subquery to check ownership before deleting.
    const query = `
      DELETE FROM habit_logs
      WHERE id = $1 AND habit_id IN (SELECT id FROM habits WHERE user_id = $2)
    `;
    const results = await pool.query(query, [logId, userId]);

    if (results.rowCount === 0) {
      return res.status(404).json({ message: "Habit log not found or you do not have permission to delete it." });
    }

    res.status(200).json({ message: `Habit log with ID ${logId} deleted successfully.` });
  } catch (error) {
    console.error("Error deleting habit log:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

module.exports = {
  createHabitLog,
  getHabitLogsByHabitId,
  updateHabitLog,
  deleteHabitLog,
};