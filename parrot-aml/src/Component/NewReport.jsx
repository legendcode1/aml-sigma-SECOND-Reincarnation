// src/Component/NewReport.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import '../StyleSheet/NewReport.css'; // Ensure correct path
import send from '../assets/newreport/send.png'; // Ensure correct path

/**
 * NewReport Component
 *
 * Allows users to generate a new report by filling out a form.
 * Upon submission, it saves data to Firestore and sends a POST request to the backend.
 *
 * Props:
 * - clientId (string): The unique identifier for the client/company.
 */
const NewReport = ({ clientId }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    name: '',
    age: '',
    occupation: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle input changes in the form
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle form submission
   */
  const handleSave = async () => {
    const { name, age, occupation, gender } = searchParams;

    // Validate form fields
    if (!name || !age || !occupation || !gender) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    setError(null);

    // Generate unique identifiers
    const sessionId = uuidv4();
    const chatId = uuidv4();

    // Prepare data to send to the backend
    const data = {
      session_id: sessionId,
      client_id: clientId,
      pep_name: name,
      pep_occupation: occupation,
      pep_age: age,
      pep_gender: gender,
    };

    try {
      // Save the initial report message to Firestore
      const messagesCollectionRef = collection(db, 'client', clientId, 'chat_history', chatId, 'messages');
      await addDoc(messagesCollectionRef, {
        content: `Report generated for ${name}`,
        sender: 'user',
        timestamp: serverTimestamp(),
      });
      console.log('Initial report saved to Firestore!');

      // Send data to backend
      console.log('Sending data to backend:', data);
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/report`, data);
      console.log('Received response from backend:', response.data);

      if (!response.data || !response.data.report) {
        throw new Error('Invalid response from backend.');
      }

      // Navigate to chat history
      console.log(`Navigating to /dashboard/chat/${chatId}`);
      navigate(`/dashboard/chat/${chatId}`);
      console.log(`Navigation to /dashboard/chat/${chatId} successful`);
    } catch (e) {
      console.error('Error communicating with backend:', e);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-report-container">
      <div className="search-sect-padding">
        <div className="search-sect">
          <h1 className="search-title">Search a Target</h1>
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
                  required
                />
                <button
                  className="search-icon"
                  onClick={handleSave}
                  disabled={loading}
                  aria-label="Generate Report"
                >
                  <img src={send} alt="Send" />
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
                  required
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
                  required
                />
              </div>
              <div className="gender-input-container">
                <input
                  type="text"
                  name="gender"
                  placeholder="Gender"
                  value={searchParams.gender}
                  onChange={handleInputChange}
                  className="search-input"
                  required
                />
              </div>
            </div>
          </div>
          {/* Display error message if any */}
          {error && <div className="error-message">{error}</div>}
          {/* Display loading message if processing */}
          {loading && <div className="loading-message">Generating report...</div>}
        </div>
      </div>
    </div>
  );
};

// Prop type validation
NewReport.propTypes = {
  clientId: PropTypes.string.isRequired,
};

export default NewReport;
