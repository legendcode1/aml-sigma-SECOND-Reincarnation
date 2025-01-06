import React, { useState } from 'react';
import './App.css'; // Import global styles
import LeftBar from './Component/LeftBar'; // Ensure correct import path
import MainInterface from './Component/MainInterface'; // Import MainInterface

const App = () => {
  const [searchParams, setSearchParams] = useState({
    name: '',
    age: '',
    occupation: ''
  });

  const [savedItems, setSavedItems] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const saveData = () => {
    if (searchParams.name.trim()) {
      setSavedItems((prevItems) => [...prevItems, searchParams]);
      setSubmitted(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
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
  );
};

export default App;