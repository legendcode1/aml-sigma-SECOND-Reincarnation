// parrot-aml/src/Component/MainInterface.jsx
import React from 'react';
import '../StyleSheet/MainInterface.css';
import NewReport from './NewReport';
import Report from './Report';
import ChatPanel from './Panel';
import ModeratorLayout from './ModeratorLayout';
import LoginSection from './LoginSection';
import { Routes, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

const MainInterface = ({ clientId, userName, uid, userPhotoURL, onLogout, companyName }) => {
  return (
    <div className="main-interface-container">
      {/* LoginSection below the main content */}
      <div className="login-section-container">
        <LoginSection
          userName={userName}
          companyName={companyName}
          userPhotoURL={userPhotoURL}
          onLogout={onLogout}
          clientId={clientId}
          uid={uid}
          userId={uid}
        />
      </div>
      <div className="main-content">
        <Routes>
          <Route
            path="/"
            element={<NewReport clientId={clientId} userName={userName} uid={uid} />}
          />
          <Route
            path="chat/:chatId"
            element={
              <div className="report-chat-container">
                <Report clientId={clientId} />
                <ChatPanel clientId={clientId} userName={userName} uid={uid} />
              </div>
            }
          />
          <Route
            path="moderator"
            element={<ModeratorLayout clientId={clientId} userName={userName} uid={uid} />}
          />
        </Routes>
      </div>
    </div>
  );
};

MainInterface.propTypes = {
  clientId: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  uid: PropTypes.string.isRequired,
  userPhotoURL: PropTypes.string.isRequired,
  onLogout: PropTypes.func.isRequired,
  companyName: PropTypes.string.isRequired,
};

export default MainInterface;