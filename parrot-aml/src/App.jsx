// src/App.jsx

import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import LeftBar from './Component/LeftBar';
import MainInterface from './Component/MainInterface';
import LoginPage from './login system/LoginPage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { fetchUserDataByUID, fetchCompanyDataByID } from './auth/auth'; // Import necessary functions
import axios from 'axios';
import './App.css';

/**
 * App Component
 *
 * This is the root component of the application.
 * It handles authentication state and routes accordingly.
 */
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [companyName, setCompanyName] = useState(''); // State for companyName
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Define domain to company mapping
  const domainClientMapping = {
    'transinergi.com': { client_id: 'transinergi116', 'company-name': 'Sinergi Trans' },
    'datum.com': { client_id: 'datumCorp', 'company-name': 'DatumCorp' },
    'localhost': { client_id: 'transinergi116', 'company-name': 'Sinergi Trans' }, // For development
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('Auth state changed:', user);
        setIsAuthenticated(true);

        try {
          // Fetch user data
          const userData = await fetchUserDataByUID(user.uid);
          console.log('Fetched user data:', userData);

          // Extract company ID from user data
          const companyId = userData['company id'];
          if (!companyId) {
            throw new Error('Company ID not found in user data.');
          }
          console.log('Company ID:', companyId);

          // Fetch company data if needed
          const companyData = await fetchCompanyDataByID(companyId);
          console.log('Fetched company data:', companyData);

          // Set clientId state
          setClientId(companyId);
          console.log('clientId set to:', companyId);

          // Determine companyName based on the domain
          const hostname = window.location.hostname;
          const mapping = domainClientMapping[hostname] || domainClientMapping['localhost'];
          const determinedCompanyName = mapping['company-name'] || 'Unknown Company';
          setCompanyName(determinedCompanyName);

          // Redirect to dashboard after successful login
          navigate('/dashboard');
        } catch (error) {
          console.error('Error during authentication:', error);
          // Handle errors (e.g., show a notification)
          setIsAuthenticated(false);
          setClientId(null);
          navigate('/login');
        }
      } else {
        setIsAuthenticated(false);
        setClientId(null);
        setCompanyName('');
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  /**
   * Handle user logout
   */
  const handleReset = async () => {
    const auth = getAuth();
    try {
      await auth.signOut();
      console.log('User signed out successfully.');
      setIsAuthenticated(false);
      setClientId(null);
      setCompanyName('');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading state until authentication is checked
  }

  if (isAuthenticated && !clientId) {
    // Authentication is complete but clientId was not fetched
    return <div>Error: Client ID is missing.</div>;
  }

  return (
    <div className="app-container">
      {/* Reset button placed outside the main layout */}
      {isAuthenticated && (
        <button onClick={handleReset} className="reset-button">
          Reset App (Logout and Clear Data)
        </button>
      )}

      <Routes>
        {/* Login route */}
        <Route path="/login" element={<LoginPage companyName={companyName} />} />

        {/* Dashboard routes */}
        <Route
          path="/dashboard/*"
          element={
            isAuthenticated && clientId ? (
              <div className="main-parent">
                <div className="left-bar">
                  <LeftBar />
                </div>
                <div className="main-interface">
                  <MainInterface clientId={clientId} />
                </div>
              </div>
            ) : (
              <div>Loading dashboard...</div>
            )
          }
        />

        {/* Redirect any other routes to /login */}
        <Route path="*" element={<LoginPage companyName={companyName} />} />
      </Routes>
    </div>
  );
};

export default App;
