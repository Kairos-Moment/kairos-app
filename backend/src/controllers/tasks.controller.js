// backend/src/controllers/tasks.controller.js

const { pool } = require("../config/database.js");

/**
 * Creates a new task AND its subtasks using a transaction.
 */
const createTask = async (req, res) => {
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
      userId, 
      goal_id || null, 
      title, 
      description || '', 
      is_urgent || false, 
      is_important || false, 
      due_date || null, 
      status || 'pending'
    ]);
    const newTask = taskResult.rows[0];

    // 3. Insert Subtasks (if any)
    if (subtasks && Array.isArray(subtasks) && subtasks.length > 0) {
      const subtaskQuery = `INSERT INTO subtasks (task_id, title, is_completed) VALUES ($1, $2, $3)`;
      
      for (const sub of subtasks) {
        if (sub.title && sub.title.trim() !== "") {
          await client.query(subtaskQuery, [
            newTask.id, 
            sub.title,
            sub.is_completed || false
          ]);
        }
      }
    }

    // 4. Commit Transaction
    await client.query('COMMIT');

    // 5. Return the final task (including ID)
    // To make the UI update perfectly, we ideally want to return the structure with the subtasks array included.
    // For simplicity here, we return the main task, but if your UI expects subtasks immediately, 
    // you might want to run the SELECT query from updateTask step 5 here as well.
    // For now, attaching the input subtasks is a quick way to keep UI in sync without an extra DB call:
    const responseTask = { ...newTask, subtasks: subtasks || [] };
    
    res.status(201).json(responseTask);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating task:", error.message);
    res.status(500).json({ error: error.message });
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
    console.error("Error getting tasks:", error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Updates an existing task AND handles subtask updates/deletions.
 */
const updateTask = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;
    const taskId = parseInt(req.params.id);
    
    // Destructure all potential fields
    const { 
      title, 
      description, 
      is_urgent, 
      is_important, 
      due_date, 
      status, 
      goal_id, 
      subtasks // The updated list of subtasks
    } = req.body;

    // 1. Start Transaction
    await client.query('BEGIN');

    // 2. Update Main Task
    const updateQuery = `
      UPDATE tasks 
      SET title = $1, description = $2, is_urgent = $3, is_important = $4, due_date = $5, status = $6, goal_id = $7 
      WHERE id = $8 AND user_id = $9
      RETURNING *;
    `;
    
    const taskResult = await client.query(updateQuery, [
      title, 
      description, 
      is_urgent, 
      is_important, 
      due_date, 
      status, 
      goal_id,
      taskId, 
      userId,
    ]);

    // Check if task existed and belonged to user
    if (taskResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Task not found or unauthorized." });
    }

    // 3. Handle Subtasks
    // Strategy: Wipe all existing subtasks for this task and re-insert the new list.
    // This effectively handles additions, deletions, and edits simultaneously.
    
    await client.query('DELETE FROM subtasks WHERE task_id = $1', [taskId]);

    if (subtasks && Array.isArray(subtasks) && subtasks.length > 0) {
      const subtaskQuery = `INSERT INTO subtasks (task_id, title, is_completed) VALUES ($1, $2, $3)`;
      
      for (const st of subtasks) {
        if (st.title && st.title.trim() !== "") {
          await client.query(subtaskQuery, [
            taskId, 
            st.title, 
            st.is_completed || false
          ]);
        }
      }
    }

    // 4. Commit Transaction
    await client.query('COMMIT');

    // 5. Retrieve Final Object
    // We need to return the task + subtasks in the exact format the frontend expects 
    // so the state updates immediately without a page refresh.
    const finalQuery = `
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
      WHERE t.id = $1
      GROUP BY t.id;
    `;
    
    const finalResult = await client.query(finalQuery, [taskId]);
    res.status(200).json(finalResult.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating task:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

/**
 * Deletes a task.
 */
const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = parseInt(req.params.id);

    // Subtasks automatically delete due to ON DELETE CASCADE in SQL (if configured),
    // or typically we rely on that DB constraint.
    const query = `DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *;`;
    const results = await pool.query(query, [taskId, userId]);

    if (results.rowCount === 0) {
      return res.status(404).json({ message: "Task not found or unauthorized." });
    }

    res.status(200).json({ message: `Task deleted.` });
  } catch (error) {
    console.error("Error deleting task:", error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Toggles a subtask's completion status.
 */
const toggleSubtask = async (req, res) => {
  try {
    const userId = req.user.id;
    const subtaskId = parseInt(req.params.id);

    // Join with tasks to ensure the subtask belongs to a task owned by the user
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
    console.error("Error toggling subtask:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get a single task by ID
 */
const getTaskById = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = parseInt(req.params.id);
    
    // Simple fetch. If you need subtasks here too, use the join query from getTasksByUserId
    const query = `SELECT * FROM tasks WHERE id = $1 AND user_id = $2`;
    const results = await pool.query(query, [taskId, userId]);
    
    if (results.rows.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }
    
    res.json(results.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTask,
  getTasksByUserId,
  getTaskById,
  updateTask,
  deleteTask,
  toggleSubtask
};