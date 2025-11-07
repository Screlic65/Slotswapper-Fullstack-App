const express = require('express');
const cors = require('cors');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const http = require('http');
const { Server } = require("socket.io");
const { initSocket, attachSocket } = require('./middleware/socketMiddleware');

const app = express();
const server = http.createServer(app);

// --- CORS Configuration ---
// Define which origins are allowed to connect.
const allowedOrigins = [
  'http://localhost:5173',     // Your local frontend for development
  process.env.FRONTEND_URL     // Your deployed Vercel frontend URL (from environment variables)
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman, mobile apps, or server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from your origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};

// --- Socket.IO Server Setup ---
const io = new Server(server, {
  cors: corsOptions // Use the same CORS options for WebSockets
});

const PORT = process.env.PORT || 5000;

// --- Global Middleware ---
app.use(cors(corsOptions)); // Use the CORS options for all HTTP requests
app.use(express.json());

// --- Real-time Logic & Socket Middleware ---
let onlineUsers = {}; // In-memory store for online users
initSocket(io, onlineUsers); // Initialize middleware with the io instance
app.use(attachSocket); // Apply middleware to make req.io available everywhere

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('register', (userId) => {
    console.log(`Registering User ID: ${userId} for Socket ID: ${socket.id}`);
    onlineUsers[userId] = socket.id;
    console.log('CURRENT ONLINE USERS:', JSON.stringify(onlineUsers));
  });

  socket.on('disconnect', () => {
    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        console.log(`User ${userId} disconnected. Remaining users:`, JSON.stringify(onlineUsers));
        break;
      }
    }
  });
});
// --- End Real-time Logic ---

// --- API Route Definitions ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/swaps', require('./routes/swap'));

// --- Root / Health Check Route ---
app.get('/api', (req, res) => {
  res.json({ status: 'active', message: 'Welcome to the SlotSwapper API!' });
});


// --- TEMPORARY ENVIRONMENT DEBUG ROUTE ---
app.get('/api/debug-env', (req, res) => {
    console.log("--- DEBUG: /api/debug-env endpoint hit ---");
    // Log to the console for real-time viewing
    console.log(process.env);
    
    // Also send as a response to view in the browser
    res.status(200).json({
        message: "Current Process Environment Variables",
        // Filter to show only our relevant variables
        relevant_vars: {
            NODE_ENV: process.env.NODE_ENV,
            DATABASE_URL: process.env.DATABASE_URL ? "Exists" : "MISSING",
            FRONTEND_URL: process.env.FRONTEND_URL,
            JWT_SECRET: process.env.JWT_SECRET ? "Exists" : "MISSING",
            DB_HOST: process.env.DB_HOST,
            DB_USER: process.env.DB_USER
        },
        all_vars: process.env // Send everything just in case
    });
});

// --- Start the Server ---
server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
