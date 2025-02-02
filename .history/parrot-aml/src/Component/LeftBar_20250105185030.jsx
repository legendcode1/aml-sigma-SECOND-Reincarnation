import React from 'react';
import '../StyleSheet/LeftBar.css'; // Ensure the path is correct
import sortIcon from '/leftbar/sort.png'; // Ensure the correct path
import plusIcon from '/leftbar/plus-sign.png';


const HighRiskBadge = () => (
  <div className="risk-badge">
    <img src="https://dashboard.codeparrot.ai/api/assets/Z2nJmBEM3nUkN3Ni" alt="Risk" className="risk-bg" />
    <span>High-risk</span>
  </div>
);

const LeftBar = ({ savedItems }) => {
  return (
    <div>
      <div className="logo-container">
        <img src="https://dashboard.codeparrot.ai/api/assets/Z2m_pY6CYQNjI8Vi" alt="Datumm Logo" className="logo" />
        <img src="https://dashboard.codeparrot.ai/api/assets/Z2nNMY6CYQNjI8Wg" alt="Plus" className="plus-icon" />
      </div>
      <hr />
      <div className="nav-links">
        <button>Dashboard</button>
        <button>Favorite</button>
        <button>PDF Maker</button>
      </div>
      <hr />
      <div className="chat-history">
        <div className="chat-header">
          <span>Chat History</span>
          <div className="icon-group">
            <img src={sortIcon} alt="sort icon" className="icon" />
            <img src={plusicon} alt="plus icon" className="icon" />
            <img src="https://dashboard.codeparrot.ai/api/assets/Z2m_pY6CYQNjI8Vg" alt="Vector" className="icon" />
          </div>
        </div>
        <div className="chat-items">
          {savedItems.map((item, index) => (
            <div key={index} className="chat-item">
              <div className="chat-profile">
                <span className="profile-name">{item.name || "N/A"}</span>
                {(item.name === "Budi Arie Hartanto" || item.name === "Ananta Wistara Anugrah") && (
                  <HighRiskBadge />
                )}
              </div>
              <div className="chat-details">
                <div className="timeline">
                  <img src="https://dashboard.codeparrot.ai/api/assets/Z2nJmBEM3nUkN3Nh" alt="Timeline" />
                </div>
                <div className="detail-items">
                  <div className="detail-item">
                    <span>Name: {item.name || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span>Age: {item.age || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span>Occupation: {item.occupation || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftBar;