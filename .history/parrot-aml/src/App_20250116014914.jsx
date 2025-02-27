import React, { useState, useEffect } from 'react';
import './App.css';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { app, firestore } from './firebase'; // Correct import for app and firestore
import LeftBar from './Component/LeftBar';
import MainInterface from './Component/MainInterface';
import LoginPage from './login system/LoginPage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
      if (user) {
        setIsAuthenticated(true); // User is authenticated
        navigate('/main'); // Redirect to the main layout
      } else {
        setIsAuthenticated(false); // User is not authenticated
        navigate('/login'); // Redirect to the login page
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <Routes>
      {/* Login route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Main layout route (protected route) */}
      <Route
        path="/main"
        element={
          isAuthenticated ? (
            <div className="main-parent">
              <div className="left-bar">
                <LeftBar savedItems={savedItems} />
              </div>
              <MainInterface
                submitted={submitted}
                searchParams={searchParams}
                handleInputChange={handleInputChange}
                saveData={saveData}
              />
            </div>
          ) : (
            <p>You must log in to access the main layout.</p>
          )
        }
      />
    </Routes>
  );
};

export default App;
