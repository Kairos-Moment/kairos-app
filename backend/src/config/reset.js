// backend/src/config/reset.js

// 1. Import necessary modules
const path = require('path');

// 2. CRITICAL: Load the .env file.
// Since the 'reset' script runs from the 'backend/' directory, we go up one level.
require('dotenv').config({ path: path.join(process.cwd(), '../.env') });

// 3. Import the pool AFTER dotenv has been configured.
const { pool } = require("./database.js");

// All SQL queries in one place for clarity
const SQL_QUERIES = {
  // DROP queries in REVERSE order of creation
  dropFocusSessions: `DROP TABLE IF EXISTS focus_sessions;`,
  dropHabitLogs: `DROP TABLE IF EXISTS habit_logs;`,
  dropTasks: `DROP TABLE IF EXISTS tasks;`,
  dropHabits: `DROP TABLE IF EXISTS habits;`,
  dropGoals: `DROP TABLE IF EXISTS goals;`,
  dropUsers: `DROP TABLE IF EXISTS users;`,

  // CREATE queries in the CORRECT order of creation
  createUsers: `CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  createGoals: `CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT DEFAULT '',
    status VARCHAR(50),
    target_date TIMESTAMP
  );`,
  createHabits: `CREATE TABLE habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT DEFAULT '',
    frequency INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  createTasks: `CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id INTEGER REFERENCES goals(id) ON DELETE SET NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT DEFAULT '',
    is_urgent BOOLEAN DEFAULT false,
    is_important BOOLEAN DEFAULT false,
    due_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending'
  );`,
  createHabitLogs: `CREATE TABLE habit_logs (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    completion_date TIMESTAMP NOT NULL,
    notes TEXT DEFAULT ''
  );`,
  createFocusSessions: `CREATE TABLE focus_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL
  );`,

  // SEED data queries
  seedUsers: `INSERT INTO users (username, email, password_hash) VALUES ('Jane Doe', 'jane.doe@example.com', 'some_hashed_password_here');`,
  seedGoals: `INSERT INTO goals (user_id, title) VALUES (1, 'Complete Capstone Project');`,
  seedTasks: `INSERT INTO tasks (user_id, goal_id, title, is_important) VALUES (1, 1, 'Write project documentation', true);`
};

// Create a single async function to control the flow
const resetDatabase = async () => {
  try {
    console.log("-> Dropping all tables...");
    await pool.query(SQL_QUERIES.dropFocusSessions);
    await pool.query(SQL_QUERIES.dropHabitLogs);
    await pool.query(SQL_QUERIES.dropTasks);
    await pool.query(SQL_QUERIES.dropHabits);
    await pool.query(SQL_QUERIES.dropGoals);
    await pool.query(SQL_QUERIES.dropUsers);
    console.log("✅ All tables dropped successfully.");

    console.log("\n-> Creating tables in order...");
    await pool.query(SQL_QUERIES.createUsers);
    console.log("   - Users table created.");
    await pool.query(SQL_QUERIES.createGoals);
    console.log("   - Goals table created.");
    await pool.query(SQL_QUERIES.createHabits);
    console.log("   - Habits table created.");
    await pool.query(SQL_QUERIES.createTasks);
    console.log("   - Tasks table created.");
    await pool.query(SQL_QUERIES.createHabitLogs);
    console.log("   - Habit Logs table created.");
    await pool.query(SQL_QUERIES.createFocusSessions);
    console.log("   - Focus Sessions table created.");
    console.log("✅ All tables created successfully.");

    console.log("\n-> Seeding database with initial data...");
    await pool.query(SQL_QUERIES.seedUsers);
    await pool.query(SQL_QUERIES.seedGoals);
    await pool.query(SQL_QUERIES.seedTasks);
    console.log("✅ Database seeded successfully.");

  } catch (error) {
    console.error("❌ An error occurred during the database reset:", error);
  } finally {
    // IMPORTANT: Close the connection pool so the script can exit
    await pool.end();
    console.log("\n-> Connection pool closed. Script finished.");
  }
};

// Run the main function
resetDatabase();