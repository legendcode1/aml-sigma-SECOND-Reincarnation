// parrot-aml/src/Component/UserDetailPanel.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { db } from '../firebase/firebase';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../StyleSheet/UserDetailPanel.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserDetailPanel = ({ clientId, userName, uid, userId }) => {
  const [userData, setUserData] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [promptData, setPromptData] = useState([]);
  const [timeRange, setTimeRange] = useState('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userDocRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(
      userDocRef,
      (doc) => {
        if (doc.exists()) {
          setUserData({ id: doc.id, ...doc.data() });
        } else {
          setError('User not found');
        }
      },
      (err) => setError(err.message)
    );

    const fetchChatHistory = async () => {
      try {
        const reportsQuery = query(collection(db, 'client', clientId, 'chat_history'), where('uid', '==', userId));
        const reportsSnapshot = await getDocs(reportsQuery);
        const chats = await Promise.all(
          reportsSnapshot.docs.map(async (doc) => {
            const reportData = { id: doc.id, ...doc.data(), type: 'report' };
            const messagesQuery = query(collection(db, 'client', clientId, 'chat_history', doc.id, 'messages'));
            const messagesSnapshot = await getDocs(messagesQuery);
            const followups = messagesSnapshot.docs
              .map((mDoc) => ({ id: mDoc.id, ...mDoc.data() }))
              .filter((msg) => msg.type === 'followup');
            return { report: reportData, followups };
          })
        );
        setChatHistory(chats);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchPromptData = async () => {
      const reportsQuery = query(collection(db, 'client', clientId, 'chat_history'), where('uid', '==', userId));
      const followupsQuery = query(collection(db, 'client', clientId, 'followups'), where('uid', '==', userId));
      const [reportsSnapshot, followupsSnapshot] = await Promise.all([getDocs(reportsQuery), getDocs(followupsQuery)]);
      const allPrompts = [
        ...reportsSnapshot.docs.map((doc) => ({ ...doc.data(), timestamp: doc.data().timestamp })),
        ...followupsSnapshot.docs.map((doc) => ({ ...doc.data(), timestamp: doc.data().timestamp })),
      ].filter(p => p.timestamp);

      const aggregatedData = aggregatePrompts(allPrompts, timeRange);
      setPromptData(aggregatedData);
    };

    fetchChatHistory();
    fetchPromptData();
    return () => unsubscribe();
  }, [clientId, userId, timeRange]);

  const aggregatePrompts = (prompts, range) => {
    const now = new Date();
    const startDate = getStartDate(range, now);
    const filteredPrompts = prompts.filter((p) => p.timestamp.toDate() >= startDate);

    const grouped = filteredPrompts.reduce((acc, prompt) => {
      const dateKey = getDateKey(prompt.timestamp.toDate(), range);
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  };

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

  const chartData = {
    labels: promptData.map((d) => d.date),
    datasets: [{
      label: 'Prompts',
      data: promptData.map((d) => d.count),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }],
  };

  if (loading) return <div>Loading user details...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="user-detail-panel">
      <h2>User Details</h2>
      <p><strong>Name:</strong> {userData?.name || 'N/A'}</p>
      <p><strong>Email:</strong> {userData?.email || 'N/A'}</p>
      <p><strong>Last Online:</strong> {userData?.lastOnline ? new Date(userData.lastOnline.toMillis()).toLocaleString() : 'N/A'}</p>
      <div className="prompt-graph">
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="day">Day</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
          <option value="3years">3 Years</option>
          <option value="ytd">YTD</option>
        </select>
        <Bar data={chartData} options={{ responsive: true, plugins: { title: { display: true, text: `Prompts per ${timeRange}` } } }} />
      </div>
      <div className="chat-history-section">
        <h3>Chat History</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Report ID</th>
              <th>Prompt</th>
              <th>Followups</th>
            </tr>
          </thead>
          <tbody>
            {chatHistory.map(({ report, followups }) => (
              <tr key={report.id}>
                <td>{report.timestamp ? new Date(report.timestamp.toMillis()).toLocaleString() : 'N/A'}</td>
                <td><Link to={`/dashboard/chat/${report.id}`}>{report.id}</Link></td>
                <td>{report.prompt || 'No prompt'}</td>
                <td>{followups.length > 0 ? followups.map(f => f.content).join(', ') : 'No followups'}</td>
              </tr>
            ))}
          </tbody>
        </table>
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