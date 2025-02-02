// src/Component/ChatHistory.jsx

import React, { useState, useEffect, useRef } from 'react';
import '../StyleSheet/ChatHistory.css';
import { db } from '../firebase/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';

/**
 * ChatHistory Component
 *
 * Displays the chat history for a specific chat session.
 *
 * Props:
 * - clientId (string): The unique identifier for the client/company.
 */
const ChatHistory = ({ clientId }) => {
  const { chatId } = useParams(); // Retrieve chatId from URL
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const messagesEndRef = useRef(null); // Reference to the end of messages

  /**
   * Fetch chat messages from Firestore
   */
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!chatId) {
          throw new Error('Chat ID is missing.');
        }

        // Reference to the 'messages' subcollection
        const messagesCollectionRef = collection(
          db,
          'client',
          clientId,
          'chat_history',
          chatId,
          'messages'
        );

        // Query to order messages by timestamp ascending
        const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'));
        const querySnapshot = await getDocs(q);
        const msgs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMessages(msgs);
        setLoading(false);
      } catch (e) {
        console.error('Error fetching messages:', e);
        setError(e.message || 'Failed to load chat history.');
        setLoading(false);
      }
    };

    if (clientId && chatId) {
      fetchMessages();
    } else {
      setError('Chat ID or Client ID is missing.');
      setLoading(false);
    }
  }, [chatId, clientId]);

  /**
   * Scroll to the bottom when messages change
   */
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (loading) {
    return <div className="loading-messages">Loading chat messages...</div>;
  }

  if (error) {
    return <div className="error-messages">{error}</div>;
  }

  return (
    <div className="chat-history-container">
      <div className="chat-section-padding">
        <div className="chat-section">
          <h1 className="chat-title">Chat History</h1>
        </div>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${msg.sender === 'api' ? 'api-message' : 'user-message'}`}
          >
            <ReactMarkdown className="description-text">{msg.content}</ReactMarkdown>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Dummy div to scroll into view */}
      </div>
    </div>
  );
};

// Prop type validation
ChatHistory.propTypes = {
  clientId: PropTypes.string.isRequired,
};

export default ChatHistory;
