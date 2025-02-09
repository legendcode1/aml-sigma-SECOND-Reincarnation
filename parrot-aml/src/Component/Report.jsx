// src/Component/Report.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../StyleSheet/Report.css';
import { db } from '../firebase/firebase';
import { doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';

const Report = ({ clientId }) => {
  const { chatId } = useParams();
  const [chatDoc, setChatDoc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        if (!chatId) {
          throw new Error('Chat ID is missing.');
        }
        // Fetch the chat document
        const chatDocRef = doc(db, 'client', clientId, 'chat_history', chatId);
        const chatSnapshot = await getDoc(chatDocRef);
        if (!chatSnapshot.exists()) {
          throw new Error('Chat document not found.');
        }
        setChatDoc(chatSnapshot.data());

        // Fetch messages from the messages subcollection
        const messagesCollectionRef = collection(db, 'client', clientId, 'chat_history');
        const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'));
        const querySnapshot = await getDocs(q);
        const fetchedMessages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(fetchedMessages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching chat data:', err);
        setError(err.message || 'Failed to load chat history.');
        setLoading(false);
      }
    };

    if (clientId && chatId) {
      fetchChatData();
    } else {
      setError('Client ID or Chat ID is missing.');
      setLoading(false);
    }
  }, [chatId, clientId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (loading) {
    return <div className="loading-messages">Loading chat messages...</div>;
  }

  if (error) {
    return <div className="error-messages">{error}</div>;
  }

  return (
    <div className="report-container">
      <div className="report-section-padding">
        <div className="report-section">
          <h1 className="chat-title">{chatDoc ? chatDoc.headline : 'Chat History'}</h1>
          {chatDoc && (
            <div className="chat-meta">
              <span>
                Date Made:{' '}
                {chatDoc.date_made
                  ? new Date(chatDoc.date_made.seconds * 1000).toLocaleString()
                  : 'N/A'}
              </span>
              <span> Created by: {chatDoc.sender || 'Unknown'}</span>
            </div>
          )}
        </div>
        {messages.map((msg) => (
          <div key={msg.id} className="message-api">
            {msg.output && (
              <div className='api-message'>
                <div className="message-output">
                  <strong>Initial report</strong> <ReactMarkdown>{msg.output || ''}</ReactMarkdown>
                </div>
              </div>
              
            )}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Scroll to bottom */}
      </div>
    </div>
  );
};

Report.propTypes = {
  clientId: PropTypes.string.isRequired,
};

export default Report;
