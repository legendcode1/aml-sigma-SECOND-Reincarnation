import React, { useEffect, useState } from 'react';
import '../StyleSheet/MainInterface.css'; // Import the CSS file
import ChatBot from './ChatBot'; // Import the ChatBot component
import MainLayout from './MainLayout'; // Import the MainLayout component
import LoginSection from './LoginSection'; // Import the reusable LoginSection component
import { useNavigate } from 'react-router-dom'; // To handle redirection
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Firebase authentication

const MainInterface = ({ submitted, searchParams, handleInputChange, saveData }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Store authenticated user information

  useEffect(() => {
    const auth = getAuth(); // Initialize Firebase authentication
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // If the user is not logged in, redirect to the login page
        navigate('/login');
      } else {
        setUser(currentUser); // Set user data
      }
    });

    return () => unsubscribe(); // Clean up the subscription
  }, [navigate]);

  return (
    <div className="main-interface">
      {/* Login Section */}
      <div className="login-section">
        <LoginSection 
          loginText={user ? `Welcome, ${user.displayName || "User"}` : "Please Log In"}
          onClick={() => console.log("Login section clicked!")}
        />
      </div>

      {/* Main Content */}
      <MainLayout>
        <ChatBot 
          submitted={submitted}
          searchParams={searchParams}
          handleInputChange={handleInputChange}
          saveData={saveData}
        />
      </MainLayout>

      {/* Add other features like dashboard, save to PDF, etc. here */}
    </div>
  );
};

export default MainInterface;
