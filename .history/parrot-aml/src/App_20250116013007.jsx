import React, { useState, useEffect } from 'react';
import './App.css'; 
import { Route, Routes, useNavigate } from 'react-router-dom';
import { app, firestore } from './firebase'; // Import 'app' and 'firestore' correctly
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
    const auth = getAuth(app); // Make sure to pass the 'app' object here
    const unsubscribe = onAuthStateChanged(auth, (user) => {
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

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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
vvvv