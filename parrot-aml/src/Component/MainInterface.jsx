// src/Component/MainInterface.jsx
import React from 'react';
import '../StyleSheet/MainInterface.css';
import NewReport from './NewReport';
import ChatHistory from './ChatHistory';
import { Routes, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

const MainInterface = ({ clientId }) => {
  return (
    <div className="main-interface-container">
      <Routes>
        {/* Default dashboard route shows the NewReport form */}
        <Route path="/" element={<NewReport clientId={clientId} />} />

        {/* Chat history route */}
        <Route path="chat/:chatId" element={<ChatHistory clientId={clientId} />} />
      </Routes>
    </div>
  );
};

MainInterface.propTypes = {
  clientId: PropTypes.string.isRequired,
};

export default MainInterface;
