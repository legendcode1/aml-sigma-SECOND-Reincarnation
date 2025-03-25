// parrot-aml/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import LeftBar from './Component/LeftBar';
import MainInterface from './Component/MainInterface';
import ModeratorLayout from './Component/ModeratorLayout';
import LoginPage from './login system/LoginPage';
import LoginSection from './Component/LoginSection';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { fetchUserDataByUID, fetchCompanyDataByID } from './auth/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase/firebase';
import { WebSocketProvider } from './utils/WebSocketContext';
import './StyleSheet/global.css';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [userName, setUserName] = useState('');
  const [uid, setUid] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('Auth state changed:', user);
        setIsAuthenticated(true);
        setUid(user.uid);
        setUserId(user.uid);
        try {
          const userData = await fetchUserDataByUID(user.uid);
          console.log('Fetched user data:', userData);
          const companyId = userData['company id'];
          if (!companyId) throw new Error('Company ID not found in user data.');
          console.log('Company ID:', companyId);
          const companyData = await fetchCompanyDataByID(companyId);
          console.log('Fetched company data:', companyData);
          setClientId(companyId);
          setCompanyName(companyData.company_name || 'Unknown Company');
          setUserName(userData.name || 'Unknown User');
          setUserPhotoURL(userData.photoURL || '/default-profile.png');
          setUserRole(userData.role || 'User');

          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { lastOnline: serverTimestamp() });

          if (!location.pathname.startsWith('/dashboard')) {
            navigate('/dashboard');
            console.log('Navigated to /dashboard');
          }
        } catch (error) {
          console.error('Error during authentication:', error);
          setIsAuthenticated(false);
          setClientId(null);
          setCompanyName('');
          setUserName('');
          setUid(null);
          setUserId(null);
          setUserPhotoURL(null);
          setUserRole(null);
          navigate('/login');
        }
      } else {
        setIsAuthenticated(false);
        setClientId(null);
        setCompanyName('');
        setUserName('');
        setUid(null);
        setUserId(null);
        setUserPhotoURL(null);
        setUserRole(null);
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate, location]);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await auth.signOut();
      console.log('User signed out successfully.');
      setIsAuthenticated(false);
      setClientId(null);
      setCompanyName('');
      setUserName('');
      setUid(null);
      setUserId(null);
      setUserPhotoURL(null);
      setUserRole(null);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (isAuthenticated && !clientId) return <div>Error: Client ID is missing.</div>;

  return (
    <WebSocketProvider clientId={clientId}>
      <div className="app-container">
        {isAuthenticated && location.pathname.startsWith('/dashboard') && (
          <LoginSection
            userName={userName}
            companyName={companyName}
            userPhotoURL={userPhotoURL}
            onLogout={handleLogout}
            clientId={clientId}
            uid={uid}
            userId={userId}
          />
        )}
        <Routes>
          <Route path="/login" element={<LoginPage companyName={companyName} />} />
          <Route
            path="/dashboard/*"
            element={
              isAuthenticated && clientId ? (
                <div className="main-parent">
                  <div className="left-bar">
                    <LeftBar clientId={clientId} />
                  </div>
                  <div className="main-interface">
                    <MainInterface clientId={clientId} userName={userName} uid={uid} />
                  </div>
                </div>
              ) : (
                <div>Loading dashboard...</div>
              )
            }
          />
          <Route
            path="/dashboard/moderator/*"
            element={
              isAuthenticated && clientId && userRole === 'Moderator' ? (
                <div className="main-parent">
                  <div className="left-bar">
                    <LeftBar clientId={clientId} />
                  </div>
                  <div className="main-interface">
                    <ModeratorLayout clientId={clientId} userName={userName} uid={uid} />
                  </div>
                </div>
              ) : (
                <div>You do not have permission to access this page.</div>
              )
            }
          />
          <Route path="*" element={<LoginPage companyName={companyName} />} />
        </Routes>
      </div>
    </WebSocketProvider>
  );
};

export default App;