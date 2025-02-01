import React from 'react';
import '../StyleSheet/NewReport.css'; // Update the CSS file import
import send from '/newreport/send.png'; // Update the image path
import {firebase} from '../firebase'; // Update the path
import { addDoc, collection } from 'firebase/firestore';

const NewReport = ({ searchParams, handleInputChange, saveData }) => {
  const handleSave = () => {
    saveData(searchParams);
    console.log(searchParams);
  };

  const ref = collection(firebase, 'messages');

  return (
    <div className="new-report-container">
      <div className="search-sect-padding">
        <div className="search-sect">
          <h1 className="search-title">Search a target</h1>
          <div className="search-bars">
            <div className="name-bar">
              <div className="search-input-container">
                <input
                  type="text"
                  name="name"
                  placeholder="Search a name..."
                  value={searchParams.name}
                  onChange={handleInputChange}
                  className="search-input"
                />
                <button className="search-icon" onClick={handleSave}>
                  <img 
                    src={send}
                    alt="send"
                  />
                </button>
              </div>
            </div>
            <div className="search-bar">
              <div className="age-input-container">
                <input
                  type="text"
                  name="age"
                  placeholder="Age"
                  value={searchParams.age}
                  onChange={handleInputChange}
                  className="search-input"
                />
              </div>
              <div className="occupation-input-container">
                <input
                  type="text"
                  name="occupation"
                  placeholder="Occupation"
                  value={searchParams.occupation}
                  onChange={handleInputChange}
                  className="search-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewReport;
