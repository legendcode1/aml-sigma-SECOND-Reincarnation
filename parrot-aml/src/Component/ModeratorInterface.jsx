// parrot-aml/src/Component/ModeratorInterface.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase/firebase';
import RegisterUserForm from './RegisterUserForm';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import '../StyleSheet/ModeratorInterface.css';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const ModeratorInterface = ({ clientId, onShowDetail, userName }) => {
  const [userRows, setUserRows] = useState([]);
  const [promptData, setPromptData] = useState([]);
  const [timeRange, setTimeRange] = useState('day');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setShowForm(location.pathname === '/dashboard/moderator/form');
  }, [location.pathname]);

  // Fetch users for the table
  useEffect(() => {
    const fetchUsers = async () => {
      console.log('Fetching users...');
      try {
        const userQuery = query(collection(db, 'users'), where('company id', '==', clientId));
        const userSnapshot = await getDocs(userQuery);
        const users = userSnapshot.docs.map((doc) => {
          const data = doc.data();
          const lastOnlineTimestamp = data.lastOnline ? data.lastOnline.toMillis() : null;
          const now = Date.now();
          const isOnline = lastOnlineTimestamp && (now - lastOnlineTimestamp < 5 * 60 * 1000);
          return {
            id: doc.id,
            uid: doc.id,
            ...data,
            lastOnline: isOnline ? '(now)' : lastOnlineTimestamp ? new Date(lastOnlineTimestamp).toLocaleString() : 'N/A',
          };
        });
        setUserRows(users);
        setLoadingUsers(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message);
        setLoadingUsers(false);
      }
    };

    if (clientId) fetchUsers();
  }, [clientId]);

  // Fetch and aggregate prompts based on dateMade
  useEffect(() => {
    const fetchPrompts = async () => {
      console.log('Fetching prompt data with clientId:', clientId);
      try {
        const chatHistoryRef = collection(db, 'client', clientId, 'chat_history');
        const chatHistorySnapshot = await getDocs(chatHistoryRef);
        const allPrompts = chatHistorySnapshot.docs.map((doc) => ({
          timestamp: doc.data().dateMade, // Use dateMade directly
        }));

        const aggregatedData = aggregatePrompts(allPrompts, timeRange);
        setPromptData(aggregatedData);
        setLoadingGraph(false);
      } catch (err) {
        console.error('Error fetching prompts:', err);
        setError(err.message);
        setLoadingGraph(false);
      }
    };

    if (clientId && !loadingUsers) fetchPrompts();
  }, [clientId, timeRange, loadingUsers]);

  // Aggregate prompts by date
  const aggregatePrompts = (prompts, range) => {
    const now = new Date();
    const startDate = getStartDate(range, now);
    const filteredPrompts = prompts.filter((p) => p.timestamp && p.timestamp.toDate() >= startDate);

    const grouped = filteredPrompts.reduce((acc, prompt) => {
      const dateKey = getDateKey(prompt.timestamp.toDate(), range);
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  };

  // Determine the start date for the time range
  const getStartDate = (range, now) => {
    switch (range) {
      case 'day': return new Date(now.setHours(0, 0, 0, 0));
      case 'month': return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'year': return new Date(now.getFullYear(), 0, 1);
      case '3years': return new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
      case 'ytd': return new Date(now.getFullYear(), 0, 1);
      default: return new Date(0);
    }
  };

  // Format date keys for grouping
  const getDateKey = (date, range) => {
    switch (range) {
      case 'day': return date.toLocaleDateString();
      case 'month': return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      case 'year': return date.getFullYear().toString();
      case '3years': return date.getFullYear().toString();
      case 'ytd': return date.toLocaleDateString();
      default: return date.toLocaleDateString();
    }
  };

  // Chart data for the Line component
  const chartData = {
    labels: promptData.map((d) => d.date),
    datasets: [{
      label: 'Total Reports',
      data: promptData.map((d) => d.count),
      borderColor: 'rgba(75, 192, 192, 1)', // Line color
      backgroundColor: 'rgba(75, 192, 192, 0.6)', // Point color
      tension: 0.4, // Smooth curves
      fill: false, // No fill under the line
    }],
  };

  if (loadingUsers) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="ModeratorInterface">
      {showForm ? (
        <RegisterUserForm
          clientId={clientId}
          onUserRegistered={() => navigate('/dashboard/moderator')}
          onGoBack={() => setShowForm(false)}
        />
      ) : (
        <div className="moderator-content">
          <div className="graph-section">
            <select
              value={timeRange}
              onChange={(e) => {
                console.log('Time range changed to:', e.target.value); // Debug log
                setTimeRange(e.target.value);
              }}
            >
              <option value="day">Day</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
              <option value="3years">3 Years</option>
              <option value="ytd">YTD</option>
            </select>
            {loadingGraph ? (
              <div className="loading">Loading graph...</div>
            ) : (
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: `Reports per ${timeRange}`,
                    },
                  },
                }}
              />
            )}
          </div>
          <div className="user-list-section">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Last Online</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {userRows.map((user) => (
                  <tr key={user.uid}>
                    <td>{user.name}</td>
                    <td>{user.lastOnline}</td>
                    <td>
                      <button onClick={() => onShowDetail(user.uid)} className="more-button">
                        More
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

ModeratorInterface.propTypes = {
  clientId: PropTypes.string.isRequired,
  onShowDetail: PropTypes.func.isRequired,
  userName: PropTypes.string.isRequired,
};

export default ModeratorInterface;