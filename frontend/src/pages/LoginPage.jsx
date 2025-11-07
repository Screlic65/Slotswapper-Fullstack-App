import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State for error messages
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      // The login function now throws an error on failure, which we catch
      await login(email, password);
      console.log("LoginPage: Login context function finished successfully.");
      
      // If login is successful, navigate to dashboard
      navigate('/dashboard');

    } catch (err) {
      console.error('LoginPage: Login failed.', err);
      // Set a user-friendly error message
      setError('Login failed. Please check your email and password.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        
        {/* Display the error message if it exists */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
    </div>
  );
};

export default LoginPage;