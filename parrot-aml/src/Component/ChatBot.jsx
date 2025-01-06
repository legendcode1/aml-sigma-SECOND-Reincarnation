import React from 'react';
import '../StyleSheet/ChatBot.css'; // Import the CSS file
import NewReport from './NewReport';
import SearchResult from '../Component/SearchResult';

const ChatBot = ({ submitted, searchParams, handleInputChange, saveData }) => {
  return (
    <div className="chatbot-container">
      {!submitted ? (
        <NewReport 
          searchParams={searchParams} 
          handleInputChange={handleInputChange} 
          saveData={saveData} 
        />
      ) : (
        <SearchResult name={searchParams.name} />
      )}
    </div>
  );
};

export default ChatBot;
