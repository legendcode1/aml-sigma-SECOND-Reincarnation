import React from 'react';
import '../StyleSheet/LoginSection.css';

const LoginSection = ({ 
  loginText = "Login",
  companyName = "Unknown Company",  // Default value for companyName
  onClick = () => console.log("Login clicked")
}) => {
  return (
    <div className="login-section">
      <span className="login-text">{loginText}</span>
      <img 
        src="https://dashboard.codeparrot.ai/api/assets/Z2vC-I6CYQNjI8la" 
        alt="Login Icon" 
        className="login-icon"
      />
      <div className="company-name">{companyName}</div> {/* Display the company name */}
    </div>
  );
};

export default LoginSection;
