// parrot-aml/src/Component/UserDetailPanel.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { db } from '../firebase/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import '../StyleSheet/UserDetailPanel.css';

const UserDetailPanel = ({ clientId, userName, uid, userId }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userDocRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(
      userDocRef,
      (doc) => {
        if (doc.exists()) {
          setUserData({ id: doc.id, ...doc.data() });
          setLoading(false);
        } else {
          setError('User not found');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching user data:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  if (loading) return <div className="loading">Loading user details...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="user-detail-panel">
      <div className="user-header">
        <img
          src={userData?.photoURL || '/default-profile.png'}
          alt="Profile"
          className="avatar"
          onError={(e) => (e.target.src = '/default-profile.png')}
        />
        <div className="name-tag">
          <span className="user-name">{userData?.name || 'N/A'}</span>
          <span className="user-role">{userData?.occupation || 'N/A'}</span>
        </div>
      </div>
      <div className="contact-info">
        <div className="info-row">
          <span className="info-label">Email:</span>
          <span className="info-value">{userData?.email || 'N/A'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Company ID:</span>
          <span className="info-value">{userData?.['company id'] || 'N/A'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Phone:</span>
          <span className="info-value">{userData?.phone || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

UserDetailPanel.propTypes = {
  clientId: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  uid: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
};

export default UserDetailPanel; 