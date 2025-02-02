// src/Component/ChatBot.jsx

import React, { useState, useEffect } from 'react';
import '../StyleSheet/ChatBot.css';
import NewReport from './NewReport';
import SearchResult from './SearchResult';
import { addChatMessage, getChatMessages } from '../indexedDB'; // Import IndexedDB utility
import PropTypes from 'prop-types'; // For prop type validation

const ChatBot = ({ submitted, searchParams, handleInputChange, saveData, clientId, chatId }) => {
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    // Fetch existing chat messages from IndexedDB on load
    const fetchChatHistory = async () => {
      const messages = await getChatMessages();
      setChatHistory(messages);
    };
    fetchChatHistory();
  }, []);

  const saveMessage = async (message) => {
    await addChatMessage(message); // Save to IndexedDB
    setChatHistory((prev) => [...prev, message]); // Update local state
  };

  // Updated saveData function to pass data and chatId
  const handleSaveData = async (data) => {
    try {
      await saveData(data, chatId);
      await saveMessage(data); // Save to IndexedDB on submit
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  return (
    <div className="chatbot-container">
      {!submitted ? (
        <NewReport 
          searchParams={searchParams} 
          handleInputChange={handleInputChange} 
          saveData={handleSaveData} 
          clientId={clientId}
          chatId={chatId}
        />
      ) : (
        <SearchResult name={searchParams.name} />
      )}
    </div>
  );
};

ChatBot.propTypes = {
  submitted: PropTypes.bool.isRequired,
  searchParams: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  saveData: PropTypes.func.isRequired,
  clientId: PropTypes.string.isRequired,
  chatId: PropTypes.string.isRequired,
};

export default ChatBot;
