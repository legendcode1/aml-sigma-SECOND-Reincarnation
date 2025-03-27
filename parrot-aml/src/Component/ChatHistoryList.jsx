// parrot-aml/src/Component/ChatHistoryList.jsx
import React from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../StyleSheet/ChatHistoryList.css';

const HighRiskBadge = () => (
  <div className="risk-badge">
    <img src="/leftbar/high-risk.png" alt="Risk" className="risk-bg" />
    <span>High-risk</span>
  </div>
);

const ChatItem = ({ index, style, data }) => {
  const item = data[index];
  const isHighRisk = ['Budi Arie Hartanto', 'Ananta Wistara Anugrah'].includes(item.headline);

  const displayText =
    item.status === 'processing'
      ? 'Processing...'
      : item.dateMade
        ? typeof item.dateMade.toDate === 'function'
          ? item.dateMade.toDate().toLocaleString()
          : new Date(item.dateMade).toLocaleString()
        : 'No date';

  return (
    <div style={style} className="chat-item-wrapper">
      <Link to={`/dashboard/chat/${item.id}`} className="chat-item-link">
        <div className="chat-item-content">
          <div className="chat-profile">
            <span className="profile-name">{item.headline || 'Unnamed Chat'}</span>
            {isHighRisk && <HighRiskBadge />}
            <span className="chat-status">{displayText}</span>
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

const ChatHistoryList = ({ chatHistory, onShowProfileSettings, clientId }) => {
  const navigate = useNavigate();

  const handleModeratorClick = () => {
    console.log('Moderator Panel clicked. Navigating to /dashboard/moderator');
    navigate('/dashboard/moderator');
  };

  const handleProfileSettingsClick = () => {
    console.log('Profile Settings clicked');
    onShowProfileSettings();
  };

  return (
    <div className="chat-items">
      <hr className="divider" />
      <div className="nav-buttons">
        <button className="nav-button" onClick={handleModeratorClick}>
          Moderator Panel
        </button>
        <button className="nav-button" onClick={handleProfileSettingsClick}>
          Profile Settings
        </button>
      </div>
      <hr className="divider" />
      <span className="chat-header">Chat History</span>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height - 100} // Adjust for nav-buttons and header
            itemCount={chatHistory.length}
            itemSize={80} // Matches total height: 70px content + 10px wrapper padding
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
  );
};

ChatHistoryList.propTypes = {
  chatHistory: PropTypes.array.isRequired,
  onShowProfileSettings: PropTypes.func.isRequired,
  clientId: PropTypes.string.isRequired,
};

export default ChatHistoryList;