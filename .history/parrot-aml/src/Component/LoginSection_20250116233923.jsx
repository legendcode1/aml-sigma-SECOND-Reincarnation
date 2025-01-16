import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase'; // Import firestore
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import '../StyleSheet/LoginSection.css';

const LoginSection = ({ loginText = "Login", onClick = () => console.log("Login clicked") }) => {
  const [companyName, setCompanyName] = useState("Unknown Company"); // Default value
  const [userName, setUserName] = useState("SIGMA"); // Default value for user's name

  // Fetch user data from Firestore when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      // Get the user ID from localStorage (you can set this during login or authentication)
      const userId = localStorage.getItem('user_id'); // Make sure you save the user ID during login

      if (userId) {
        try {
          // Fetch user data from Firestore
          const userDocRef = doc(firestore, 'users', userId); // Get document reference
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.userName || "SIGMA"); // Set user name if available
            setCompanyName(userData.companyName || "Unknown Company"); // Set company name if available
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="login-section" onClick={onClick}>
      <span className="login-text">{userName} SIGMA from {companyName}</span> {/* Display dynamic user name and company name */}
      <img
        src="/main-interface/login-icon.png"
        alt="Login Icon"
        className="login-icon"
      />
    </div>
  );
};

export default LoginSection;
