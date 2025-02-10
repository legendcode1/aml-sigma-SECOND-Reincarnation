// src/Component/ChatHistory.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../StyleSheet/ChatHistory.css';
import { db } from '../firebase/firebase';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  orderBy,
  query,
  addDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Component to render a user (prompt) message
const UserMessage = ({ userName, prompt }) => (
  <div className="user-message">
    <div className="message-heading">
      {userName && <strong>{userName}</strong>}
    </div>
    <div className="message-content">
      <ReactMarkdown>{prompt}</ReactMarkdown>
    </div>
  </div>
);

UserMessage.propTypes = {
  userName: PropTypes.string,
  prompt: PropTypes.string.isRequired,
};

// Component to render a bot (output) message
const BotMessage = ({ output }) => (
  <div className="bot-message">
    <div className="message-heading">
      <strong>AegisAML</strong>
    </div>
    <div className="message-content">
      <ReactMarkdown>{output}</ReactMarkdown>
    </div>
  </div>
);

BotMessage.propTypes = {
  output: PropTypes.string.isRequired,
};

const ChatHistory = ({ clientId, userName }) => {
  const { chatId } = useParams();
  const [chatDoc, setChatDoc] = useState(null); // Expected to include extra PEP fields
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Resizable and toggle state
  const [width, setWidth] = useState(400); // Default width (px)
  const [isOpen, setIsOpen] = useState(true);
  const isResizing = useRef(false);

  // Fetch chat document and messages on mount
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        if (!chatId) throw new Error('Chat ID is missing.');

        // Get the chat document (which should include extra PEP fields)
        const chatDocRef = doc(db, 'client', clientId, 'chat_history', chatId);
        const chatSnapshot = await getDoc(chatDocRef);
        if (!chatSnapshot.exists()) throw new Error('Chat document not found.');
        const chatData = chatSnapshot.data();
        console.log("Fetched chat document:", chatData);
        setChatDoc(chatData);

        // Get the messages subcollection
        const messagesCollectionRef = collection(
          db,
          'client',
          clientId,
          'chat_history',
          chatId,
          'messages'
        );
        const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'));
        const querySnapshot = await getDocs(q);
        const fetchedMessages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("Fetched messages:", fetchedMessages);
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

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle resizing (width only)
  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    isResizing.current = true;
    const startX = e.clientX;
    const startWidth = width;

    const handleResizeMouseMove = (moveEvent) => {
      if (isResizing.current) {
        const newWidth = Math.max(200, Math.min(600, startWidth - (moveEvent.clientX - startX)));
        setWidth(newWidth);
      }
    };

    const handleResizeMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', handleResizeMouseMove);
      document.removeEventListener('mouseup', handleResizeMouseUp);
    };

    document.addEventListener('mousemove', handleResizeMouseMove);
    document.addEventListener('mouseup', handleResizeMouseUp);
  };

  // Toggle panel visibility
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  // Handle sending a new follow-up message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Create a new message object for an optimistic update (include userName)
      const newMsg = {
        prompt: newMessage,
        output: '', // initially empty; to be updated after backend response
        timestamp: serverTimestamp(),
        userName: userName,
      };

      // Append the new message locally (using a temporary id)
      const tempId = uuidv4();
      setMessages(prev => [...prev, { id: tempId, ...newMsg }]);

      // Write the new message to Firestore
      const messagesCollectionRef = collection(
        db,
        'client',
        clientId,
        'chat_history',
        chatId,
        'messages'
      );
      const docRef = await addDoc(messagesCollectionRef, newMsg);
      console.log("New message added to Firestore with id:", docRef.id);

      // Build the payload for the /followup API call.
      const payload = {
        session_id: uuidv4(), // Or reuse an existing session identifier if available
        client_id: clientId,
        pep_name: chatDoc?.pep_name || '',
        pep_occupation: chatDoc?.pep_occupation || '',
        pep_age: chatDoc?.pep_age || '',
        pep_gender: chatDoc?.pep_gender || '',
        // Optionally include previous conversation context (prompts only)
        chat_history: messages.map(m => m.prompt).join('\n'),
        user_message: newMessage
      };
      console.log("Payload for followup:", payload);

      // Send the followup request to your backend
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/followup?client_id=${clientId}`,
        payload
      );
      console.log("Followup API response:", response.data);

      // Try to extract the output report
      let outputReport = response.data.report;
      if (!outputReport && typeof response.data === 'string') {
        outputReport = response.data;
      }
      console.log("Extracted output report:", outputReport);

      // Update the last message in local state with the backend output
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], output: outputReport };
        return updated;
      });

      // Update the Firestore document for that message with the output field
      if (outputReport !== undefined && outputReport !== null) {
        await updateDoc(docRef, { output: outputReport });
        console.log("Firestore document updated with output.");
      } else {
        console.error("Output report is undefined; not updating Firestore.");
      }
      setNewMessage('');
    } catch (err) {
      console.error('Error sending follow-up message:', err);
      // Optionally provide error feedback to the user here
    }
  };

  if (loading) return <div className="loading-messages">Loading messages...</div>;
  if (error) return <div className="error-messages">{error}</div>;

  return (
    <>
      {/* Toggle Button (square) that stays outside the chat panel */}
      <button
        className="toggle-button"
        onClick={togglePanel}
        style={{
          width: '50px',
          height: '50px',
          right: isOpen ? `${width}px` : '0px'
        }}
      >
        {isOpen ? '⫸' : '⫷'}
      </button>

      {/* Chat History Panel */}
      <div
        className="chat-history-container"
        style={{
          width: isOpen ? `${width}px` : '0px',
          right: isOpen ? '0' : '-5px',
          overflow: isOpen ? 'visible' : 'hidden'
        }}
      >
        {isOpen && (
          <>
            {/* Resize Handle */}
            <div className="resizer" onMouseDown={handleResizeMouseDown}></div>

            {/* Chat Content – display messages using the ChatMessage components */}
            <div className="chat-section-padding">
              {messages
                .filter((msg) => msg.id !== "initial-report")
                .map((msg) => (
                  <div key={msg.id} className="message-bubble">
                    {msg.prompt && (
                      <UserMessage userName={msg.userName || userName} prompt={msg.prompt} />
                    )}
                    {msg.output && <BotMessage output={msg.output} />}
                  </div>
                ))
              }
              <div ref={messagesEndRef} />

              {/* New Message Input Form */}
              <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your follow-up message..."
                  className="chat-input"
                />
                <button type="submit" className="send-button">Send</button>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
};

ChatHistory.propTypes = {
  clientId: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
};

export default ChatHistory;
