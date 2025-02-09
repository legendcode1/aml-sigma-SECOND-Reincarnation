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

const ChatMessage = ({ prompt, output, userName }) => {
  return (
    <div className="chat-message">
      {prompt && (
        <div className="user-message">
          {userName && (
            <div className="user-heading-message">
              <strong>{userName}</strong>
            </div>
          )}
          <div className="message-content">
            <ReactMarkdown>{prompt}</ReactMarkdown>
          </div>
        </div>
      )}
      {output && (
        <div className="bot-message">
          <div className="bot-heading-message">
            <strong>AegisAML</strong>
          </div>
          <div className="message-content">
            <ReactMarkdown>{output}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

ChatMessage.propTypes = {
  prompt: PropTypes.string,
  output: PropTypes.string,
  userName: PropTypes.string
};

const ChatHistory = ({ clientId, userName }) => {
  const { chatId } = useParams();
  const [chatDoc, setChatDoc] = useState(null); // Document that should include the extra PEP fields
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  console.log('userName:', userName);

  // Resizable and toggle state
  const [width, setWidth] = useState(400); // Default width (px)
  const [isOpen, setIsOpen] = useState(true);
  const isResizing = useRef(false);

  // Fetch chat document and messages on mount
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        if (!chatId) throw new Error('Chat ID is missing.');

        // Get the chat document (which should include pep fields)
        const chatDocRef = doc(db, 'client', clientId, 'chat_history', chatId);
        const chatSnapshot = await getDoc(chatDocRef);
        if (!chatSnapshot.exists()) throw new Error('Chat document not found.');
        setChatDoc(chatSnapshot.data());

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
      // Create a new message object with userName
      const newMsg = {
        prompt: newMessage,
        output: '',
        timestamp: serverTimestamp(),
        userName: userName // Add userName here
      };

      // Append the new message locally using a temporary ID
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

      // Build the payload for the /followup API call.
      // Use the extra PEP fields stored in the chat document.
      const payload = {
        session_id: uuidv4(), // Or use your existing session identifier
        client_id: clientId,
        pep_name: chatDoc?.pep_name || '',
        pep_occupation: chatDoc?.pep_occupation || '',
        pep_age: chatDoc?.pep_age || '',
        pep_gender: chatDoc?.pep_gender || '',
        // Optionally include previous conversation context
        chat_history: messages.map(m => m.prompt).join('\n'),
        user_message: newMessage
      };

      // Send the followup request to your backend
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/followup?client_id=${clientId}`,
        payload
      );
      const outputReport = response.data.report;

      // Update the last message in local state with the backend output
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], output: outputReport };
        return updated;
      });

      // Update the Firestore document for that message with the output field
      await updateDoc(docRef, { output: outputReport });

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
            <div className="resizer" onMouseDown={handleResizeMouseDown}></div>

            <div className="chat-section-padding">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  prompt={msg.prompt}
                  output={msg.output}
                  userName={msg.userName || userName}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

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