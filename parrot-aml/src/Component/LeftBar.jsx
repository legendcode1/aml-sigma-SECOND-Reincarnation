// src/Component/LeftBar.jsx
import React, { useState, useEffect } from 'react';
import '../StyleSheet/LeftBar.css';
import { Link, useNavigate } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { getChatMessages, loadChatMessagesFirestore } from '../indexedDB';
import { fetchChatHistoryByCompanyID } from '../auth/auth';
import PropTypes from 'prop-types';

// Import assets
import sortIcon from '/leftbar/sort.png';
import plusIcon from '/leftbar/plus-sign.png';
import datum from '/leftbar/datum.png';
import highrisk from '/leftbar/high-risk.png';
import fav from '/leftbar/star.png';

const HighRiskBadge = () => (
  <div className="risk-badge">
    <img src={highrisk} alt="Risk" className="risk-bg" />
    <span>High-risk</span>
  </div>
);

const ChatItem = ({ index, style, data }) => {
  const item = data[index];
  const isHighRisk = ['Budi Arie Hartanto', 'Ananta Wistara Anugrah'].includes(item.headline);

  return (
    <div style={style} className="chat-item-wrapper">
      <Link to={`/dashboard/chat/${item.id}`} className="chat-item-link">
        <div className="chat-item-content">
          <div className="chat-profile">
            <span className="profile-name">{item.headline || 'Unnamed Chat'}</span>
            {isHighRisk && <HighRiskBadge />}
            <span className="chat-date">
              {item.timestamp
                ? (typeof item.timestamp.toDate === 'function'
                    ? new Date(item.timestamp.toDate()).toLocaleDateString()
                    : new Date(item.timestamp).toLocaleDateString())
                : 'No date'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

ChatItem.propTypes = {
  index: PropTypes.number.isRequired,
  style: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
};

const LeftBar = ({ clientId }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setLoading(true);
        // Always fetch from Firestore using the provided clientId
        const firestoreChats = await fetchChatHistoryByCompanyID(clientId);
        // Update IndexedDB with the latest Firestore data
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
    navigate('/dashboard'); // Navigate back to the dashboard (NewReport view)
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
      <div className="chat-history">
        <div className="chat-header">
          <span>Chat History</span>
          <div className="icon-group">
            <img src={sortIcon} alt="Sort" className="icon" />
            <img src="https://dashboard.codeparrot.ai/api/assets/Z2m_pY6CYQNjI8Vf" alt="Filter" className="icon" />
            <img src={fav} alt="Favorites" className="icon" />
          </div>
        </div>
        {/* Wrap the list in a container that uses AutoSizer to automatically compute height */}
        <div className="chat-items">
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                itemCount={chatHistory.length}
                itemSize={80}
                width={width}
                itemData={chatHistory}
                itemKey={(index, data) => data[index].id}
              >
                {({ index, style, data }) => (
                  <ChatItem index={index} style={style} data={data} />
                )}
              </List>
            )}
          </AutoSizer>
        </div>
      </div>
    </div>
  );
};

LeftBar.propTypes = {
  clientId: PropTypes.string.isRequired,
};

export default LeftBar;
