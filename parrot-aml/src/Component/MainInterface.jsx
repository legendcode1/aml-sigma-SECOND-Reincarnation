// filepath: /c:/Users/Ananta Anugrah/Desktop/aml sigma SECOND Reincarnation/parrot-aml/src/Component/MainInterface.jsx
import React, { useEffect, useState } from 'react';
import '../StyleSheet/MainInterface.css'; // Import the CSS file
import ChatBot from './ChatBot'; // Import the ChatBot component
import MainLayout from './MainLayout'; // Import the MainLayout component
import LoginSection from './LoginSection'; // Import the reusable LoginSection component
import ChatHistory from './ChatHistory'; // Import the ChatHistory component
import { useNavigate, useParams } from 'react-router-dom'; // To handle redirection and params
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Firebase authentication

const MainInterface = ({ submitted, searchParams, handleInputChange, saveData, resetApp }) => {
  const navigate = useNavigate();
  const { chatId } = useParams(); // Get chatId from URL params
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
    <MainLayout>
      {/* Login Section */}
      <div className="login-section">
        <LoginSection 
          loginText={user ? `Welcome, ${user.displayName || "User"}` : "Please Log In"}
          onClick={() => console.log("Login section clicked!")}
          onReset={resetApp} // Pass the resetApp function
        />
      </div>

      {/* Main Content */}
      {chatId ? (
        <ChatHistory />
      ) : (
        <ChatBot 
          submitted={submitted}
          searchParams={searchParams}
          handleInputChange={handleInputChange}
          saveData={saveData}
        />
      )}

      {/* Add other features like dashboard, save to PDF, etc. here */}
    </MainLayout>
  );
};

export default MainInterface;