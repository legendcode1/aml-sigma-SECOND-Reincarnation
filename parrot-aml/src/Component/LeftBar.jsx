import React, { useState, useEffect } from 'react';
import '../StyleSheet/LeftBar.css';
import { Link, useNavigate } from 'react-router-dom';
import { loadChatMessagesFirestore } from '../indexedDB';
import { fetchChatHistoryByCompanyID } from '../auth/auth';
import PropTypes from 'prop-types';
import ChatHistoryList from './ChatHistoryList';

import plusIcon from '/leftbar/plus.svg';
import datum from '/leftbar/datum.png';

const LeftBar = ({ clientId }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setLoading(true);
        const firestoreChats = await fetchChatHistoryByCompanyID(clientId);
        // Optionally update IndexedDB with the latest Firestore data
        await loadChatMessagesFirestore(firestoreChats);
        setChatHistory(firestoreChats);
      } catch (err) {
        console.error('Failed to load chat history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      loadChatHistory();
    } else {
      setError('Client ID is missing.');
      setLoading(false);
    }
  }, [clientId]);

  const handlePlusClick = () => {
    console.log('Plus icon clicked. Navigating to /dashboard');
    navigate('/dashboard'); // Navigate back to the dashboard (e.g., NewReport view)
  };

  if (loading) return <div className="loading">Loading chats...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="left-bar-container">
      {/* Logo and Plus Icon */}
      <div className="logo-container">
        <img src={datum} alt="Datum Logo" className="logo" />
        <img
          src={plusIcon}
          alt="New Chat"
          className="plus-icon"
          onClick={handlePlusClick}
          style={{ cursor: 'pointer' }}
        />
      </div>
      <hr />
      {/* Render the ChatHistoryList (chat history) */}
      <ChatHistoryList chatHistory={chatHistory} />
    </div>
  );
};

LeftBar.propTypes = {
  clientId: PropTypes.string.isRequired,
};

export default LeftBar;
