import React from 'react';
import '../StyleSheet/MainInterface.css';
import NewReport from './NewReport';
import Report from './Report';
import ChatPanel from './Panel';
import { Routes, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

const MainInterface = ({ clientId, userName, uid, user }) => {
  return (
    <div className="main-interface-container">
      <Routes>
        {/* Default dashboard route shows the NewReport form */}
        <Route 
          path="/" 
          element={<NewReport clientId={clientId} userName={userName} uid={uid} />} 
        />

        {/* When the URL is /dashboard/chat/:chatId, display Report and ChatPanel */}
        <Route
          path="chat/:chatId"
          element={
            <div className="report-chat-container">
              <Report clientId={clientId} />
              <ChatPanel clientId={clientId} userName={userName} uid={uid} />
            </div>
          }
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