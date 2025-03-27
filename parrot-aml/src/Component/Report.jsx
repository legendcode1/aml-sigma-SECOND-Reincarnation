// parrot-aml/src/Component/Report.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import remarkGfm from "remark-gfm";
import { db } from '../firebase/firebase';
import { doc, onSnapshot, collection, query, orderBy, updateDoc } from 'firebase/firestore';
import { useWebSocketContext } from '../utils/WebSocketContext';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import '../StyleSheet/Report.css';

const isProgressCompleted = (messages) => {
  return messages.some(msg => {
    const content = (msg.content?.message || msg.content?.query || '').toLowerCase().trim();
    return content.includes('report generation completed');
  });
};

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
          setStatus(data.status || 'processing');
          console.log('Chat status updated:', data.status || 'processing');
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

  useEffect(() => {
    if ((!chatId || !clientId) || (status !== 'completed' && !isProgressCompleted(progressMessages))) {
      console.log('Not fetching initial report: conditions not met');
      return;
    }

    console.log('Attempting to fetch initial report');
    const messageRef = doc(db, 'client', clientId, 'chat_history', chatId, 'messages', 'initial-report');
    const unsubscribe = onSnapshot(
      messageRef,
      (msgDoc) => {
        if (msgDoc.exists()) {
          setInitialReport(msgDoc.data());
          console.log('Initial Report Fetched:', msgDoc.data());
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

  useEffect(() => {
    if (status !== 'processing' || !chatId || !clientId) return;

    const messagesRef = collection(db, 'client', clientId, 'chat_history', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs
          .map(docSnapshot => docSnapshot.data())
          .filter(msg => msg.type === 'progress');
        setProgressMessages(messages);

        if (isProgressCompleted(messages)) {
          const chatDocRef = doc(db, 'client', clientId, 'chat_history', chatId);
          updateDoc(chatDocRef, { status: 'completed' })
            .then(() => {
              console.log('Status successfully updated to "completed" in Firestore');
            })
            .catch(err => {
              console.error('Failed to update status to "completed":', err);
              setError('Failed to update report status.');
            });
          stopSession(chatId);
        }

        if (progressRef.current) {
          progressRef.current.scrollTop = progressRef.current.scrollHeight;
        }
      },
      (err) => setError(err.message)
    );

    return () => unsubscribe();
  }, [status, chatId, clientId, stopSession]);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  if (loading) return <div className="loading-messages">Loading...</div>;
  if (error) return <div className="error-messages">{error}</div>;

  const isReportCompleted = status === 'completed' || isProgressCompleted(progressMessages);

  let mode;
  if (status === 'processing' && !isReportCompleted) {
    mode = 'processing';
  } else if (isReportCompleted && !initialReport) {
    mode = 'loading';
  } else if (isReportCompleted && initialReport) {
    mode = 'completed';
  } else {
    mode = 'unknown';
  }

  return (
    <div className="report-container">
      <div className="report-section-padding">
        <div className="report-section">
          <h1 className="chat-title">
            {mode === 'completed' ? 'Initial Report' : mode === 'processing' ? 'Processing Report' : 'Report Status'}
          </h1>
          {mode === 'completed' && (
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
        {mode === 'completed' ? (
          <div className="message-api">
            <div className="api-message">
              <div className="message-output">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{initialReport.output || ''}</ReactMarkdown>
              </div>
            </div>
          </div>
        ) : mode === 'loading' ? (
          <div className="loading-report">Loading report...</div>
        ) : mode === 'processing' ? (
          <div className="progress-container">
            <button onClick={toggleExpand} className="expand-button">
              {isExpanded ? 'Collapse Progress' : 'Expand Progress'}
            </button>
            <div className={`progress-list ${isExpanded ? 'expanded' : 'collapsed'}`} ref={progressRef}>
              {progressMessages.length > 0 ? (
                progressMessages.map((msg, index) => (
                  <p key={index} className="progress-text">
                    {msg.content?.message || msg.content?.query || 'Processing...'}
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