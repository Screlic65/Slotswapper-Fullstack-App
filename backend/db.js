const { Pool } = require('pg');
require('dotenv').config();

const connectionConfig = process.env.DATABASE_URL ?
  // Production: Use the connection string from Render's environment
  {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // This is CRUCIAL for Render
    }
  } :
  // Development: Use individual variables for local Docker
  {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  };

const pool = new Pool(connectionConfig);

module.exports = {
  query: (text, params) => pool.query(text, params),
};
