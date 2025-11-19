// backend/src/controllers/tasks.controller.js

const { pool } = require("../config/database.js");

/**
 * Creates a new task for the currently logged-in user.
 */
const createTask = async (req, res) => {
  try {
    // SECURITY: Get the user ID from the authenticated session, NOT the request body.
    const userId = req.user.id;

    // Get the rest of the task details from the request body.
    const {
      goal_id,
      title,
      description,
      is_urgent,
      is_important,
      due_date, // Matching the column name from reset.js
      status,
    } = req.body;

    // The 'created_at' column is now handled by the database default.
    const query = `
      INSERT INTO tasks (user_id, goal_id, title, description, is_urgent, is_important, due_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *; -- Return the newly created task
    `;

    const results = await pool.query(query, [
      userId, // Use the secure user ID from the session
      goal_id,
      title,
      description,
      is_urgent,
      is_important,
      due_date,
      status,
    ]);

    res.status(201).json(results.rows[0]);
    console.log(`New task created for user ${userId}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error creating task:", error.message);
  }
};

/**
 * Fetches a single task by its ID, ensuring it belongs to the logged-in user.
 */
const getTaskById = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = parseInt(req.params.id);

    // SECURITY: The query now checks BOTH the task ID and the user ID.
    const query = `SELECT * FROM tasks WHERE id = $1 AND user_id = $2`;
    const results = await pool.query(query, [taskId, userId]);

    if (results.rows.length === 0) {
      // If no task is found, it's either the wrong ID or it doesn't belong to this user.
      return res.status(404).json({ message: "Task not found." });
    }

    res.status(200).json(results.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error getting task by ID:", error.message);
  }
};

/**
 * Fetches all tasks for the currently logged-in user.
 */
const getTasksByUserId = async (req, res) => {
  try {
    // SECURITY: Get user ID from the session, not the request body.
    const userId = req.user.id;

    const query = `SELECT * FROM tasks WHERE user_id = $1 ORDER BY due_date ASC`;
    const results = await pool.query(query, [userId]);

    res.status(200).json(results.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error getting tasks by user ID:", error.message);
  }
};

/**
 * Updates an existing task, ensuring it belongs to the logged-in user.
 */
const updateTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = parseInt(req.params.id);
    const { title, description, is_urgent, is_important, due_date, status, goal_id } = req.body;

    // SECURITY: The WHERE clause checks both task ID and user ID before updating.
    const query = `
      UPDATE tasks 
      SET title = $1, description = $2, is_urgent = $3, is_important = $4, due_date = $5, status = $6, goal_id = $7 
      WHERE id = $8 AND user_id = $9
      RETURNING *; -- Return the updated task
    `;
    const results = await pool.query(query, [
      title, description, is_urgent, is_important, due_date, status, goal_id,
      taskId,
      userId,
    ]);

    if (results.rows.length === 0) {
      return res.status(404).json({ message: "Task not found or you do not have permission to edit it." });
    }

    res.status(200).json(results.rows[0]);
    console.log(`Task ${taskId} updated for user ${userId}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error updating task:", error.message);
  }
};

/**
 * Deletes a task, ensuring it belongs to the logged-in user.
 */
const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = parseInt(req.params.id);

    // SECURITY: The WHERE clause checks both task ID and user ID before deleting.
    const query = `DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *;`;
    const results = await pool.query(query, [taskId, userId]);

    if (results.rowCount === 0) {
      // If no rows were deleted, the task didn't exist or didn't belong to the user.
      return res.status(404).json({ message: "Task not found or you do not have permission to delete it." });
    }

    res.status(200).json({ message: `Task with ID ${taskId} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error deleting task:", error.message);
  }
};

module.exports = {
  createTask,
  getTaskById,
  getTasksByUserId,
  updateTask,
  deleteTask,
};