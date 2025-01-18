// src/Component/LoginPage.jsx
import React, { useState } from 'react';
import { loginUser } from '../auth/auth'; // Import the login function
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Import the CSS file

const LoginPage = ({ companyName }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent the form from reloading the page

    try {
      const user = await loginUser(email, password); // Log in the user
      console.log('User logged in:', user);
      navigate('/main'); // Redirect to the main page after login
    } catch (err) {
      setError(err.message); // Display error message if login fails
    }
  };

  return (
    <div className="ImportantMessages">
      <div className="LogoSection">
        <img src="/datum/datum.png" alt="Company Logo" className="CompanyLogo" />
      </div>
      <div className="LoginPadding">
        <form className="LoginSection" onSubmit={handleLogin}> {/* Use a form element */}
          <div className="WelcomeText">{companyName} - Welcome</div> {/* Display company name */}
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
              <button type="submit" className="SubmitButton"> {/* Button inside the form */}
                Log in
              </button>
            </div>
          </div>
        </form>
        {error && <p className="ErrorMessage">{error}</p>} {/* Display error message */}
      </div>
    </div>
  );
};

export default LoginPage;
