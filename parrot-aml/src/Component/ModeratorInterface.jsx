import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import '../StyleSheet/ModeratorInterface.css';

const ModeratorInterface = ({ clientId, onShowDetail }) => {
  const [userRows, setUserRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all users from the 'users' collection whose company id matches clientId
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('company id', '==', clientId));
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => ({
          id: doc.id,
          uid: doc.id, // assuming the document ID is the user UID
          ...doc.data()
        }));
        setUserRows(users);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (clientId) {
      fetchUsers();
    }
  }, [clientId]);

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="ModeratorInterface">
      <div className="Graph">
        <div className="GraphContent">Graph<br /></div>
      </div>
      <div className="UserListContainer">
        <div className="UserListHeader">
          <div className="header-cell">User</div>
          <div className="header-cell">Occupation</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Last Online</div>
          <div className="header-cell">Actions</div>
        </div>
        {userRows.map((row) => (
          <div key={row.id} className="user-row">
            <div className="row-cell">{row.name || 'Unnamed User'}</div>
            <div className="row-cell">{row.occupation || 'N/A'}</div>
            <div className="row-cell">{row.role || 'N/A'}</div>
            <div className="row-cell">{row.lastOnline || 'N/A'}</div>
            <div className="row-cell">
              <button onClick={() => onShowDetail(row.uid)} className="more-button">
                More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

ModeratorInterface.propTypes = {
  clientId: PropTypes.string.isRequired,
  onShowDetail: PropTypes.func.isRequired,
};

export default ModeratorInterface;
