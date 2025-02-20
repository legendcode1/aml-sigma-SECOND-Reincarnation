import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import LeftBar from './Component/LeftBar';
import MainInterface from './Component/MainInterface';
import ModeratorLayout from './Component/ModeratorLayout';
import LoginPage from './login system/LoginPage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { fetchUserDataByUID, fetchCompanyDataByID } from './auth/auth';
import './StyleSheet/global.css';
import './App.css';

// Cloudinary imports (optional)
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';

const cld = new Cloudinary({ cloud: { cloudName: 'dolqhixzw' } });

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('Auth state changed:', user);
        setIsAuthenticated(true);
        try {
          const userData = await fetchUserDataByUID(user.uid);
          console.log('Fetched user data:', userData);
          const companyId = userData.companyId || userData['company id'];
          if (!companyId) {
            throw new Error('Company ID not found in user data.');
          }
          console.log('Company ID:', companyId);
          const companyData = await fetchCompanyDataByID(companyId);
          console.log('Fetched company data:', companyData);
          setClientId(companyId);
          setCompanyName(companyData.company_name || 'Unknown Company');
          setUserName(userData.name || 'Unknown User');
          if (location.pathname === '/' || location.pathname === '/login') {
            navigate('/dashboard');
            console.log('Navigated to /dashboard');
          }
        } catch (error) {
          console.error('Error during authentication:', error);
          setIsAuthenticated(false);
          setClientId(null);
          setCompanyName('');
          setUserName('');
          navigate('/login');
        }
      } else {
        setIsAuthenticated(false);
        setClientId(null);
        setCompanyName('');
        setUserName('');
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate, location]);

  const handleReset = async () => {
    const auth = getAuth();
    try {
      await auth.signOut();
      console.log('User signed out successfully.');
      setIsAuthenticated(false);
      setClientId(null);
      setCompanyName('');
      setUserName('');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (isAuthenticated && !clientId) return <div>Error: Client ID is missing.</div>;

  return (
    <div className="app-container">
      {isAuthenticated && (
        <button onClick={handleReset} className="reset-button">
          Reset App (Logout and Clear Data)
        </button>
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
                  <MainInterface clientId={clientId} userName={userName} />
                </div>
              </div>
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
  );
};

export default App;
