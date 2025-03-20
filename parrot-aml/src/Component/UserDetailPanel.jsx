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

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [userId]);

  if (loading) return <div>Loading user details...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="user-detail-panel">
      <h2>User Details</h2>
      {userData && (
        <div>
          <p><strong>Name:</strong> {userData.name || 'N/A'}</p>
          <p><strong>Email:</strong> {userData.email || 'N/A'}</p>
          <p><strong>Occupation:</strong> {userData.occupation || 'N/A'}</p>
          <p><strong>Company ID:</strong> {userData['company id'] || 'N/A'}</p>
          <p><strong>Phone:</strong> {userData.phone || 'N/A'}</p>
          <p>
            <strong>Profile Image:</strong>{' '}
            {userData.photoURL ? (
              <img
                src={`${userData.photoURL}?t=${Date.now()}`}
                alt="Profile"
                style={{ width: '100px' }}
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = '/path/to/fallback-image.png'; // Replace with a real fallback image path
                }}
              />
            ) : (
              'N/A'
            )}
          </p>
        </div>
      )}
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