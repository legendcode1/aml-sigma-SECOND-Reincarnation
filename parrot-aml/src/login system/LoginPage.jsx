// src/login system/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../auth/auth'; // Import loginUser function
import PropTypes from 'prop-types';
import './LoginPage.css'; // Ensure correct path

/**
 * LoginPage Component
 *
 * Handles user authentication.
 *
 * Props:
 * - companyName (string): The name of the company to display on the login page.
 */
const LoginPage = ({ companyName }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Handle user login
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { user, userData, companyData, chatHistory } = await loginUser(email, password);
      console.log('User logged in:', user);
      // Since App.jsx listens to auth state changes, no need to navigate here
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <h1>Welcome to {companyName}</h1>
      <form onSubmit={handleLogin} className="login-form">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <div className="loading-message">Logging in...</div>
        ) : (
          <button type="submit" className="login-button">
            Login
          </button>
        )}
      </form>
    </div>
  );
};

// Prop type validation
LoginPage.propTypes = {
  companyName: PropTypes.string.isRequired,
};

export default LoginPage;
