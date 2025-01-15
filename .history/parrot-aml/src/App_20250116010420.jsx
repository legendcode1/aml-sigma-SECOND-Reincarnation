import React, { useState, useEffect } from 'react';
import './App.css'; // Import global styles
import LeftBar from './Component/LeftBar'; // Ensure correct import path
import MainInterface from './Component/MainInterface'; // Import MainInterface
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom'; // For routing
import LoginPage from './login system/LoginPage'; // Login page component
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Firebase Auth

const App = () => {
  const [searchParams, setSearchParams] = useState({
    name: '',
    age: '',
    occupation: ''
  });

  const [savedItems, setSavedItems] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track login status
  const navigate = useNavigate(); // Navigate for redirecting

  // Save data to savedItems if the name field is not empty
  const saveData = () => {
    if (searchParams.name.trim()) {
      setSavedItems((prevItems) => [...prevItems, searchParams]);
      setSubmitted(true);
    }
  };

  // Handle input changes and update the searchParams state
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Check authentication status and redirect accordingly
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true); // User is authenticated
        navigate('/main'); // Redirect to the main layout if authenticated
      } else {
        setIsAuthenticated(false); // User is not authenticated
        navigate('/login'); // Redirect to the login page if not authenticated
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <Router>
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
    </Router>
  );
};

export default App;
