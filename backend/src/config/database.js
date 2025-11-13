// By: Jorge Valdes-Santiago
//
//
// This script retrieves the environment variables from the
// local .env file and sets up the resource pool to
// allow the server to communicate with the database.
const pg = require("pg"); // import pg from "pg";
require("./dotenv.js"); //import "./dotenv.js";

const config = {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
};

//export const pool = new pg.Pool(config);
const pool = new pg.Pool(config);
module.exports = { pool };
