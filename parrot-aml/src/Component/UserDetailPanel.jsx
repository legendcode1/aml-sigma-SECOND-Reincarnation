import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import '../StyleSheet/UserDetailPanel.css';

const UserDetailPanel = ({ clientId, userId }) => {
  const [userBio, setUserBio] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the user's bio from the 'users' collection
  useEffect(() => {
    const fetchUserBio = async () => {
      try {
        const userDocRef = doc(db, 'users', userId);
        const snapshot = await getDoc(userDocRef);
        if (snapshot.exists()) {
          setUserBio(snapshot.data());
        } else {
          setUserBio(null);
        }
      } catch (err) {
        console.error('Error fetching user bio:', err);
        setError(err.message);
      }
    };

    fetchUserBio();
  }, [userId]);

  // Fetch chat sessions where 'initiator' equals userId from client/{clientId}/chat_history
  useEffect(() => {
    const fetchUserChats = async () => {
      try {
        const chatHistoryRef = collection(db, 'client', clientId, 'chat_history');
        const q = query(chatHistoryRef, where('initiator', '==', userId));
        const querySnapshot = await getDocs(q);
        const sessions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChatSessions(sessions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching chat sessions:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (clientId && userId) {
      fetchUserChats();
    }
  }, [clientId, userId]);

  if (loading) return <div className="user-detail-loading">Loading user details...</div>;
  if (error) return <div className="user-detail-error">Error: {error}</div>;

  return (
    <div className="UserDetailPanel">
      <div className="BioSection">
        <div className="Avatar">
          <img src={userBio?.photoURL || '/default-profile.png'} alt="Avatar" />
        </div>
        <div className="NameTag">
          <div className="UserName">{userBio?.name || 'Unknown User'}</div>
          <div className="UserRole">{userBio?.role || 'No Role Specified'}</div>
        </div>
      </div>
      <div className="ContactInfo">
        <div className="InfoRow">
          <span className="InfoLabel">Email:</span>
          <span className="InfoValue">{userBio?.email || 'Not provided'}</span>
        </div>
        <div className="InfoRow">
          <span className="InfoLabel">Phone:</span>
          <span className="InfoValue">{userBio?.phone || 'Not provided'}</span>
        </div>
      </div>
      <div className="ChatHistorySection">
        <div className="SectionHeader">Chat History</div>
        {chatSessions.length === 0 ? (
          <div className="NoData">No chat history found for this user.</div>
        ) : (
          <div className="ChatHistoryTable">
            <div className="TableHeader">
              <div className="HeaderCell">Session Title</div>
              <div className="HeaderCell">Date</div>
              <div className="HeaderCell">Initial Report</div>
              <div className="HeaderCell">Actions</div>
            </div>
            {chatSessions.map((session) => (
              <div key={session.id} className="TableRow">
                <div className="RowCell">{session.title || 'Chat Session'}</div>
                <div className="RowCell">
                  {session.timestamp ? new Date(session.timestamp.seconds * 1000).toLocaleString() : ''}
                </div>
                <div className="RowCell">{session.initialReport || 'No report available'}</div>
                <div className="RowCell">
                  <button className="more-button">More</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

UserDetailPanel.propTypes = {
  clientId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
};

export default UserDetailPanel;
