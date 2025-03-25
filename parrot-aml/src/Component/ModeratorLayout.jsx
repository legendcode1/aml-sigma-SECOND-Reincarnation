// parrot-aml/src/Component/ModeratorLayout.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ModeratorInterface from './ModeratorInterface';
import UserDetailPanel from './UserDetailPanel';
import '../StyleSheet/ModeratorLayout.css';

const ModeratorLayout = ({ clientId, userName, uid }) => {
  const [detailUserId, setDetailUserId] = useState(null);

  const handleShowDetail = (uid) => setDetailUserId(uid);
  const handleCloseDetail = () => setDetailUserId(null);

  return (
    <div className="moderator-layout">
      <div className={`moderator-interface-section ${detailUserId ? 'half-width' : 'full-width'}`}>
        <ModeratorInterface clientId={clientId} onShowDetail={handleShowDetail} userName={userName} />
      </div>
      {detailUserId && (
        <div className="user-detail-section">
          <UserDetailPanel clientId={clientId} userName={userName} uid={uid} userId={detailUserId} />
          <button onClick={handleCloseDetail} className="close-detail-button">Close</button>
        </div>
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