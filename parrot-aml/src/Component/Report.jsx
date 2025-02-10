import React, { useState, useEffect } from 'react';
import '../StyleSheet/Report.css';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';

const Report = ({ clientId }) => {
  const { chatId } = useParams();
  const [initialReport, setInitialReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialReport = async () => {
      try {
        setLoading(true); // Reset loading state
        setInitialReport(null); // Clear previous report
        setError(null); // Clear any previous errors

        if (!chatId) {
          throw new Error('Chat ID is missing.');
        }

        const messageRef = doc(
          db, 
          'client', 
          clientId, 
          'chat_history', 
          chatId,
          'messages',
          'initial-report'
        );
        
        const messageDoc = await getDoc(messageRef);
        
        if (!messageDoc.exists()) {
          throw new Error('Initial report message not found.');
        }

        setInitialReport(messageDoc.data());

      } catch (err) {
        console.error('Error fetching initial report message:', err);
        setError(err.message || 'Failed to load initial report.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialReport();
  }, [chatId, clientId]); // Added chatId to dependency array

  if (loading) return <div className="loading-messages">Loading initial report...</div>;
  if (error) return <div className="error-messages">{error}</div>;

  return (
    <div className="report-container">
      <div className="report-section-padding">
        <div className="report-section">
          <h1 className="chat-title">Initial Report</h1>
          {initialReport && (
            <div className="chat-meta">
              <span>
                Date Made:{' '}
                {initialReport.timestamp
                  ? new Date(initialReport.timestamp.seconds * 1000).toLocaleString()
                  : 'N/A'}
              </span>
            </div>
          )}
        </div>
        <hr className="no-padding-hr" />
        {initialReport && (
          <div className="message-api">
            <div className='api-message'>
              <div className="message-output">
                <ReactMarkdown>{initialReport.output || ''}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Report.propTypes = {
  clientId: PropTypes.string.isRequired,
};

export default Report;