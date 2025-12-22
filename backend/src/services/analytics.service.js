// backend/src/services/analytics.service.js

const { pool } = require('../config/database');
const { isToday, isTomorrow, format } = require('date-fns');

/**
 * Generates the Dashboard Insight.
 * Now checks for URGENT tasks to trigger the "Red Alert" on the frontend.
 */
const generateOracleInsight = async (userId) => {
  // 1. Fetch pending tasks that are High Priority (Urgent OR Important)
  const query = `
    SELECT title, is_important, is_urgent, due_date 
    FROM tasks 
    WHERE user_id = $1 
    AND status = 'pending'
    AND (is_urgent = TRUE OR is_important = TRUE)
    ORDER BY is_urgent DESC, due_date ASC;
  `;
  const { rows: tasks } = await pool.query(query, [userId]);

  // 2. Analyze tasks
  // We prioritize 'Urgent' tasks for the alert system
  const urgentTasks = tasks.filter(t => t.is_urgent);
  const highLeverageTasks = tasks.filter(t => {
    if (!t.due_date) return false;
    const date = new Date(t.due_date);
    return isToday(date) || isTomorrow(date);
  });

  // 3. Generate Dynamic Message
  let message;
  
  // Logic: Urgent tasks take priority over everything else
  if (urgentTasks.length > 0) {
    message = `Alert: You have ${urgentTasks.length} urgent task${urgentTasks.length > 1 ? 's' : ''} requiring immediate attention. Action is required.`;
  } else if (highLeverageTasks.length > 0) {
    message = "You have high-leverage tasks due soon. Seize the day with purpose!";
  } else if (tasks.length > 0) {
    message = "You have important matters pending. Steady progress prevents chaos.";
  } else {
    message = "The flow of time is calm. No urgent matters cloud your horizon.";
  }

  // 4. Format for Frontend
  // We take the top 3 most critical tasks
  const tasksDisplay = tasks.slice(0, 3).map(task => {
    let dueText = 'No Date';
    if (task.due_date) {
      const date = new Date(task.due_date);
      if (isToday(date)) dueText = 'Due Today';
      else if (isTomorrow(date)) dueText = 'Due Tomorrow';
      else dueText = format(date, 'MMM do');
    }

    return { 
      text: task.title, 
      due: dueText,
      is_urgent: task.is_urgent,     // Needed for Red Styling
      is_important: task.is_important 
    };
  });

  return {
    message,
    tasks: tasksDisplay,
  };
};

/**
 * Generates the Weekly Report Data.
 * Aggregates completed tasks and goal distribution.
 */
const generateWeeklyReport = async (userId) => {
  // 1. Productivity Data (Last 7 Days)
  const productivityQuery = `
    SELECT TO_CHAR(due_date, 'Day') as day_name, COUNT(*) as count
    FROM tasks
    WHERE user_id = $1 
    AND status = 'completed'
    AND due_date > NOW() - INTERVAL '7 days'
    GROUP BY day_name, due_date
    ORDER BY due_date ASC;
  `;
  const prodResult = await pool.query(productivityQuery, [userId]);

  const productivityData = prodResult.rows.map(row => ({
    day: row.day_name.trim().slice(0, 3), // "Monday" -> "Mon"
    tasks: parseInt(row.count)
  }));

  // 2. Goal Distribution Data
  const distQuery = `
    SELECT g.title as name, COUNT(t.id) as value
    FROM tasks t
    JOIN goals g ON t.goal_id = g.id
    WHERE t.user_id = $1 AND t.status = 'completed'
    AND t.due_date > NOW() - INTERVAL '7 days'
    GROUP BY g.title;
  `;
  const distResult = await pool.query(distQuery, [userId]);

  // 3. Summary
  const total = productivityData.reduce((acc, curr) => acc + curr.tasks, 0);
  const summary = `You have completed ${total} tasks this week. Your consistency is building your future.`;

  return {
    summary,
    productivityData,
    distributionData: distResult.rows.map(r => ({ ...r, value: parseInt(r.value) }))
  };
};

module.exports = { generateOracleInsight, generateWeeklyReport };