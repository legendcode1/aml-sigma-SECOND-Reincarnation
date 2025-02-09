import React from 'react';
import '../StyleSheet/MainInterface.css';
import NewReport from './NewReport';
import Report from './Report';
import ChatHistory from './ChatHistory';
import { Routes, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

const MainInterface = ({ clientId, userName }) => {
  return (
    <div className="main-interface-container">
      <Routes>
        {/* Default dashboard route shows the NewReport form */}
        <Route path="/" element={<NewReport clientId={clientId} userName={userName} />} />

        {/* When the URL is /dashboard/chat/:chatId, display both Report and ChatHistory */}
        <Route
          path="chat/:chatId"
          element={
            <div className="report-chat-container">
              <ChatHistory clientId={clientId} userName={userName}/>
              <Report clientId={clientId} />
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
};

export default MainInterface;
