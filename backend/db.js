const { Pool } = require('pg');
require('dotenv').config();

// Determine if we are in production by checking the NODE_ENV variable
const isProduction = process.env.NODE_ENV === 'production';

console.log(`--- DATABASE CONNECTOR ---`);
console.log(`Running in production mode: ${isProduction}`);

const connectionConfig = isProduction ?
  // --- PRODUCTION CONFIGURATION ---
  // Use the connection string from Render's environment
  {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Render connections
    }
  } :
  // --- DEVELOPMENT CONFIGURATION ---
  // Use individual variables for local Docker setup
  {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  };

if (isProduction) {
  console.log("Using DATABASE_URL for connection.");
} else {
  console.log("Using local DB variables for connection. Host:", connectionConfig.host);
}

const pool = new Pool(connectionConfig);

module.exports = {
  query: (text, params) => pool.query(text, params),
};
