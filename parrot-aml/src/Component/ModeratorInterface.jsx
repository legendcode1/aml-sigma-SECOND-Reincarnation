// parrot-aml/src/Component/ModeratorInterface.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase/firebase';
import RegisterUserForm from './RegisterUserForm';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../StyleSheet/ModeratorInterface.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ModeratorInterface = ({ clientId, onShowDetail, userName }) => {
  const [userRows, setUserRows] = useState([]);
  const [promptData, setPromptData] = useState([]);
  const [timeRange, setTimeRange] = useState('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setShowForm(location.pathname === '/dashboard/moderator/form');
  }, [location.pathname]);

  // parrot-aml/src/Component/ModeratorInterface.jsx
  useEffect(() => {
    const fetchData = async () => {
      console.log('Starting data fetch for ModeratorInterface...');
      try {
        // Fetch users
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
        console.log('Users fetched:', users);

        // Fetch prompts for all users
        const chatHistoryRef = collection(db, 'client', clientId, 'chat_history');
        const chatHistorySnapshot = await getDocs(chatHistoryRef);
        const allPrompts = [];

        for (const chatDoc of chatHistorySnapshot.docs) {
          const chatId = chatDoc.id;

          // Fetch initial-report
          const initialReportRef = doc(db, 'client', clientId, 'chat_history', chatId, 'messages', 'initial-report');
          const initialReportDoc = await getDoc(initialReportRef);
          if (initialReportDoc.exists() && initialReportDoc.data().uid) {
            allPrompts.push({
              ...initialReportDoc.data(),
              timestamp: initialReportDoc.data().timestamp,
            });
          }

          // Fetch followups
          const messagesRef = collection(db, 'client', clientId, 'chat_history', chatId, 'messages');
          const messagesQuery = query(messagesRef, where('type', '==', 'followup'));
          const messagesSnapshot = await getDocs(messagesQuery);
          messagesSnapshot.forEach((msgDoc) => {
            if (msgDoc.data().uid) {
              allPrompts.push({
                ...msgDoc.data(),
                timestamp: msgDoc.data().timestamp,
              });
            }
          });
        }

        console.log('All Prompts fetched:', allPrompts);

        const aggregatedData = aggregatePrompts(allPrompts, timeRange);
        setPromptData(aggregatedData);
        setLoading(false);
        console.log('Data fetch completed for ModeratorInterface.');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (clientId) fetchData();
  }, [clientId, timeRange]);

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
      label: 'Total Prompts',
      data: promptData.map((d) => d.count),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }],
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="ModeratorInterface">
      {/* Rest of the component remains unchanged */}
      <div className="moderator-content">
        <div className="graph-section">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
            <option value="3years">3 Years</option>
            <option value="ytd">YTD</option>
          </select>
          <Bar data={chartData} options={{ responsive: true, plugins: { title: { display: true, text: `Prompts per ${timeRange}` } } }} />
        </div>
        {/* User list table remains unchanged */}
      </div>
    </div>
  );
};

ModeratorInterface.propTypes = {
  clientId: PropTypes.string.isRequired,
  onShowDetail: PropTypes.func.isRequired,
  userName: PropTypes.string.isRequired,
};

export default ModeratorInterface;