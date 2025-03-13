import React, { useState, useEffect } from 'react';
import '../StyleSheet/LeftBar.css';
import { useNavigate } from 'react-router-dom';
import { loadChatMessagesFirestore } from '../indexedDB';
import { fetchChatHistoryByCompanyID } from '../auth/auth';
import PropTypes from 'prop-types';
import ChatHistoryList from './ChatHistoryList';
import ProfileSettings from './ProfileSettings';

import plusIcon from '/leftbar/plus.svg';
import datum from '/leftbar/datum.png';

const LeftBar = ({ clientId }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('chatHistory');
  const navigate = useNavigate();

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setLoading(true);
        const firestoreChats = await fetchChatHistoryByCompanyID(clientId);
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
    navigate('/dashboard');
  };

  if (loading) return <div className="loading">Loading chats...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="left-bar-container">
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
      {activeSection === 'chatHistory' ? (
        <ChatHistoryList
          chatHistory={chatHistory}
          onShowProfileSettings={() => setActiveSection('profile')}
          clientId={clientId}
        />
      ) : (
        <ProfileSettings onGoBack={() => setActiveSection('chatHistory')} />
      )}
    </div>
  );
};

LeftBar.propTypes = {
  clientId: PropTypes.string.isRequired,
};

export default LeftBar;
