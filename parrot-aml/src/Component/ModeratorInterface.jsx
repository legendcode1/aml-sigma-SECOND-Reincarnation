// parrot-aml/src/Component/ModeratorInterface.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase/firebase';
import RegisterUserForm from './RegisterUserForm';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../StyleSheet/ModeratorInterface.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ModeratorInterface = ({ clientId, onShowDetail, userName }) => {
  const [userRows, setUserRows] = useState([]);
  const [tokenData, setTokenData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setShowForm(location.pathname === '/dashboard/moderator/form');
  }, [location.pathname]);

  useEffect(() => {
    const fetchUsersAndTokens = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('company id', '==', clientId));
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          uid: doc.id,
          ...doc.data(),
        }));
        setUserRows(users);

        const tokenUsage = {};
        for (const user of users) {
          const reportsRef = collection(db, 'client', clientId, 'chat_history');
          const qReports = query(reportsRef, where('uid', '==', user.uid));
          const reportsSnapshot = await getDocs(qReports);
          let totalTokens = 0;
          reportsSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.tokenUsage) totalTokens += data.tokenUsage;
          });
          tokenUsage[user.uid] = totalTokens;
        }
        setTokenData(tokenUsage);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users or token data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (clientId) {
      fetchUsersAndTokens();
    }
  }, [clientId]);

  const handleUserRegistered = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('company id', '==', clientId));
      const querySnapshot = await getDocs(q);
      setUserRows(querySnapshot.docs.map((doc) => ({ id: doc.id, uid: doc.id, ...doc.data() })));
      setShowForm(false);
      navigate('/dashboard/moderator');
    } catch (err) {
      console.error('Error refreshing users:', err);
      setError(err.message);
    }
  };

  const toggleForm = () => {
    setShowForm(true);
    navigate('/dashboard/moderator/form');
  };

  const handleShowUserDetail = (uid) => {
    if (onShowDetail) onShowDetail(uid); // Delegate to ModeratorLayout
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  const chartData = {
    labels: userRows.map((user) => user.name || 'Unnamed User'),
    datasets: [
      {
        label: 'Token Usage',
        data: userRows.map((user) => tokenData[user.uid] || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div className="ModeratorInterface">
      {showForm ? (
        <RegisterUserForm
          clientId={clientId}
          onUserRegistered={handleUserRegistered}
          onGoBack={() => {
            setShowForm(false);
            navigate('/dashboard/moderator');
          }}
        />
      ) : (
        <>
          <div className="Graph">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Token Usage per User' },
                },
              }}
            />
          </div>
          <div className="UserListContainer">
            <div className="UserListHeader">
              <div className="header-cell">User</div>
              <div className="header-cell">Occupation</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Last Online</div>
              <div className="header-cell actions-cell">
                <button className="add-user-button" onClick={toggleForm}>
                  Add User
                </button>
              </div>
            </div>
            {userRows.map((row) => (
              <div key={row.id} className="user-row">
                <div className="row-cell">{row.name || 'Unnamed User'}</div>
                <div className="row-cell">{row.occupation || 'N/A'}</div>
                <div className="row-cell">{row.role || 'N/A'}</div>
                <div className="row-cell">{row.lastOnline || 'N/A'}</div>
                <div className="row-cell">
                  <button onClick={() => handleShowUserDetail(row.uid)} className="more-button">
                    More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

ModeratorInterface.propTypes = {
  clientId: PropTypes.string.isRequired,
  onShowDetail: PropTypes.func.isRequired,
  userName: PropTypes.string.isRequired, // Added for consistency
};

export default ModeratorInterface;