// filepath: /c:/Users/Ananta Anugrah/Desktop/aml sigma SECOND Reincarnation/parrot-aml/src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { app, firestore } from './firebase/firebase'; // Correct import for app and firestore
import LeftBar from './Component/LeftBar';
import MainInterface from './Component/MainInterface';
import LoginPage from './login system/LoginPage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Domain-to-client_id mapping
const domainClientMapping = {
  'transinergi.com': { client_id: '-transinergi', 'company-name': 'Trans Sinergi' },
  'datum.com': { client_id: '-datum', 'company-name': 'DatumCorp' }
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
  const [initialAuthCheck, setInitialAuthCheck] = useState(false); // Track initial authentication check
  const navigate = useNavigate();

  // Get company name based on the domain
  const domain = window.location.hostname;
  const companyName = domainClientMapping[domain]?.['company-name'] || 'Unknown Company';

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
    const auth = getAuth(app); // Ensure to use 'app' here for correct Firebase instance
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed', user);
      if (user) {
        setIsAuthenticated(true); // User is authenticated
        if (!initialAuthCheck) {
          navigate('/main'); // Redirect to the main layout only once
        }
      } else {
        setIsAuthenticated(false); // User is not authenticated
        navigate('/login'); // Redirect to the login page
      }
      setInitialAuthCheck(true); // Mark the initial authentication check as completed
    });

    return () => unsubscribe();
  }, [navigate, initialAuthCheck]);

  const resetApp = () => {
    console.log('Resetting app...');
    // Reset Firebase Auth state and remove client_id from localStorage
    const auth = getAuth(app);
    auth.signOut(); // Log out the user
    localStorage.removeItem('client_id'); // Remove stored client_id
    setIsAuthenticated(false); // Update the authentication state
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="app-container">
      {/* Reset button placed outside the main layout */}
      <button onClick={resetApp} className="reset-button">Reset App (Logout and Clear Data)</button>

      <Routes>
        {/* Login route */}
        <Route path="/login" element={<LoginPage companyName={companyName} />} />

        {/* Main layout route (protected route) */}
        <Route
          path="/main/*"
          element={
            isAuthenticated ? (
              <div className="main-parent">
                <div className="left-bar">
                  <LeftBar savedItems={savedItems} />
                </div>
                <div className="main-interface">
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <MainInterface
                          submitted={submitted}
                          searchParams={searchParams}
                          handleInputChange={handleInputChange}
                          saveData={saveData}
                        />
                      }
                    />
                    <Route
                      path="chat/:chatId"
                      element={
                        <MainInterface
                          submitted={submitted}
                          searchParams={searchParams}
                          handleInputChange={handleInputChange}
                          saveData={saveData}
                        />
                      }
                    />
                  </Routes>
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