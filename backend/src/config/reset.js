// By: Jorge Valdes-Santiago
//
//
// This script contains the functions to create the databases
// it can be executed by running "npm run reset" in the terminal open in the "backend" directory
const { pool } = require("./database.js"); //import { pool } from "./database.js";
require("./dotenv.js"); //import "./dotenv.js"
//import fs from "fs";

const tableCreationQueries = {
  // NOTE: The following is preferred for creating unique integer ids in newer versions of postgresql:
  // id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY
  users: `CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    username varchar(100) NOT NULL,
    email varchar(100) NOT NULL,
    password_hash varchar(255) NOT NULL,
    created_at timestamp NOT NULL
  );`,

  goals: `CREATE TABLE IF NOT EXISTS goals (
    id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users(id),
    title varchar(100) NOT NULL,
    description text NOT NULL DEFAULT '',
    status varchar(50) NOT NULL,
    target_date timestamp NOT NULL,
    created_at timestamp NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );`,

  habits: `CREATE TABLE IF NOT EXISTS habits (
    id serial PRIMARY KEY,
    user_id integer NOT NULL,
    title varchar(100) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    frequency integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );`,

  tasks: `CREATE TABLE IF NOT EXISTS tasks (
    id serial PRIMARY KEY,
    user_id integer NOT NULL,
    goal_id integer NOT NULL,
    title varchar(100) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    is_urgent boolean NOT NULL DEFAULT false,
    is_important boolean NOT NULL DEFAULT false,
    target_date timestamp NOT NULL,
    est_time_minutes time NOT NULL,
    status varchar(50) NOT NULL,
    created_at timestamp NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(goal_id) REFERENCES goals(id)
  );`,

  sessions: `CREATE TABLE IF NOT EXISTS focus_sessions (
    id serial PRIMARY KEY,
    user_id integer NOT NULL,
    task_id integer NOT NULL,
    start_time timestamp NOT NULL,
    end_time timestamp NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(task_id) REFERENCES tasks(id)
  );`,

  logs: `CREATE TABLE IF NOT EXISTS habit_logs (
    id serial PRIMARY KEY,
    habit_id INTEGER NOT NULL,
    completion_date timestamp NOT NULL,
    notes text DEFAULT '',
    FOREIGN KEY(habit_id) REFERENCES habits(id)
  );`,
};

// Base function
const createTable = async (query, tableName) => {
  const sqlQuery = query;

  try {
    // Send query to the database and wait for a response
    const response = await pool.query(sqlQuery);
  } catch (err) {
    console.error(`⚠️ Error creating ${tableName} table: ${err}`);
  }

  const response = await pool.query(sqlQuery); // Generate
};

//----------------------------------//
//--   Table creation functions   --//
//----------------------------------//
const createUsersTable = async () => {
  createTable(tableCreationQueries.users, "Users");
};

const createGoalsTable = async () => {
  createTable(tableCreationQueries.goals, "Goals");
};

const createHabitsTable = async () => {
  createTable(tableCreationQueries.habits, "Habits");
};

const createTasksTable = async () => {
  createTable(tableCreationQueries.tasks, "Tasks");
};

// For focus sessions
const createSessionsTable = async () => {
  createTable(tableCreationQueries.sessions, "Focus Sessions");
};

// for habit logs
const createLogTable = async () => {
  createTable(tableCreationQueries.logs, "Habit Logs");
};

createUsersTable();
createGoalsTable();
createHabitsTable();
createTasksTable();
createSessionsTable();
createLogTable();
