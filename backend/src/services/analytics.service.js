const { startOfWeek, endOfWeek, eachDayOfInterval, format, getDay, parseISO } = require('date-fns');

// --- EXPANDED MOCK DATA FOR A FULL WEEK ---
const getWeeklyTasksForUser = async (userId) => {
  // Simulates fetching all completed tasks from the last 7 days
  console.log(`Fetching weekly tasks for user ${userId}...`);
  return [
    // Monday
    { title: 'Task A', estimated_time_minutes: 60, goal: 'Capstone', completed_at: '2025-11-03T10:00:00Z' },
    { title: 'Task B', estimated_time_minutes: 90, goal: 'Personal', completed_at: '2025-11-03T15:00:00Z' },
    // Tuesday
    { title: 'Task C', estimated_time_minutes: 120, goal: 'Capstone', completed_at: '2025-11-04T09:30:00Z' },
    { title: 'Task D', estimated_time_minutes: 30, goal: 'Admin', completed_at: '2025-11-04T11:00:00Z' },
    { title: 'Task E', estimated_time_minutes: 45, goal: 'Personal', completed_at: '2025-11-04T19:00:00Z' },
    // Wednesday
    { title: 'Task F', estimated_time_minutes: 75, goal: 'Capstone', completed_at: '2025-11-05T14:00:00Z' },
    // Thursday
    { title: 'Task G', estimated_time_minutes: 90, goal: 'Admin', completed_at: '2025-11-06T10:00:00Z' },
    { title: 'Task H', estimated_time_minutes: 180, goal: 'Capstone', completed_at: '2025-11-06T13:00:00Z' },
    // Friday
    { title: 'Task I', estimated_time_minutes: 60, goal: 'Personal', completed_at: '2025-11-07T17:00:00Z' },
  ];
};

// ... existing generateOracleInsight function ...

const generateWeeklyReport = async (userId) => {
  const tasks = await getWeeklyTasksForUser(userId);
  
  // 1. Productivity Peaks Analysis
  const productivityByDay = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  tasks.forEach(task => {
    const dayOfWeek = dayMap[getDay(parseISO(task.completed_at))];
    if (productivityByDay[dayOfWeek] !== undefined) {
      productivityByDay[dayOfWeek]++;
    }
  });
  const productivityData = Object.entries(productivityByDay).map(([name, tasks]) => ({ name, tasks }));
  
  // 2. Time Distribution Analysis (by goal)
  const timeByGoal = {};
  tasks.forEach(task => {
    if (!timeByGoal[task.goal]) {
      timeByGoal[task.goal] = 0;
    }
    timeByGoal[task.goal] += task.estimated_time_minutes;
  });
  const distributionData = Object.entries(timeByGoal).map(([name, value]) => ({ name, value }));
  
  // 3. Oracle Summary
  const totalTasks = tasks.length;
  const mostProductiveDay = productivityData.reduce((prev, current) => (prev.tasks > current.tasks) ? prev : current);
  const mainFocus = distributionData.reduce((prev, current) => (prev.value > current.value) ? prev : current);

  const summary = `This week you completed ${totalTasks} tasks! Your most productive day was ${mostProductiveDay.name}, and you dedicated the most time to your "${mainFocus.name}" goal. Keep up the great momentum!`;

  return {
    summary,
    productivityData,
    distributionData,
  };
};

module.exports = { generateOracleInsight, generateWeeklyReport };