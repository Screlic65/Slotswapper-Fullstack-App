// In backend/middleware/socketMiddleware.js
let io;
let onlineUsers;

// This function will be called once from index.js to set our variables
const initSocket = (socketInstance, users) => {
    io = socketInstance;
    onlineUsers = users;
};

// This is the actual middleware function
const attachSocket = (req, res, next) => {
    req.io = io;
    req.onlineUsers = onlineUsers;
    next();
};

module.exports = { initSocket, attachSocket };