import React, { useState } from 'react';
import PropTypes from 'prop-types';
import LeftBar from './LeftBar';
import ModeratorInterface from './ModeratorInterface';
import Panel from './Panel';
import UserDetailPanel from './UserDetailPanel';
import '../StyleSheet/ModeratorLayout.css';

const ModeratorLayout = ({ clientId }) => {
  const [detailUserId, setDetailUserId] = useState(null);

  const handleShowDetail = (uid) => {
    setDetailUserId(uid);
  };

  const handleCloseDetail = () => {
    setDetailUserId(null);
  };

  return (
    <div className="moderator-layout">
      <div className="moderator-main-interface">
        <ModeratorInterface clientId={clientId} onShowDetail={handleShowDetail} />
      </div>
      {detailUserId && (
        <Panel showToggle={false}>
          <button onClick={handleCloseDetail} className="back-button">
            Close
          </button>
          <UserDetailPanel clientId={clientId} userId={detailUserId} />
        </Panel>
      )}
    </div>
  );
};

ModeratorLayout.propTypes = {
  clientId: PropTypes.string.isRequired,
};

export default ModeratorLayout;
