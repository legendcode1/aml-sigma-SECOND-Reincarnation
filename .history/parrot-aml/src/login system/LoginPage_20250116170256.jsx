import React, { useState } from 'react';
import { loginUser } from '../auth/auth.jsx'; // Import the login function
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Import the CSS file

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const user = await loginUser(email, password);
      console.log('User logged in:', user);
      navigate('/main'); // Redirect to the main page after login
    } catch (err) {
      setError(err.message); // Display error message if login fails
    }
  };

  return (
    <div className="ImportantMessages">
      <div className="LogoSection">
        <img src="parrot-aml\src\assets\datum\datum.png" alt="Company Logo" className="CompanyLogo" />
      </div>
      <div className="LoginPadding">
        <div className="LoginSection">
          <div className="WelcomeText">Welcome</div>
          <div className="Frame34">
            <div className="EmailColumn">
              <label className="EmailAddress">Email Address</label>
              <input
                type="email"
                className="InputField"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="PasswordColumn">
              <label className="Password">Password</label>
              <input
                type="password"
                className="InputField"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="SubmitSection">
              <button type="submit" className="SubmitButton" onClick={handleLogin}>
                Log in
              </button>
            </div>
          </div>
        </div>
        {error && <p className="ErrorMessage">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
