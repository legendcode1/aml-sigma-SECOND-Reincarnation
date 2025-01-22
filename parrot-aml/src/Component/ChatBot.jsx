import React, { useState, useEffect } from 'react';
import '../StyleSheet/ChatBot.css';
import NewReport from './NewReport';
import SearchResult from './SearchResult';
import { addChatMessage, getChatMessages } from '../indexedDB'; // Import IndexedDB utility

const ChatBot = ({ submitted, searchParams, handleInputChange, saveData }) => {
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

  return (
    <div className="chatbot-container">
      {!submitted ? (
        <NewReport 
          searchParams={searchParams} 
          handleInputChange={handleInputChange} 
          saveData={() => {
            saveData();
            saveMessage(searchParams); // Save to IndexedDB on submit
          }} 
        />
      ) : (
        <SearchResult name={searchParams.name} />
      )}
    </div>
  );
};

export default ChatBot;