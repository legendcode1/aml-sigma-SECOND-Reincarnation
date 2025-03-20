// parrot-aml/src/Component/LeftBar.jsx
import React, { useState, useEffect } from 'react';
import '../StyleSheet/LeftBar.css';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { loadChatMessagesFirestore } from '../indexedDB';
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
    if (!clientId) {
      setError('Client ID is missing.');
      setLoading(false);
      return;
    }

    const chatsRef = collection(db, 'client', clientId, 'chat_history');
    const q = query(chatsRef, orderBy('dateMade', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        setLoading(true);
        const firestoreChats = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        await loadChatMessagesFirestore(firestoreChats);
        setChatHistory(firestoreChats);
      } catch (err) {
        console.error('Failed to load chat history:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error('Firestore listener error:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
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
      {/* Moderator Panel navigation and Profile Settings toggle are handled within ChatHistoryList */}
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