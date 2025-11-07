const { Pool } = require('pg');

// NOTE: We no longer require('dotenv').config() here at all.

let connectionConfig;

// This is the most direct check. Does the DATABASE_URL environment variable exist and have a value?
if (process.env.DATABASE_URL) {
  // --- PRODUCTION CONFIGURATION ---
  connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  };
} else {
  // --- DEVELOPMENT CONFIGURATION ---
  connectionConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  };
}

const pool = new Pool(connectionConfig);

module.exports = {
  query: (text, params) => pool.query(text, params),
};
