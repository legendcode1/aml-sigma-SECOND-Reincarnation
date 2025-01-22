// filepath: /c:/Users/Ananta Anugrah/Desktop/aml sigma SECOND Reincarnation/parrot-aml/src/Component/LoginSection.jsx
import React, { useEffect, useState } from 'react';
import '../StyleSheet/LoginSection.css';

const LoginSection = ({ loginText = "Login", onClick = () => console.log("Login clicked"), onReset }) => {
  const [companyName, setCompanyName] = useState("Unknown Company");
  const [userName, setUserName] = useState("SIGMA");

  // Fetch user data from localStorage when the component mounts
  useEffect(() => {
    const storedUserName = localStorage.getItem('user_name');
    const storedCompanyName = localStorage.getItem('company_name');

    // Log values for debugging
    console.log("Stored userName:", storedUserName);
    console.log("Stored companyName:", storedCompanyName);

    if (storedUserName) {
      setUserName(storedUserName); // Update user name if available
    }

    if (storedCompanyName) {
      setCompanyName(storedCompanyName); // Update company name if available
    }
  }, []);

  return (
    <div className="login-section" onClick={onClick}>
      <span className="login-text">{userName} from {companyName}</span> {/* Display dynamic userName and companyName */}
      <button className="reset-button" onClick={onReset}>Reset</button>
    </div>
  );
};

export default LoginSection;