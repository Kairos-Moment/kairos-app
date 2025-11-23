// backend/src/controllers/tasks.controller.js

const { pool } = require("../config/database.js");

/**
 * Creates a new task AND its subtasks using a transaction.
 */
const createTask = async (req, res) => {
  // We need a dedicated client for transactions
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;
    const {
      goal_id,
      title,
      description,
      is_urgent,
      is_important,
      due_date,
      status,
      subtasks // Array of objects: [{ title: 'Step 1' }, ...]
    } = req.body;

    // 1. Start Transaction
    await client.query('BEGIN');

    // 2. Insert Main Task
    const taskQuery = `
      INSERT INTO tasks (user_id, goal_id, title, description, is_urgent, is_important, due_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const taskResult = await client.query(taskQuery, [
      userId, goal_id, title, description, is_urgent, is_important, due_date, status || 'pending'
    ]);
    const newTask = taskResult.rows[0];

    // 3. Insert Subtasks (if any)
    if (subtasks && Array.isArray(subtasks) && subtasks.length > 0) {
      const subtaskQuery = `INSERT INTO subtasks (task_id, title) VALUES ($1, $2)`;
      
      for (const sub of subtasks) {
        // Only insert if title is not empty
        if (sub.title && sub.title.trim() !== "") {
          await client.query(subtaskQuery, [newTask.id, sub.title]);
        }
      }
    }

    // 4. Commit Transaction
    await client.query('COMMIT');

    // 5. Return the final task object
    // (Ideally, we'd fetch it again with subtasks attached, but for now returning the main task is okay.
    // The frontend will likely refresh the list anyway.)
    res.status(201).json(newTask);
    console.log(`New task created for user ${userId} with subtasks.`);
    
  } catch (error) {
    // If anything fails, undo everything
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
    console.log("Error creating task:", error.message);
  } finally {
    client.release();
  }
};

/**
 * Fetches all tasks AND their subtasks for the logged-in user.
 */
const getTasksByUserId = async (req, res) => {
  try {
    const userId = req.user.id;

    // ADVANCED QUERY:
    // This joins tasks with subtasks and bundles subtasks into a JSON array called 'subtasks'.
    const query = `
      SELECT 
        t.*, 
        COALESCE(
          json_agg(
            json_build_object('id', st.id, 'title', st.title, 'is_completed', st.is_completed)
            ORDER BY st.id ASC
          ) FILTER (WHERE st.id IS NOT NULL), 
          '[]'
        ) AS subtasks
      FROM tasks t
      LEFT JOIN subtasks st ON t.id = st.task_id
      WHERE t.user_id = $1
      GROUP BY t.id
      ORDER BY t.due_date ASC;
    `;
    
    const results = await pool.query(query, [userId]);
    res.status(200).json(results.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error getting tasks:", error.message);
  }
};

/**
 * Updates an existing task.
 */
const updateTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = parseInt(req.params.id);
    const { title, description, is_urgent, is_important, due_date, status, goal_id } = req.body;

    const query = `
      UPDATE tasks 
      SET title = $1, description = $2, is_urgent = $3, is_important = $4, due_date = $5, status = $6, goal_id = $7 
      WHERE id = $8 AND user_id = $9
      RETURNING *;
    `;
    const results = await pool.query(query, [
      title, description, is_urgent, is_important, due_date, status, goal_id,
      taskId, userId,
    ]);

    if (results.rows.length === 0) {
      return res.status(404).json({ message: "Task not found or unauthorized." });
    }

    res.status(200).json(results.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Deletes a task.
 */
const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = parseInt(req.params.id);

    // Subtasks automatically delete due to ON DELETE CASCADE in SQL
    const query = `DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *;`;
    const results = await pool.query(query, [taskId, userId]);

    if (results.rowCount === 0) {
      return res.status(404).json({ message: "Task not found or unauthorized." });
    }

    res.status(200).json({ message: `Task deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Toggles a subtask's completion status.
 * Requires a new route: PATCH /api/tasks/subtasks/:id/toggle
 */
const toggleSubtask = async (req, res) => {
  try {
    const userId = req.user.id;
    const subtaskId = parseInt(req.params.id);

    // Complex Check: Ensure the subtask belongs to a task that belongs to the user
    const query = `
      UPDATE subtasks st
      SET is_completed = NOT is_completed
      FROM tasks t
      WHERE st.task_id = t.id 
      AND st.id = $1 
      AND t.user_id = $2
      RETURNING st.*;
    `;
    
    const results = await pool.query(query, [subtaskId, userId]);

    if (results.rows.length === 0) {
      return res.status(404).json({ message: "Subtask not found or unauthorized." });
    }

    res.json(results.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Make sure to export getTaskById if you still use it individually
const getTaskById = async (req, res) => {
    // ... same as your original ...
    const userId = req.user.id;
    const taskId = parseInt(req.params.id);
    const query = `SELECT * FROM tasks WHERE id = $1 AND user_id = $2`;
    const results = await pool.query(query, [taskId, userId]);
    if (results.rows.length === 0) return res.status(404).json({ message: "Not found" });
    res.json(results.rows[0]);
};

module.exports = {
  createTask,
  getTaskById,
  getTasksByUserId,
  updateTask,
  deleteTask,
  toggleSubtask // <--- Don't forget to export this
};