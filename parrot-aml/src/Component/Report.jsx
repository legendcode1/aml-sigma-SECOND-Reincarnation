// parrot-aml/src/Component/Report.jsx
import React, { useState, useEffect } from 'react';
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
  const { stopSession } = useWebSocketContext();

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
            stopSession(chatId); // Close WebSocket when done
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

  // Fetch initial report when status is 'completed'
  useEffect(() => {
    if (status !== 'completed' || !chatId || !clientId) return;

    const messageRef = doc(db, 'client', clientId, 'chat_history', chatId, 'messages', 'initial-report');
    const unsubscribe = onSnapshot(
      messageRef,
      (msgDoc) => {
        if (msgDoc.exists()) {
          setInitialReport(msgDoc.data());
        }
      },
      (err) => setError(err.message)
    );

    return () => unsubscribe();
  }, [status, chatId, clientId]);

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
      },
      (err) => setError(err.message)
    );

    return () => unsubscribe();
  }, [status, chatId, clientId]);

  if (loading) return <div className="loading-messages">Loading...</div>;
  if (error) return <div className="error-messages">{error}</div>;

  return (
    <div className="report-container">
      <div className="report-section-padding">
        <div className="report-section">
          <h1 className="chat-title">{status === 'processing' ? 'Processing Report' : 'Initial Report'}</h1>
          {status === 'completed' && initialReport && (
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
        {status === 'processing' ? (
          <div className="progress-messages">
            <p>Generating report... Please wait.</p>
            {progressMessages.map((msg, index) => (
              <p key={index}>
                {msg.content.message || msg.content.query || JSON.stringify(msg.content)}
              </p>
            ))}
          </div>
        ) : status === 'completed' && initialReport ? (
          <div className="message-api">
            <div className="api-message">
              <div className="message-output">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{initialReport.output || ''}</ReactMarkdown>
              </div>
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