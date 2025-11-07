import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(name, email, password);
      alert('Signup successful! Please log in.');
      navigate('/login');
    } catch (err) {
      console.error('Failed to sign up', err);
      alert('Signup failed! The email might already be in use.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};

export default SignupPage;