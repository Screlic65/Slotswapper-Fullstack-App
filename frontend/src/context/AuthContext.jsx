import React, { createContext, useState, useEffect } from 'react';
import socket from '../services/socket';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthContext: useEffect running to check localStorage.");
    try {
      const token = localStorage.getItem('token');
      const userString = localStorage.getItem('user');

      if (token && userString && userString !== 'undefined') {
        console.log("AuthContext: Found token and userString in localStorage.");
        const userData = JSON.parse(userString);
        api.defaults.headers.common['x-auth-token'] = token;
        setUser(userData);
        console.log("AuthContext: User state has been set.", userData);
      } else {
        console.log("AuthContext: No valid token/user found in localStorage.");
      }
    } catch (error) {
      console.error("AuthContext: Failed to parse user data, clearing storage.", error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log("AuthContext: Attempting login...");
      const res = await api.post('/auth/login', { email, password });

      if (res.data.token && res.data.user) {
        console.log("AuthContext: Login successful. Received token and user.", res.data);
        
        // Store data
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        // Set axios header
        api.defaults.headers.common['x-auth-token'] = res.data.token;
        
        // Set state
        setUser(res.data.user);
        
            // Connect the socket and register the user with the server
        socket.connect();
        socket.emit('register', res.data.user.id);
        console.log("AuthContext: Emitted 'register' event for user:", res.data.user.id);
                
        // Return a success signal
        return true; 
      } else {
        console.error("AuthContext: Login response missing token or user data.");
        return false;
      }
    } catch (error) {
      console.error("AuthContext: Login API call failed.", error.response?.data || error.message);
      // Re-throw the error so the component knows it failed
      throw error;
    }
  };

  const logout = () => {
    console.log("AuthContext: Logging out.");
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['x-auth-token'];
    setUser(null);
    socket.disconnect();
    console.log("AuthContext: Socket disconnected.");
  };

  const signup = async (name, email, password) => {
    await api.post('/auth/signup', { name, email, password });
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;