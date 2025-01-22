import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getChatMessages } from '../indexedDB'; // Import the function from indexedDB.js
import '../StyleSheet/ChatHistory.css'; // Import the CSS file

const ChatHistory = () => {
  const { chatId } = useParams(); // Get chatId from URL params
  const [chatDetails, setChatDetails] = useState(null); // Store chat details
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track error state

  useEffect(() => {
    const fetchChatDetails = async () => {
      try {
        const messages = await getChatMessages();
        const chat = messages.find((msg) => msg.id === chatId);
        setChatDetails(chat);
      } catch (error) {
        console.error('Error fetching chat details:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatDetails();
  }, [chatId]);

  if (loading) {
    return <p>Loading chat history...</p>;
  }

  if (error) {
    return <p>Error loading chat history: {error.message}</p>;
  }

  if (!chatDetails) {
    return <p>No chat history found for this chat.</p>;
  }

  return (
    <div className='chat-history-container'>
      <h2 className='name-title'>{chatDetails.headline}</h2>
      <div className="description-container">
        <div>
          <p className='description-text'>{chatDetails.messages}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;