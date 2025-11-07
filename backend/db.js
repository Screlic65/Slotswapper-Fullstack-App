const { Pool } = require('pg');

// --- TEMPORARY DIAGNOSTIC CODE ---
// We are hardcoding the production URL to bypass all environment variable issues.

const PROD_DATABASE_URL = "postgresql://slotswapper_user:PASSWORD@HOST/slotswapper_hlvw"; // <-- PASTE YOUR RENDER URL HERE

let connectionConfig;

console.log("--- DATABASE CONNECTOR (HARDCODE DIAGNOSTIC) ---");

// This check is now explicit and does not use process.env
if (PROD_DATABASE_URL) {
  console.log("Hardcoded DATABASE_URL found. Forcing production config.");
  connectionConfig = {
    connectionString: PROD_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  };
} else {
    // This block should never be reached in production
    console.log("This should not be happening. Falling back to dev config.");
    connectionConfig = { /* ... dev config ... */ };
}

const pool = new Pool(connectionConfig);

module.exports = {
  query: (text, params) => pool.query(text, params),
};
