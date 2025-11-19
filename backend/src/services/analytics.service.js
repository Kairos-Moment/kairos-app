const { pool } = require('../config/database'); // Make sure this path is correct
const { isToday, isTomorrow } = require('date-fns');

/**
 * The core analytics engine for the Oracle.
 * It fetches a user's pending tasks and generates a personalized insight.
 * @param {number} userId - The ID of the user to generate an insight for.
 * @returns {Promise<object>} An object containing the insight message and a list of high-leverage tasks.
 */
const generateOracleInsight = async (userId) => {
  // 1. Fetch all pending tasks for the user from the database
  const query = `
    SELECT title, is_important, due_date 
    FROM tasks 
    WHERE user_id = $1 AND status = 'pending'
    ORDER BY due_date ASC;
  `;
  const { rows: tasks } = await pool.query(query, [userId]);

  // 2. Analyze tasks to find "high-leverage" ones
  const highLeverageTasks = tasks.filter(task => {
    // A task is high-leverage if it's important AND due today or tomorrow
    const dueDate = new Date(task.due_date);
    return task.is_important && (isToday(dueDate) || isTomorrow(dueDate));
  });

  // 3. Generate a dynamic, personalized message based on the findings
  let message;
  if (highLeverageTasks.length >= 3) {
    message = "You have some important tasks ahead. Seize the day with purpose!";
  } else if (highLeverageTasks.length > 0) {
    message = "Focus on these high-leverage tasks to make today truly impactful.";
  } else {
    message = "Your schedule looks clear of immediate priorities. A great opportunity to plan ahead or tackle smaller items!";
  }

  // 4. Format the tasks for a clean frontend display (limit to 3)
  const formattedTasks = highLeverageTasks.slice(0, 3).map(task => {
    const dueDate = new Date(task.due_date);
    let dueText = 'Due Soon';
    if (isToday(dueDate)) dueText = 'Due Today';
    if (isTomorrow(dueDate)) dueText = 'Due Tomorrow';
    return { text: task.title, due: dueText };
  });

  // 5. Return the final insight object
  return {
    message,
    tasks: formattedTasks,
  };
};

module.exports = { generateOracleInsight };