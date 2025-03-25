// parrot-aml/src/Component/Report.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import remarkGfm from "remark-gfm";
import { db } from '../firebase/firebase';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { useWebSocketContext } from '../utils/WebSocketContext';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import '../StyleSheet/Report.css';

const Report = ({ clientId }) => {
  const { chatId } = useParams();
  const [initialReport, setInitialReport] = useState(null);
  const [progressMessages, setProgressMessages] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { stopSession } = useWebSocketContext();
  const progressRef = useRef(null);

  // Fetch chat status
  useEffect(() => {
    if (!chatId || !clientId) {
      setError('Chat ID or Client ID is missing.');
      setLoading(false);
      return;
    }

    const chatDocRef = doc(db, 'client', clientId, 'chat_history', chatId);
    const unsubscribe = onSnapshot(
      chatDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setStatus(data.status);
          if (data.status === 'completed' || data.status === 'failed') {
            stopSession(chatId);
          }
        } else {
          setError('Chat document not found.');
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId, clientId, stopSession]);

  // Fetch initial report when status is 'completed' or progress indicates completion
  useEffect(() => {
    if ((!chatId || !clientId) || (status !== 'completed' && !progressMessages.some(msg =>
      (msg.content.message || msg.content.query || '').includes('Report generation completed.')
    ))) return;

    const messageRef = doc(db, 'client', clientId, 'chat_history', chatId, 'messages', 'initial-report');
    const unsubscribe = onSnapshot(
      messageRef,
      (msgDoc) => {
        if (msgDoc.exists()) {
          setInitialReport(msgDoc.data());
          console.log('Initial Report Fetched:', msgDoc.data()); // Debug log
        } else {
          console.log('Initial report document not found.');
        }
      },
      (err) => {
        setError(err.message);
        console.error('Error fetching initial report:', err);
      }
    );

    return () => unsubscribe();
  }, [status, chatId, clientId, progressMessages]);

  // Fetch progress messages when status is 'processing'
  useEffect(() => {
    if (status !== 'processing' || !chatId || !clientId) return;

    const messagesRef = collection(db, 'client', clientId, 'chat_history', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs
          .map((docSnapshot) => docSnapshot.data())
          .filter((msg) => msg.type === 'progress');
        setProgressMessages(messages);
        if (progressRef.current) {
          progressRef.current.scrollTop = progressRef.current.scrollHeight; // Auto-scroll to bottom
        }
      },
      (err) => setError(err.message)
    );

    return () => unsubscribe();
  }, [status, chatId, clientId]);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  if (loading) return <div className="loading-messages">Loading...</div>;
  if (error) return <div className="error-messages">{error}</div>;

  const isReportCompleted = status === 'completed' || progressMessages.some(msg =>
    (msg.content.message || msg.content.query || '').includes('Report Generation Completed')
  );

  return (
    <div className="report-container">
      <div className="report-section-padding">
        <div className="report-section">
          <h1 className="chat-title">{isReportCompleted ? 'Initial Report' : 'Processing Report'}</h1>
          {isReportCompleted && initialReport && (
            <div className="chat-meta">
              <span>
                Date Made:{' '}
                {initialReport.timestamp && initialReport.timestamp.toDate
                  ? initialReport.timestamp.toDate().toLocaleString()
                  : initialReport.timestamp
                    ? new Date(initialReport.timestamp).toLocaleString()
                    : 'N/A'}
              </span>
            </div>
          )}
        </div>
        <hr className="no-padding-hr" />
        {isReportCompleted && initialReport ? (
          <div className="message-api">
            <div className="api-message">
              <div className="message-output">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{initialReport.output || ''}</ReactMarkdown>
              </div>
            </div>
          </div>
        ) : status === 'processing' ? (
          <div className="progress-container">
            <button onClick={toggleExpand} className="expand-button">
              {isExpanded ? 'Collapse Progress' : 'Expand Progress'}
            </button>
            <div
              className={`progress-list ${isExpanded ? 'expanded' : 'collapsed'}`}
              ref={progressRef}
            >
              {progressMessages.length > 0 ? (
                progressMessages.map((msg, index) => (
                  <p key={index} className="progress-text">
                    {msg.content.message || msg.content.query || 'Processing...'}
                  </p>
                ))
              ) : (
                <p className="progress-text">Initializing report generation<span className="loading-dots"></span></p>
              )}
            </div>
          </div>
        ) : (
          <div>Status: {status || 'Unknown'}</div>
        )}
      </div>
    </div>
  );
};

Report.propTypes = {
  clientId: PropTypes.string.isRequired,
};

export default Report;