import { io } from 'socket.io-client';

// Get the base API URL from the environment variables, just like in api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// The WebSocket URL is the base part of the API URL, without the "/api"
const SOCKET_URL = API_URL.replace("/api", "");

console.log(`Attempting to connect WebSocket to: ${SOCKET_URL}`);

// Create the socket instance with the correct production or development URL
const socket = io(SOCKET_URL, {
    autoConnect: false // We will manually connect after login
});

export default socket;
