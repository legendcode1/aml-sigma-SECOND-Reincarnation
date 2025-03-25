// parrot-aml/src/Component/LoginSection.jsx
import React, { useState } from 'react';
import UserDetailPanel from './UserDetailPanel';
import '../StyleSheet/LoginSection.css';

const LoginSection = ({ userName, companyName, userPhotoURL, onLogout, clientId, uid, userId }) => {
  const [showPopup, setShowPopup] = useState(false);

  const togglePopup = () => setShowPopup(!showPopup);

  return (
    <div className="login-section">
      <img
        src={userPhotoURL}
        alt="User Profile"
        className="profile-picture"
        onClick={togglePopup}
        onError={(e) => (e.target.src = '/default-profile.png')}
      />
      {showPopup && (
        <div className="profile-popup">
          <span className="login-text">{userName} from {companyName}</span>
          <UserDetailPanel clientId={clientId} userName={userName} uid={uid} userId={userId} />
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginSection;