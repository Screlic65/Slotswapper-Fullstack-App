const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require("socket.io");
const { initSocket, attachSocket } = require('./middleware/socketMiddleware'); // Import the new middleware

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Real-time Logic & Middleware Setup ---
let onlineUsers = {}; // In-memory store for online users
initSocket(io, onlineUsers); // Initialize our middleware with the io instance and user list
app.use(attachSocket); // Apply the middleware to ALL routes. Now req.io is available everywhere.

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('register', (userId) => {
  console.log(`--- REGISTER EVENT RECEIVED ---`);
  console.log(`Attempting to register User ID: ${userId} for Socket ID: ${socket.id}`);
  onlineUsers[userId] = socket.id;
  // This log is crucial. It shows us the state of our user map.
  console.log('CURRENT ONLINE USERS:', JSON.stringify(onlineUsers, null, 2));
});
  socket.on('disconnect', () => {
    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }
    console.log('Online users:', onlineUsers);
  });
});
// --- End Real-time Logic ---

// Route Definitions
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/swaps', require('./routes/swap'));
app.get('/api', (req, res) => res.json({ status: 'active' }));


const db = require('./db'); // Make sure db is required if it's not already

app.get('/api/db-test', async (req, res) => {
    let client;
    try {
        console.log("--- Received request for /api/db-test ---");
        client = await db.pool.connect();
        console.log("Successfully connected to the database!");
        
        const result = await client.query('SELECT NOW()');
        console.log("Successfully executed a test query.");

        res.status(200).json({
            message: "Database connection successful!",
            time: result.rows[0].now,
        });

    } catch (error) {
        console.error("--- DATABASE CONNECTION FAILED in /api/db-test ---");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        console.error("Full Error:", error);
        res.status(500).json({
            message: "Database connection failed!",
            error: {
                code: error.code,
                message: error.message,
            }
        });
    } finally {
        // Ensure the client is always released
        if (client) {
            client.release();
            console.log("Database client released.");
        }
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// We no longer need to export anything from this file
// module.exports = { io, onlineUsers }; // DELETE OR COMMENT OUT THIS LINE