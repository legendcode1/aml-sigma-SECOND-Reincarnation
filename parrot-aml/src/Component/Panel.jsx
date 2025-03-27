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
import ChatBot from './ChatBot'; // Corrected import path
import { db } from '../firebase/firebase';
import '../StyleSheet/Panel.css';

const ChatPanel = ({ clientId, userName }) => {
  const { chatId } = useParams();
  const [chatDoc, setChatDoc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const messagesEndRef = useRef(null);

  // Panel state for toggling/resizing
  const [width, setWidth] = useState(400);
  const [isOpen, setIsOpen] = useState(true);
  const isResizing = useRef(false);

  // Fetch chat data
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
      } catch (err) {
        console.error('Error fetching chat data:', err);
        setError(err.message || 'Failed to load chat history.');
      } finally {
        setLoading(false);
      }
    };

    if (clientId && chatId) fetchChatData();
    else {
      setError('Client ID or Chat ID is missing.');
      setLoading(false);
    }
  }, [chatId, clientId]);

  // Handle panel resizing
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

  const togglePanel = () => setIsOpen(!isOpen);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsProcessing(true);
    try {
      console.log('Sending follow-up message:', newMessage);
      const newMsg = {
        prompt: newMessage,
        output: '',
        timestamp: serverTimestamp(),
        userName: userName,
      };

      // Optimistically update UI
      const tempId = uuidv4();
      setMessages((prev) => [...prev, { id: tempId, ...newMsg }]);

      // Save to Firestore
      const messagesCollectionRef = collection(
        db,
        'client',
        clientId,
        'chat_history',
        chatId,
        'messages'
      );
      const docRef = await addDoc(messagesCollectionRef, newMsg);
      console.log('Message saved to Firestore with ID:', docRef.id);

      // Prepare API payload
      const payload = {
        session_id: chatId,
        pep_name: chatDoc?.pep_name || '',
        pep_occupation: chatDoc?.pep_occupation || '',
        pep_age: chatDoc?.pep_age || '',
        pep_gender: chatDoc?.pep_gender || '',
        user_message: newMessage,
        chat_history: messages.map((m) => m.prompt).join('\n'),
      };
      console.log('Sending payload to /followup:', payload);

      // Make API call
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/followup?client_id=${clientId}`,
        payload
      );
      console.log('Received response from /followup:', response.data);

      let outputReport = response.data.report || response.data;
      if (typeof outputReport === 'string') {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], output: outputReport };
          return updated;
        });

        await updateDoc(docRef, { output: outputReport });
        console.log('Updated Firestore with bot response');
      }
      setNewMessage('');
    } catch (err) {
      console.error('Error in handleSendMessage:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        className="toggle-button"
        onClick={togglePanel}
        style={{
          width: '50px',
          height: '50px',
          right: isOpen ? `${width}px` : '0px',
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
          overflow: isOpen ? 'visible' : 'hidden',
        }}
      >
        {isOpen && (
          <>
            <div className="resizer" onMouseDown={handleResizeMouseDown}></div>
            {loading ? (
              <div className="loading-messages">Loading messages...</div>
            ) : (
              <>
                {error && <div className="error-messages">{error}</div>}
                <ChatBot
                  messages={messages}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleSendMessage={handleSendMessage}
                  messagesEndRef={messagesEndRef}
                  userName={userName}
                  isProcessing={isProcessing}
                />
              </>
            )}
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