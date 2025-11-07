import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Page Components
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import RequestsPage from './pages/RequestsPage';

// Import Layout & Helper Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* PROTECTED ROUTES */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
          <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;