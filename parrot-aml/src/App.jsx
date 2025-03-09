// parrot-aml/src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import LeftBar from './Component/LeftBar';
import MainInterface from './Component/MainInterface';
import ModeratorLayout from './Component/ModeratorLayout';
import LoginPage from './login system/LoginPage';
import Notification from './Component/Notification';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { fetchUserDataByUID, fetchCompanyDataByID } from './auth/auth';
import './StyleSheet/global.css';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [userName, setUserName] = useState('');
  const [uid, setUserID] = useState('');
  const [loading, setLoading] = useState(true);
  const [notificationState, setNotificationState] = useState({
    headline: 'Generating Initial Report...',
    message: 'Waiting for report generation...',
    targetName: 'No target yet',
    isLoading: false,
  });
  const [isWebSocketOnline, setIsWebSocketOnline] = useState(false);
  const wsRef = useRef(null);
  const timeoutRef = useRef(null); // Keep this ref for cleanup, though timeout will be removed
  const statusIntervalRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('Auth state changed:', user);
        try {
          setIsAuthenticated(true);
          const userData = await fetchUserDataByUID(user.uid);
          setUserID(user.uid);
          const companyId = userData.companyId || userData['company id'];
          if (!companyId) throw new Error('Company ID not found in user data.');
          const companyData = await fetchCompanyDataByID(companyId);
          setClientId(companyId);
          setCompanyName(companyData.company_name || 'Unknown Company');
          setUserName(userData.name || 'Unknown User');
          if (location.pathname === '/' || location.pathname === '/login') {
            navigate('/dashboard');
          }
          const savedChatId = localStorage.getItem('activeChatId');
          if (!savedChatId || localStorage.getItem(`reportCompleted_${savedChatId}`)) {
            console.log('No active chatId or report completed, resetting state');
            setNotificationState({
              headline: 'Generating Initial Report...',
              message: 'Waiting for report generation...',
              targetName: 'No target yet',
              isLoading: false,
            });
            if (wsRef.current) wsRef.current.close();
            localStorage.removeItem('activeChatId');
            localStorage.removeItem(`reportCompleted_${savedChatId || ''}`);
            setIsWebSocketOnline(false);
          } else if (savedChatId) {
            console.log('Reconnecting WebSocket for saved chatId:', savedChatId);
            connectWebSocket(savedChatId);
          }
        } catch (error) {
          console.error('Error during authentication:', error);
          setIsAuthenticated(false);
          navigate('/login');
        }
      } else {
        setIsAuthenticated(false);
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate, location]);

  const handleNotificationUpdate = (event) => {
    console.log('Received updateNotification event:', event.detail);
    setNotificationState((prev) => {
      const newState = { ...prev, ...event.detail };
      console.log('Updated notificationState:', newState);
      return newState;
    });
  };

  useEffect(() => {
    window.addEventListener('updateNotification', handleNotificationUpdate);
    return () => window.removeEventListener('updateNotification', handleNotificationUpdate);
  }, []);

  const handleReset = async () => {
    const auth = getAuth();
    try {
      await auth.signOut();
      setIsAuthenticated(false);
      setClientId(null);
      setCompanyName('');
      setUserName('');
      if (wsRef.current) wsRef.current.close();
      localStorage.removeItem('activeChatId');
      localStorage.removeItem(`reportCompleted_${localStorage.getItem('activeChatId') || ''}`);
      setNotificationState({
        headline: 'Generating Initial Report...',
        message: 'Waiting for report generation...',
        targetName: 'No target yet',
        isLoading: false,
      });
      setIsWebSocketOnline(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current); // Cleanup existing timeout if any
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const connectWebSocket = (sessionId) => {
    if (wsRef.current) {
      console.log('Closing existing WebSocket connection for session:', sessionId);
      wsRef.current.close();
    }

    const wsUrl = `${import.meta.env.VITE_BACKEND_WS_URL}/ws/${sessionId}`.replace('http', 'ws');
    console.log('Attempting to connect to WebSocket at:', wsUrl);
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket successfully connected for session:', sessionId);
      setIsWebSocketOnline(true);
      setNotificationState((prev) => ({
        ...prev,
        message: 'WebSocket connected, awaiting updates...',
      }));
      // Removed timeout logic
    };

    wsRef.current.onmessage = async (event) => {
      console.log('Raw WebSocket message received:', event.data);
      try {
        let messageData = event.data;
        if (messageData instanceof Blob) {
          console.log('Received Blob, converting to text...');
          messageData = await messageData.text();
          console.log('Converted Blob to text:', messageData);
        }
        const data = JSON.parse(messageData);
        console.log('Parsed WebSocket message:', data);
        setNotificationState((prev) => {
          let newMessage = prev.message;
          if (data.type === 'status') {
            newMessage = data.message;
          } else if (data.type === 'need_more_info') {
            newMessage = `Querying: ${data.query}`;
          } else if (data.type === 'final') {
            newMessage = data.message;
            setTimeout(() => {
              setNotificationState({
                headline: 'Generating Initial Report...',
                message: 'Waiting for report generation...',
                targetName: 'No target yet',
                isLoading: false,
              });
              localStorage.removeItem('activeChatId');
              localStorage.setItem(`reportCompleted_${sessionId}`, 'true');
              if (wsRef.current) wsRef.current.close();
              setIsWebSocketOnline(false);
            }, 1000);
          } else if (data.type === 'error') {
            newMessage = `Error: ${data.message}`;
            setTimeout(() => {
              setNotificationState({
                headline: 'Generating Initial Report...',
                message: 'Waiting for report generation...',
                targetName: 'No target yet',
                isLoading: false,
              });
              localStorage.removeItem('activeChatId');
              localStorage.setItem(`reportCompleted_${sessionId}`, 'true');
              if (wsRef.current) wsRef.current.close();
              setIsWebSocketOnline(false);
            }, 1000);
          } else {
            console.log('Unknown message type:', data.type);
          }
          const newState = { ...prev, message: newMessage };
          console.log('Updated notificationState:', newState);
          return newState;
        });
        // Removed timeout logic
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
        setNotificationState((prev) => ({
          ...prev,
          message: 'Error parsing WebSocket message',
        }));
        setTimeout(() => {
          setNotificationState({
            headline: 'Generating Initial Report...',
            message: 'Waiting for report generation...',
            targetName: 'No target yet',
            isLoading: false,
          });
          localStorage.removeItem('activeChatId');
          localStorage.setItem(`reportCompleted_${sessionId}`, 'true');
          if (wsRef.current) wsRef.current.close();
          setIsWebSocketOnline(false);
        }, 1000);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error occurred for session:', sessionId, error);
      setNotificationState((prev) => ({
        ...prev,
        message: 'WebSocket error occurred',
      }));
      setTimeout(() => {
        setNotificationState({
          headline: 'Generating Initial Report...',
          message: 'Waiting for report generation...',
          targetName: 'No target yet',
          isLoading: false,
        });
        localStorage.removeItem('activeChatId');
        localStorage.setItem(`reportCompleted_${sessionId}`, 'true');
        if (wsRef.current) wsRef.current.close();
        setIsWebSocketOnline(false);
      }, 1000);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    wsRef.current.onclose = (event) => {
      console.log('WebSocket closed for session:', sessionId, 'Code:', event.code, 'Reason:', event.reason);
      setNotificationState({
        headline: 'Generating Initial Report...',
        message: 'Waiting for report generation...',
        targetName: 'No target yet',
        isLoading: false,
      });
      localStorage.removeItem('activeChatId');
      localStorage.setItem(`reportCompleted_${sessionId}`, 'true');
      setIsWebSocketOnline(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  };

  // Periodic status check every 10 seconds
  useEffect(() => {
    statusIntervalRef.current = setInterval(() => {
      const isWsOpen = wsRef.current && wsRef.current.readyState === WebSocket.OPEN;
      setIsWebSocketOnline(isWsOpen);
      setNotificationState((prev) => {
        const updatedMessage = isWsOpen ? 'WebSocket connected, awaiting updates...' : 'WebSocket disconnected';
        console.log('Periodic status check - WebSocket Online:', isWsOpen, 'Loading:', prev.isLoading);
        return {
          ...prev,
          message: updatedMessage,
          isLoading: prev.isLoading,
        };
      });
    }, 10000);

    return () => {
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
      if (wsRef.current) {
        console.log('Component unmounting, closing WebSocket:', wsRef.current.url);
        wsRef.current.close();
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current); // Cleanup existing timeout if any
    };
  }, []);

  const isNotificationActive = () => {
    return notificationState.message !== 'Waiting for report generation...' && notificationState.message !== '';
  };

  useEffect(() => {
    console.log('Rendering App, notificationState:', notificationState, 'isWebSocketOnline:', isWebSocketOnline);
  }, [notificationState, isWebSocketOnline]);

  if (loading) return <div>Loading...</div>;
  if (isAuthenticated && !clientId) return <div>Error: Client ID is missing.</div>;

  return (
    <div className="app-container">
      {isNotificationActive() && (
        <div className="notification-wrapper">
          <Notification
            headline={notificationState.headline}
            message={notificationState.message}
            targetName={notificationState.targetName}
            isWebSocketOnline={isWebSocketOnline}
            isLoading={notificationState.isLoading}
          />
        </div>
      )}
      {isAuthenticated && (
        <button onClick={handleReset} className="reset-button">
          Reset App (Logout and Clear Data)
        </button>
      )}
      <div className="main-parent" style={{ marginTop: isNotificationActive() ? '90px' : '0' }}>
        <div className="left-bar">
          <LeftBar clientId={clientId} />
        </div>
        <div className="main-interface">
          <Routes>
            <Route path="/login" element={<LoginPage companyName={companyName} />} />
            <Route
              path="/dashboard/*"
              element={
                isAuthenticated && clientId ? (
                  <MainInterface
                    clientId={clientId}
                    userName={userName}
                    uid={uid}
                    connectWebSocket={connectWebSocket}
                  />
                ) : (
                  <div>Loading dashboard...</div>
                )
              }
            />
            <Route
              path="/:clientId/moderator/*"
              element={
                isAuthenticated && clientId ? (
                  <ModeratorLayout clientId={clientId} />
                ) : (
                  <div>Loading moderator panel...</div>
                )
              }
            />
            <Route path="*" element={<LoginPage companyName={companyName} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;