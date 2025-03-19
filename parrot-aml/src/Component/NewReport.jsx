// parrot-aml/src/Component/NewReport.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import '../StyleSheet/NewReport.css';
import send from '../assets/newreport/send.png';
import useWebSocket from '../utils/websocket';

const NewReport = ({ clientId, userName, uid }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    occupation: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const { messages } = useWebSocket(sessionId);

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
    if (!uid) {
      setError('User ID is missing. Please log in again.');
      return;
    }
    setLoading(true);
    setError(null);

    const newSessionId = uuidv4();
    setSessionId(newSessionId); // Triggers WebSocket connection
    const chatId = uuidv4();

    const payload = {
      session_id: newSessionId,
      client_id: clientId,
      pep_name: name,
      pep_occupation: occupation,
      pep_age: age,
      pep_gender: gender,
      UID: uid,
    };

    try {
      // Create chat document
      const chatDocRef = doc(db, 'client', clientId, 'chat_history', chatId);
      await setDoc(chatDocRef, {
        headline: `Report for ${name}`,
        sender: userName,
        dateMade: serverTimestamp(),
        pep_name: name,
        pep_occupation: occupation,
        pep_age: age,
        pep_gender: gender,
        session_id: newSessionId,
        uid: uid,
      });

      // Create initial message
      const initialReportRef = doc(db, 'client', clientId, 'chat_history', chatId, 'messages', 'initial-report');
      await setDoc(initialReportRef, {
        prompt: `Initial report request for ${name}`,
        output: '',
        timestamp: serverTimestamp(),
      });

      // Send report request to backend
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/report`, payload);

      if (!response.data || !response.data.report) {
        throw new Error('Invalid response from backend.');
      }

      // Update initial message with report
      await setDoc(initialReportRef, {
        output: response.data.report,
      }, { merge: true });

      // Navigate to chat view
      navigate(`/dashboard/chat/${chatId}`);
    } catch (e) {
      console.error('Error saving report:', e);
      if (e.response?.status === 404) {
        setError('Report endpoint not found. Contact support.');
      } else if (e.code === 'ECONNRESET' || e.response?.status === 504) {
        setError('The report is taking longer than expected (up to 5 minutes). Please wait.');
      } else {
        setError('Failed to generate report. Please try again.');
      }
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
          {loading && (
            <div className="loading-container">
              <p>Generating report... This may take up to 15 minutes.</p>
              {messages.length > 0 && (
                <div className="progress-messages">
                  <h3>Progress Updates:</h3>
                  {messages.map((msg, index) => (
                    <p key={index}>
                      {msg.type === 'status'
                        ? `Status: ${msg.message}`
                        : msg.type === 'need_more_info'
                          ? `Query: ${msg.query}`
                          : JSON.stringify(msg)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

NewReport.propTypes = {
  clientId: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  uid: PropTypes.string.isRequired,
};

export default NewReport;