import React from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import sortIcon from '/leftbar/sort.png';
import fav from '/leftbar/star.png';

const HighRiskBadge = () => (
  <div className="risk-badge">
    <img src="/leftbar/high-risk.png" alt="Risk" className="risk-bg" />
    <span>High-risk</span>
  </div>
);

const ChatItem = ({ inde, style, data }) => {
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
              {item.Datemade ? String(item.Datemade) : 'No date'}
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

const ChatHistoryList = ({ chatHistory, onShowProfileSettings, clientId }) => {
  const navigate = useNavigate();

  const handleModeratorClick = () => {
    navigate(`/${clientId}/moderator`);
  };

  return (
    <div className="chat-items">
      <hr />
      <div className="nav-links">
        <button onClick={handleModeratorClick}>Moderator</button>
        <button onClick={onShowProfileSettings}>Profile Settings</button>
      </div>
      <hr />
      <h2 className="chat-history-headline">Chat History</h2>
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
  );
};

ChatHistoryList.propTypes = {
  chatHistory: PropTypes.array.isRequired,
  onShowProfileSettings: PropTypes.func,
  clientId: PropTypes.string.isRequired,
};

export default ChatHistoryList;
