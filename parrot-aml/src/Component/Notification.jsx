// parrot-aml/src/Component/Notification.jsx
import PropTypes from 'prop-types';
import '../StyleSheet/Notification.css';

const Notification = ({ headline, message, targetName, isWebSocketOnline, isLoading = false, isVisible = true, onDismiss = () => { } }) => {
  if (!isVisible) return null;

  // Construct the status message with periodic updates
  const statusMessage = `${isLoading ? 'Loading report... ' : ''}${message} | WebSocket: ${isWebSocketOnline ? 'Online' : 'Offline'}`;

  return (
    <div className="notification-container">
      <h2 className="notification-headline">{headline}</h2>
      <p className="notification-message">{statusMessage}</p>
      <p className="notification-target">Target: {targetName}</p>
      <button className="dismiss-button" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
};

Notification.propTypes = {
  headline: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  targetName: PropTypes.string.isRequired,
  isWebSocketOnline: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool, // Optional prop with default false
  isVisible: PropTypes.bool,
  onDismiss: PropTypes.func,
};

export default Notification;