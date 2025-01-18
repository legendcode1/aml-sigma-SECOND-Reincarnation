import React from 'react';
import '../StyleSheet/MainInterface.css'; // Import the CSS file
import ChatBot from './ChatBot'; // Import the ChatBot component
import MainLayout from './MainLayout'; // Import the MainLayout component

const MainInterface = ({ submitted, searchParams, handleInputChange, saveData }) => {
  return (
    <div className="main-interface">
      <div className="login-section">
        <img 
          src="https://dashboard.codeparrot.ai/api/assets/Z2nNMY6CYQNjI8Wf" 
          alt="Login" 
          className="login-image" 
        />
      </div>
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
