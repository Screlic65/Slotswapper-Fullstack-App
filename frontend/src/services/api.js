import axios from 'axios';

// Vite exposes env variables on import.meta.env
// The VITE_ prefix is required for security reasons.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
