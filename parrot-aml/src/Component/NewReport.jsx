import React from 'react';
import '../StyleSheet/NewReport.css'; // Update the CSS file import
import send from '../assets/newreport/send.png'; // Update the image path
import { firestore } from '../firebase/firebase'; // Update the path
import { addDoc, collection } from 'firebase/firestore';
import { generateReport } from '../apiService'; // Import the API service

const NewReport = ({ searchParams, handleInputChange, saveData, setReport }) => {
  const ref = collection(firestore, 'messages');

  const handleSave = async () => {
    saveData(searchParams);
    console.log(searchParams);

    let data = {
      name: searchParams.name,
      age: searchParams.age,
      occupation: searchParams.occupation,
      gender: searchParams.gender
    };

    try {
      await addDoc(ref, data);
      console.log("Document successfully written!");

      // Generate the report
      const generatedReport = await generateReport(
        "1234abcd-efgh-5678-ijkl-9012mnop3456", // Replace with actual session ID
        "CompanyXYZ", // Replace with actual client ID
        searchParams.name,
        searchParams.occupation,
        searchParams.age,
        searchParams.gender
      );

      // Pass the generated report back to the parent component
      setReport(generatedReport);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

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
                  value={searchParams.name || ''}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
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
                  value={searchParams.age || ''}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="search-input"
                />
              </div>
              <div className="occupation-input-container">
                <input
                  type="text"
                  name="occupation"
                  placeholder="Occupation"
                  value={searchParams.occupation || ''}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="search-input"
                />
              </div>
              <div className="gender-input-container">
                <input
                  type="text"
                  name="gender"
                  placeholder="Gender"
                  value={searchParams.gender || ''}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="search-input"
                />
              </div>
            </div>
          </div>
          <div className="report-container">
            <h2>Generated Report</h2>
            <div className="report-content">
              {/* Placeholder for the report content */}
              {/* Remove the incorrect usage of the report prop */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewReport;