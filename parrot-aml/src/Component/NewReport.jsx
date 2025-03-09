// parrot-aml/src/NewReport.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import '../StyleSheet/NewReport.css';
import send from '../assets/newreport/send.png';

const NewReport = ({ clientId, userName, uid, connectWebSocket }) => {
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

    const chatId = uuidv4();
    console.log('Generated chatId:', chatId);
    const payload = {
      session_id: chatId,
      client_id: clientId,
      pep_name: name,
      pep_occupation: occupation,
      pep_age: age,
      pep_gender: gender,
      UID: uid,
    };
    console.log('Payload for /report:', payload);

    try {
      const chatDocRef = doc(db, 'client', clientId, 'chat_history', chatId);
      await setDoc(chatDocRef, {
        headline: `Report for ${name}`,
        sender: userName,
        dateMade: serverTimestamp(),
        pep_name: name,
        pep_occupation: occupation,
        pep_age: age,
        pep_gender: gender,
      });
      console.log('Chat document created with ID:', chatId);

      console.log('Connecting to WebSocket before report request');
      connectWebSocket(chatId);
      localStorage.setItem('activeChatId', chatId);

      setNotificationData({
        headline: 'Generating Initial Report...',
        message: 'Loading report...',
        targetName: name,
        isLoading: true,
      });

      console.log('Sending POST request to /report:', `${import.meta.env.VITE_BACKEND_URL}/report`);
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/report`, payload); // Removed timeout option
      console.log('Backend response received:', response.data);
      if (!response.data || !response.data.report) {
        throw new Error('Invalid response from backend: ' + JSON.stringify(response.data));
      }

      setTimeout(() => {
        console.log('Navigating to chat view:', `/dashboard/chat/${chatId}`);
        navigate(`/dashboard/chat/${chatId}`);
      }, 500);
    } catch (e) {
      console.error('Error during report submission:', e.message, e.response?.data, e.response?.status);
      setError(`Failed to generate report: ${e.message}`);
      setNotificationData({
        headline: 'Report Generation Error',
        message: `Failed: ${e.response?.data?.error || e.message}${e.response?.data?.details ? ' - ' + e.response.data.details : ''}`,
        targetName: name,
        isLoading: false,
      });
    } finally {
      console.log('Resetting loading state');
      setNotificationData({
        headline: 'Generating Initial Report...',
        message: 'Waiting for report generation...',
        targetName: 'No target yet',
        isLoading: false,
      });
      setLoading(false);
    }
  };

  const setNotificationData = (data) => {
    console.log('Dispatching updateNotification event with:', data);
    window.dispatchEvent(new CustomEvent('updateNotification', { detail: data }));
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
  userName: PropTypes.string.isRequired,
  uid: PropTypes.string.isRequired,
  connectWebSocket: PropTypes.func.isRequired,
};

export default NewReport;