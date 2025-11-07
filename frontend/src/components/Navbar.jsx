import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import socket from '../services/socket'; // Import the socket
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
  if (user) {
    const handleNewRequest = (data) => {
      alert(`NEW NOTIFICATION: ${data.message}`);
      
      // --- THIS IS THE NEW LINE ---
      // Dispatch a custom event that other components can listen for.
      window.dispatchEvent(new Event('requestsUpdated'));
    };
    socket.on('new_request', handleNewRequest);

    const handleRequestResponse = (data) => {
      alert(`NOTIFICATION: ${data.message}`);
      
      // Also dispatch the event here, because a response also changes the request list.
      window.dispatchEvent(new Event('requestsUpdated'));
    };
    socket.on('request_response', handleRequestResponse);
  }

  return () => {
    socket.off('new_request');
    socket.off('request_response');
  };
}, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // If there is no user, we are on the login/signup page, so render nothing.
  if (!user) {
    return null;
  }

  // *** THIS IS THE CORRECTED RETURN STATEMENT ***
  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/dashboard" className="navbar-link">Dashboard</Link>
        <Link to="/marketplace" className="navbar-link">Marketplace</Link>
        <Link to="/requests" className="navbar-link">Requests</Link>
      </div>
      <div className="navbar-user">
        {/* This part was missing */}
        <span>Welcome, {user.name}!</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;