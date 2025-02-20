import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import '../StyleSheet/ChatBot.css';

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

const ChatBotContainer = ({
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  messagesEndRef,
  userName,
}) => {
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, messagesEndRef]);

  return (
    <div className="chat-section-padding">
      {messages
        .filter((msg) => msg.id !== 'initial-report')
        .map((msg) => (
          <div key={msg.id} className="message-bubble">
            {msg.prompt && (
              <UserMessage userName={msg.userName || userName} prompt={msg.prompt} />
            )}
            {msg.output && <BotMessage output={msg.output} />}
          </div>
        ))}
      <div ref={messagesEndRef} />
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
  );
};

ChatBotContainer.propTypes = {
  messages: PropTypes.array.isRequired,
  newMessage: PropTypes.string.isRequired,
  setNewMessage: PropTypes.func.isRequired,
  handleSendMessage: PropTypes.func.isRequired,
  messagesEndRef: PropTypes.object.isRequired,
  userName: PropTypes.string.isRequired,
};

export default ChatBotContainer;
