// A (mock) database client. In a real app, this would connect to your database.
// For now, we'll use a mock function to simulate fetching tasks.
const getTasksForUser = async (userId) => {
    // TODO: Replace this with a real SQL query to your 'Tasks' table
    // SELECT * FROM Tasks WHERE user_id = $1 AND status = 'pending';
    console.log(`Fetching tasks for user ${userId}...`);
    return [
      { title: 'Finalize Project Proposal', is_important: true, due_date: new Date() },
      { title: 'Review Q3 Report', is_important: true, due_date: new Date() },
      { title: 'Schedule Team Brainstorm', is_important: true, due_date: new Date(Date.now() + 86400000) }, // Tomorrow
      { title: 'Book flight tickets', is_important: false, due_date: new Date() },
    ];
  };
  
  const generateOracleInsight = async (userId) => {
    const tasks = await getTasksForUser(userId);
    const today = new Date().setHours(0, 0, 0, 0);
    const tomorrow = new Date(today + 86400000).setHours(0, 0, 0, 0);
  
    // 1. Find high-leverage tasks
    const highLeverageTasks = tasks.filter(task => {
      const taskDueDate = new Date(task.due_date).setHours(0, 0, 0, 0);
      return task.is_important && (taskDueDate === today || taskDueDate === tomorrow);
    });
  
    // 2. Generate a personalized message
    let message = "Let's make today a productive one!";
    if (highLeverageTasks.length > 2) {
      message = "You have some important tasks ahead. Seize the day with purpose!";
    } else if (highLeverageTasks.length > 0) {
      message = "Focus on these high-leverage tasks to make today truly impactful.";
    } else {
      message = "It looks like a clear day. A great opportunity to plan ahead or tackle smaller items!";
    }
  
    // 3. Format the tasks for the frontend
    const formattedTasks = highLeverageTasks.slice(0, 3).map(task => {
        const taskDueDate = new Date(task.due_date).setHours(0, 0, 0, 0);
        let dueText = 'Due Soon';
        if (taskDueDate === today) dueText = 'Due Today';
        if (taskDueDate === tomorrow) dueText = 'Due Tomorrow';
        return { text: task.title, due: dueText };
    });
  
    return {
      message,
      tasks: formattedTasks,
    };
  };
  
  module.exports = { generateOracleInsight };