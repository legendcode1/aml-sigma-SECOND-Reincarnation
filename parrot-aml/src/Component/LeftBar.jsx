// filepath: /c:/Users/Ananta Anugrah/Desktop/aml sigma SECOND Reincarnation/parrot-aml/src/Component/LeftBar.jsx
import React, { useState, useEffect } from 'react';
import '../StyleSheet/LeftBar.css'; // Ensure the path is correct
import sortIcon from '/leftbar/sort.png'; // Ensure the correct path
import plusIcon from '/leftbar/plus-sign.png';
import datum from '/leftbar/datum.png';
import highrisk from '/leftbar/high-risk.png';
import fav from '/leftbar/star.png';
import { getChatMessages } from '../indexedDB'; // Import the function from indexedDB.js
import { FixedSizeList as List } from 'react-window'; // Import react-window for virtualized list
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const HighRiskBadge = () => (
  <div className="risk-badge">
    <img src={highrisk} alt="Risk" className="risk-bg" />
    <span>High-risk</span>
  </div>
);

const ChatItem = ({ index, style, data, navigate }) => {
  const item = data[index];
  return (
    <div style={style} className="chat-item" onClick={() => navigate(`/main/chat/${item.id}`)}>
      {/* Chat Profile Section */}
      <div className="chat-profile">
        <span className="profile-name">{item.headline || "Unnamed Chat"}</span>
        {/* Show HighRiskBadge for specific names */}
        {(item.headline === "Budi Arie Hartanto" || item.headline === "Ananta Wistara Anugrah") && (
          <HighRiskBadge />
        )}
      </div>
    </div>
  );
};

const LeftBar = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const navigate = useNavigate(); // Initialize navigate

  // Fetch chat history from IndexedDB when the component mounts
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const messages = await getChatMessages();
        setChatHistory(messages);
        console.log('Loaded chat history from IndexedDB:', messages);
      } catch (error) {
        console.error('Error loading chat history from IndexedDB:', error);
      }
    };

    fetchChatHistory();
  }, []);

  return (
    <div className="left-bar-container">
      {/* Logo and Plus Icon */}
      <div className="logo-container">
        <img src={datum} alt="Datum Logo" className="logo" />
        <img src={plusIcon} alt="Add" className="plus-icon" />
      </div>
      <hr />

      {/* Navigation Links */}
      <div className="nav-links">
        <button>Dashboard</button>
        <button>Favorite</button>
        <button>PDF Maker</button>
      </div>
      <hr />

      {/* Chat History Section */}
      <div className="chat-history">
        <div className="chat-header">
          <span>Chat History</span>
          <div className="icon-group">
            <img src={sortIcon} alt="Sort" className="icon" />
            <img
              src="https://dashboard.codeparrot.ai/api/assets/Z2m_pY6CYQNjI8Vf"
              alt="Filter"
              className="icon"
            />
            <img src={fav} alt="Favorites" className="icon" />
          </div>
        </div>

        {/* Chat Items */}
        <div className="chat-items">
          {chatHistory.length === 0 ? (
            <p className="no-chats">No chat history available.</p>
          ) : (
            <List
              height={400} // Adjust height as needed
              itemCount={chatHistory.length}
              itemSize={100} // Adjust item size as needed
              width={'100%'}
              itemData={chatHistory}
              itemKey={(index, data) => data[index].id} // Ensure unique keys
            >
              {({ index, style, data }) => (
                <ChatItem index={index} style={style} data={data} navigate={navigate} />
              )}
            </List>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftBar;