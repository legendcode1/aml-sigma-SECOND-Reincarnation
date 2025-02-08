// src/Component/NewReport.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { setDoc, doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import '../StyleSheet/NewReport.css';
import send from '../assets/newreport/send.png';

const NewReport = ({ clientId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    occupation: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const { name, age, occupation, gender } = formData;
    if (!name || !age || !occupation || !gender) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setError(null);

    // Generate unique IDs for the session and chat document
    const sessionId = uuidv4();
    const chatId = uuidv4();

    // Prepare the backend payload
    const payload = {
      session_id: sessionId,
      client_id: clientId,
      pep_name: name,
      pep_occupation: occupation,
      pep_age: age,
      pep_gender: gender,
    };

    try {
      // Create a new chat document with a fixed ID and fields:
      // headline, sender, and dateMade
      const chatDocRef = doc(db, 'client', clientId, 'chat_history', chatId);
      await setDoc(chatDocRef, {
        headline: `Report for ${name}`,
        sender: 'user',
        dateMade: serverTimestamp(),
      });
      console.log('Chat document created with ID:', chatId);

      // Create the initial message in the "messages" subcollection (prompt)
      const messagesRef = collection(db, 'client', clientId, 'chat_history', chatId, 'messages');
      await addDoc(messagesRef, {
        prompt: `Initial report request for ${name}`,
        output: '', // No output yet
        timestamp: serverTimestamp(),
      });
      console.log('Initial user message saved.');

      // Send payload to the backend to generate the report
      console.log('Sending data to backend:', payload);
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/report`, payload);
      console.log('Received response from backend:', response.data);

      if (!response.data || !response.data.report) {
        throw new Error('Invalid response from backend.');
      }

      // Save the backend response as a new message (output)
      await addDoc(messagesRef, {
        prompt: '', // No prompt here
        output: response.data.report,
        timestamp: serverTimestamp(),
      });
      console.log('Backend report saved.');

      // Navigate to the chat history view for this chat
      navigate(`/dashboard/chat/${chatId}`);
      console.log(`Navigated to /dashboard/chat/${chatId}`);
    } catch (e) {
      console.error('Error saving report:', e);
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
                  value={formData.name}
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
                  value={formData.age}
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
                  value={formData.occupation}
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
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="search-input"
                  required
                />
              </div>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading-message">Generating report...</div>}
        </div>
      </div>
    </div>
  );
};

NewReport.propTypes = {
  clientId: PropTypes.string.isRequired,
};

export default NewReport;
