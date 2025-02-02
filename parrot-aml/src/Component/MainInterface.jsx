// src/Component/MainInterface.jsx

import React from 'react';
import '../StyleSheet/MainInterface.css';
import NewReport from './NewReport';
import ChatHistory from './ChatHistory';
import { Routes, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * MainInterface Component
 *
 * Handles routing within the dashboard section.
 * Renders NewReport at /dashboard/
 * Renders ChatHistory at /dashboard/chat/:chatId
 *
 * Props:
 * - clientId (string): The unique identifier for the client/company.
 */
const MainInterface = ({ clientId }) => {
  return (
    <div className="main-interface-container">
      <Routes>
        {/* Route for /dashboard */}
        <Route
          path="/"
          element={<NewReport clientId={clientId} />}
        />

        {/* Route for /dashboard/chat/:chatId */}
        <Route
          path="chat/:chatId"
          element={<ChatHistory clientId={clientId} />}
        />
      </Routes>
    </div>
  );
};

// Prop type validation
MainInterface.propTypes = {
  clientId: PropTypes.string.isRequired,
};

export default MainInterface;
