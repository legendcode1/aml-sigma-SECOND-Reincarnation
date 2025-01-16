import React, { useState, useEffect } from 'react';
import './App.css';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { app, firestore } from './firebase';
import LeftBar from './Component/LeftBar';
import MainInterface from './Component/MainInterface';
import LoginPage from './login system/LoginPage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Add domain to company name mapping
const domainClientMapping = {
  'transinergi.com': { 'client-id': 'client-id-transinergi', 'company-name': 'Trans Sinergi' },
  'datum.com': { 'client-id': 'client-id-datum', 'company-name': 'DatumCorp' },
};

const App = () => {
  const [searchParams, setSearchParams] = useState({
    name: '',
    age: '',
    occupation: ''
  });
  const [savedItems, setSavedItems] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Get the domain and map it to a company name
  const domain = window.location.hostname;  // Get the current domain
  const companyName = domainClientMapping[domain]?.['company-name'] || 'Unknown Company';  // Default to 'Unknown Company' if no match

  const saveData = () => {
    if (searchParams.name.trim()) {
      setSavedItems((prevItems) => [...prevItems, searchParams]);
      setSubmitted(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Check authentication status
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed', user);
      if (user) {
        setIsAuthenticated(true);
        navigate('/main');
      } else {
        setIsAuthenticated(false);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const resetApp = () => {
    console.log('Resetting app...');
    const auth = getAuth(app);
    auth.signOut(); 
    localStorage.removeItem('client_id'); 
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className="app-container">
      <button onClick={resetApp} className="reset-button">Reset App (Logout and Clear Data)</button>

      <Routes>
        <Route 
          path="/login" 
          element={<LoginPage companyName={companyName} />}  // Pass company name here
        />
        <Route
          path="/main"
          element={
            isAuthenticated ? (
              <div className="main-parent">
                <div className="left-bar">
                  <LeftBar savedItems={savedItems} />
                </div>
                <div className="main-interface">
                  <MainInterface
                    submitted={submitted}
                    searchParams={searchParams}
                    handleInputChange={handleInputChange}
                    saveData={saveData}
                  />
                </div>
              </div>
            ) : (
              <p>You must log in to access the main layout.</p>
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;
