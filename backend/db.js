const { Pool } = require('pg');
require('dotenv').config();

const connectionConfig = process.postgresql://slotswapper_user:l2RZlHMU30jFqPUCt2bYxrTc9DuRdUMH@dpg-d46thsqdbo4c739h5rkg-a/slotswapper_hlvw ?
  // Production: Use the connection string from Render's environment
  {
    connectionString: process.postgresql://slotswapper_user:l2RZlHMU30jFqPUCt2bYxrTc9DuRdUMH@dpg-d46thsqdbo4c739h5rkg-a/slotswapper_hlvw,
    ssl: {
      rejectUnauthorized: false
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
