// parrot-aml/src/Component/ModeratorLayout.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ModeratorInterface from './ModeratorInterface';
import DetailPanel from './DetailPanel'; // Import the new DetailPanel
import UserDetailPanel from './UserDetailPanel';
import '../StyleSheet/ModeratorLayout.css';

const ModeratorLayout = ({ clientId, userName, uid }) => {
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
        <DetailPanel showToggle={false}>
          <button onClick={handleCloseDetail} className="back-button">
            Close
          </button>
          <UserDetailPanel
            clientId={clientId}
            userName={userName}
            uid={uid}
            userId={detailUserId}
          />
        </DetailPanel>
      )}
    </div>
  );
};

ModeratorLayout.propTypes = {
  clientId: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  uid: PropTypes.string.isRequired,
};

export default ModeratorLayout;