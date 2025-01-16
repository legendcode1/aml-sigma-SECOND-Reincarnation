import React from 'react';
import '../StyleSheet/LoginSection.css';

const LoginSection = ({ 
  loginText = "Login",
  companyName = "Unknown Company",  // Default value for companyName
  onClick = () => console.log("Login clicked")
}) => {
  return (
    <div className="login-section">
      <span className="login-text">{loginText}SIGMA</span>
      <H1>SIGMA SKIBIDI</H1>
      <img 
        src="/main-interface/login-icon.png" 
        alt="Login Icon" 
        className="login-icon"
      />
      <div className="company-name">{companyName}</div> {/* Display the company name */}
    </div>
  );
};

export default LoginSection;
