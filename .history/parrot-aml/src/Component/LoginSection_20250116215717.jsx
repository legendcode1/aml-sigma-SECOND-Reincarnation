import React, { useEffect, useState } from 'react';
import '../StyleSheet/LoginSection.css';

const LoginSection = ({ 
  loginText = "Login",
  onClick = () => console.log("Login clicked")
}) => {
  const [companyName, setCompanyName] = useState("Unknown Company"); // Default value

  // Fetch companyName from localStorage when the component mounts
  useEffect(() => {
    const storedCompanyName = localStorage.getItem('company_name');
    if (storedCompanyName) {
      setCompanyName(storedCompanyName); // Update state with the stored company name
    }
  }, []);

  return (
    <div className="login-section" onClick={onClick}>
      <span className="login-text">{loginText} SIGMA from {companyName}</span> {/* Display dynamic companyName */}
      <img 
        src="/main-interface/login-icon.png" 
        alt="Login Icon" 
        className="login-icon"
      />
    </div>
  );
};

export default LoginSection;
