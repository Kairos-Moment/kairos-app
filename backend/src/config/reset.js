// backend/src/config/reset.js

const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '../.env') });
const { pool } = require("./database.js");

const resetDatabase = async () => {
  try {
    console.log("--- Starting Database Reset ---");
    const client = await pool.connect();
    console.log("✅ Database connection successful.");

    // --- STEP 1: DROP existing tables ---
    console.log("\n-> Dropping all existing tables...");
    await client.query(`
      DROP TABLE IF EXISTS focus_sessions;
      DROP TABLE IF EXISTS habit_logs;
      DROP TABLE IF EXISTS tasks;
      DROP TABLE IF EXISTS habits;
      DROP TABLE IF EXISTS goals;
      DROP TABLE IF EXISTS users;
    `);
    console.log("✅ All tables dropped successfully.");

    // --- STEP 2: CREATE tables ---
    console.log("\n-> Creating all tables...");
    await client.query(`
      -- CORRECTED Users Table for GitHub OAuth
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        githubid INTEGER UNIQUE NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        avatarurl TEXT,
        accesstoken TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Other tables remain the same, referencing users(id)
      CREATE TABLE goals ( id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, title VARCHAR(100) NOT NULL, description TEXT DEFAULT '', status VARCHAR(50) DEFAULT 'in_progress', target_date TIMESTAMP WITH TIME ZONE );
      CREATE TABLE habits ( id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, title VARCHAR(100) NOT NULL, description TEXT DEFAULT '', frequency INTEGER DEFAULT 1, is_active BOOLEAN DEFAULT true );
      CREATE TABLE tasks ( id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, goal_id INTEGER REFERENCES goals(id) ON DELETE SET NULL, title VARCHAR(100) NOT NULL, description TEXT DEFAULT '', is_urgent BOOLEAN DEFAULT false, is_important BOOLEAN DEFAULT false, due_date TIMESTAMP WITH TIME ZONE, status VARCHAR(50) DEFAULT 'pending' );
      CREATE TABLE habit_logs ( id SERIAL PRIMARY KEY, habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE, completion_date DATE NOT NULL, notes TEXT DEFAULT '' );
      CREATE TABLE focus_sessions ( id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE, start_time TIMESTAMP WITH TIME ZONE NOT NULL, duration_minutes INTEGER NOT NULL );
    `);
    console.log("✅ All tables created successfully.");

    // --- STEP 3: SEED the database ---
    console.log("\n-> Seeding database with initial data...");
    await client.query(`
      -- CORRECTED Seeding for a sample GitHub user
      -- This user will have id = 1
      INSERT INTO users (githubid, username, avatarurl, accesstoken) VALUES
      (12345, 'testuser', 'https://avatars.githubusercontent.com/u/12345?v=4', 'mock_github_access_token_string');

      -- Other seed data can still reference user_id=1
      INSERT INTO goals (user_id, title, description) VALUES (1, 'Complete Capstone Project', 'Finish all features, documentation, and presentation for the capstone.');
      INSERT INTO tasks (user_id, goal_id, title, is_important) VALUES (1, 1, 'Write project documentation', true);
      INSERT INTO habits (user_id, title) VALUES (1, 'Read for 20 minutes');
    `);
    console.log("✅ Database seeded successfully.");

    client.release();
    console.log("\n--- Database Reset Complete ---");

  } catch (error) {
    console.error("\n❌ An error occurred during the database reset:", error);
  } finally {
    await pool.end();
    console.log("\n-> Database connection pool closed.");
  }
};

resetDatabase();