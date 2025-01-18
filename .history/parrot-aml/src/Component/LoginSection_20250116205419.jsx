import React from 'react';
import '../StyleSheet/LoginSection.css';

const LoginSection = ({ 
  loginText = "Login",
  companyName = "Unknown Company",  // Default value for companyName
  onClick = () => console.log("Login clicked")
}) => {
  return (
    <div className="login-section" onClick={onClick}>
      <span className="login-text">{loginText} SIGMA</span> {/* Added space between `loginText` and `SIGMA` */}
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

