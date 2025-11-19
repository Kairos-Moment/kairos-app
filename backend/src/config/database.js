// By: Jorge Valdes-Santiago
//
//
// This script retrieves the environment variables from the
// local .env file and sets up the resource pool to
// allow the server to communicate with the database.
const path = require('path');
const pg = require("pg"); // import pg from "pg";
// It uses the current working directory from where you ran 'npm run dev'
require('dotenv').config({ path: path.join(process.cwd(), '../.env') });

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE
};

// 5. Conditionally add SSL configuration ONLY for production
if (isProduction) {
  // This block will run when your app is on Render (because NODE_ENV is 'production')
  config.ssl = {
    rejectUnauthorized: false,
  };
}


//export const pool = new pg.Pool(config);
const pool = new pg.Pool(config);
module.exports = { pool };
