import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // New state variable for the error message
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors before a new attempt

    try {
      await signup(name, email, password);
      alert('Signup successful! Please log in.');
      navigate('/login');
    } catch (err) {
      console.error('Signup failed on the frontend:', err);
      
      // --- THIS IS THE NEW ERROR HANDLING LOGIC ---
      if (err.response && err.response.data) {
        // If the backend sent a specific JSON error message, display it.
        // This could be "Email is already in use." or something else.
        setError(err.response.data.error || err.response.data.msg || 'An unknown error occurred.');
      } else {
        // If there's no response (e.g., network error, CORS error), show a generic message.
        setError('Signup failed. The server could not be reached.');
      }
      // --- END OF NEW LOGIC ---
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        
        {/* Add a placeholder to display the error message */}
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};

export default SignupPage;
