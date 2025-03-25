// src/login system/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../auth/auth';
import PropTypes from 'prop-types';
import './LoginPage.css';

const LoginPage = ({ companyName }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { user } = await loginUser(email, password);
      console.log('User logged in:', user.uid);
      // Navigation handled by App.jsx
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ImportantMessages">
      <div className="LogoSection">
        <img src="/logo.png" alt="Company Logo" className="CompanyLogo" /> {/* Add your logo */}
      </div>
      <div className="LoginPadding">
        <h1 className="WelcomeText">Welcome to {companyName}</h1>
        <form onSubmit={handleLogin} className="LoginSection">
          <div className="Frame34">
            <div className="EmailColumn">
              <label htmlFor="email" className="EmailAddress">Email Address</label>
              <input
                type="email"
                id="email"
                className="InputField"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="PasswordColumn">
              <label htmlFor="password" className="Password">Password</label>
              <input
                type="password"
                id="password"
                className="InputField"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            {error && <div className="ErrorMessage">{error}</div>}
            <div className="SubmitSection">
              <button
                type="submit"
                className="SubmitButton"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

LoginPage.propTypes = {
  companyName: PropTypes.string.isRequired,
};

export default LoginPage;