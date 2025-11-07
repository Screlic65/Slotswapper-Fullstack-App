const express = require('express');
const cors = require('cors');
require('dotenv').config();
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

// --- Start the Server ---
server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
