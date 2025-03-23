import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  orderBy,
  query,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import ChatBot from './ChatBot';
import { db } from '../firebase/firebase';
import '../StyleSheet/Panel.css';

const ChatPanel = ({ clientId, userName }) => {
  const { chatId } = useParams();
  const [chatDoc, setChatDoc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const messagesEndRef = useRef(null);

  // Panel state for toggling/resizing
  const [width, setWidth] = useState(400);
  const [isOpen, setIsOpen] = useState(true);
  const isResizing = useRef(false);

  // Fetch chat document and messages on mount
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        if (!chatId) throw new Error('Chat ID is missing.');
        const chatDocRef = doc(db, 'client', clientId, 'chat_history', chatId);
        const chatSnapshot = await getDoc(chatDocRef);
        if (!chatSnapshot.exists()) throw new Error('Chat document not found.');
        setChatDoc(chatSnapshot.data());

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
        const fetchedMessages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(fetchedMessages);
        setLoading(false);
      } catch (err) {
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

  // Handle resizing the panel
  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    isResizing.current = true;
    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (moveEvent) => {
      if (isResizing.current) {
        const newWidth = Math.max(200, Math.min(600, startWidth - (moveEvent.clientX - startX)));
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const newMsg = {
        prompt: newMessage,
        output: '',
        timestamp: serverTimestamp(),
        userName: userName,
      };

      // Optimistically update local state
      const tempId = uuidv4();
      setMessages((prev) => [...prev, { id: tempId, ...newMsg }]);

      // Save new message to Firestore
      const messagesCollectionRef = collection(
        db,
        'client',
        clientId,
        'chat_history',
        chatId,
        'messages'
      );
      const docRef = await addDoc(messagesCollectionRef, newMsg);

      // Build payload for the backend call
      const payload = {
        session_id: chatId, // Use chatId for consistency with initial report
        client_id: clientId,
        pep_name: chatDoc?.pep_name || '',
        pep_occupation: chatDoc?.pep_occupation || '',
        pep_age: chatDoc?.pep_age || '',
        pep_gender: chatDoc?.pep_gender || '',
        chat_history: messages.map((m) => m.prompt).join('\n'),
        user_message: newMessage,
        UID: chatDoc?.uid || '', // Add UID from chatDoc
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/followup?client_id=${clientId}`,
        payload
      );

      let outputReport = response.data.report;
      if (!outputReport && typeof response.data === 'string') {
        outputReport = response.data;
      }

      // Update local state with the output
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], output: outputReport };
        return updated;
      });

      if (outputReport !== undefined && outputReport !== null) {
        await updateDoc(docRef, { output: outputReport });
      }
      setNewMessage('');
    } catch (err) {
      console.error('Error sending follow-up message:', err);
    }
  };

  if (loading) return <div className="loading-messages">Loading messages...</div>;
  if (error) return <div className="error-messages">{error}</div>;

  return (
    <>
      {/* Toggle Button */}
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

      {/* Chat Panel Container */}
      <div
        className="panel-container"
        style={{
          width: isOpen ? `${width}px` : '0px',
          right: isOpen ? '0' : '-5px',
          overflow: isOpen ? 'visible' : 'hidden'
        }}
      >
        {isOpen && (
          <>
            <div className="resizer" onMouseDown={handleResizeMouseDown}></div>
            <ChatBot
              messages={messages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleSendMessage={handleSendMessage}
              messagesEndRef={messagesEndRef}
              userName={userName}
            />
          </>
        )}
      </div>
    </>
  );
};

ChatPanel.propTypes = {
  clientId: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
};

export default ChatPanel;