// filepath: /c:/Users/Ananta Anugrah/Desktop/aml sigma SECOND Reincarnation/parrot-aml/src/Component/ChatHistory.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getChatMessages } from '../indexedDB'; // Import the function from indexedDB.js
import '../StyleSheet/ChatHistory.css'; // Import the CSS file

const ChatHistory = () => {
  const { chatId } = useParams(); // Get chatId from URL params
  const [chatDetails, setChatDetails] = useState(null); // Store chat details

  useEffect(() => {
    const fetchChatDetails = async () => {
      try {
        const messages = await getChatMessages();
        const chat = messages.find((msg) => msg.id === chatId);
        setChatDetails(chat);
      } catch (error) {
        console.error('Error fetching chat details:', error);
      }
    };

    fetchChatDetails();
  }, [chatId]);

  return (
    <div className="chat-history-container">
      {chatDetails ? (
        <div>
          <h2>{chatDetails.headline}</h2>
          <p>{chatDetails.messages}</p>
        </div>
      ) : (
        <p>Loading chat history...</p>
      )}
    </div>
  );
};

export default ChatHistory;