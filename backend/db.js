const { Pool } = require('pg');
require('dotenv').config();

// --- Start of Diagnostic Logging ---
console.log("--- DATABASE CONNECTOR (db.js) ---");
console.log("Attempting to read environment variables for DB connection...");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "Exists (not shown for security)" : "MISSING or EMPTY!");
console.log("DB_DATABASE:", process.env.DB_DATABASE);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("------------------------------------");
// --- End of Diagnostic Logging ---

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Add a listener for connection errors on the pool
pool.on('error', (err, client) => {
  console.error('!!! Unexpected error on idle database client !!!', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => {
    // This will log every query before it runs
    // console.log('Executing query:', text, params);
    return pool.query(text, params);
  },
  // Expose the pool itself for a direct connection test
  pool: pool
};