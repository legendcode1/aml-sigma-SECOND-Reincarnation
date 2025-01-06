import React, { useState } from 'react';
import './App.css'; // Import global styles
import LeftBar from './Component/LeftBar'; // Ensure correct import path
import MainInterface from './Component/MainInterface'; // Import MainInterface

const App = () => {
  const initialSearchParams = {
    name: '',
    age: '',
    occupation: ''
  };

  const [searchParams, setSearchParams] = useState(initialSearchParams);
  const [savedItems, setSavedItems] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const saveData = () => {
    if (searchParams.name.trim()) {
      setSavedItems((prevItems) => [...prevItems, searchParams]);
      setSubmitted(true);
      setSearchParams(initialSearchParams); // Reset the form inputs
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleState = () => {
    setSubmitted(!submitted);
  };

  return (
    <div className="main-parent">
      <LeftBar savedItems={savedItems} toggleState={toggleState} />
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
