// parrot-aml/src/Component/MainInterface.jsx
import React from 'react';
import '../StyleSheet/MainInterface.css';
import NewReport from './NewReport';
import Report from './Report';
import ChatPanel from './Panel';
import ModeratorLayout from './ModeratorLayout';
import { Routes, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

const MainInterface = ({ clientId, userName, uid }) => {
  return (
    <div className="main-interface-container">
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
  );
};

MainInterface.propTypes = {
  clientId: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  uid: PropTypes.string.isRequired,
};

export default MainInterface;