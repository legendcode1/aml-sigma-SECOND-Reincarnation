import React, { useState, useEffect } from 'react';
import './App.css'; 
import LeftBar from './Component/LeftBar'; 
import MainInterface from './Component/MainInterface'; 
import { Route, Routes, useNavigate } from 'react-router-dom'; 
import LoginPage from './login system/LoginPage'; 
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'; // Firebase Auth
import { firebaseApp } from './firebase'; // Import firebase initialization

const auth = getAuth(firebaseApp);

const App = () => {
  const [searchParams, setSearchParams] = useState({
    name: '',
    age: '',
    occupation: ''
  });

  const [savedItems, setSavedItems] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // Sign in function
  const signIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  // Sign out function
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setIsAuthenticated(false);
        navigate('/login'); 
      })
      .catch((error) => {
        console.error("Sign out error:", error.message);
      });
  };

  return (
    <Routes>
      {/* Login route */}
      <Route path="/login" element={<LoginPage signIn={signIn} email={email} setEmail={setEmail} password={password} setPassword={setPassword} />} />

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
              <button onClick={handleSignOut}>Sign Out</button>
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
vvvvvvvv