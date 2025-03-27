// parrot-aml/src/Component/LoginSection.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../StyleSheet/LoginSection.css';

const LoginSection = ({ userName, companyName, userPhotoURL, onLogout, clientId, uid, userId }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [companyLogo, setCompanyLogo] = useState('/default-logo.png');
  const location = useLocation();
  const currentUrl = window.location.origin + location.pathname;

  const togglePopup = () => setShowPopup(!showPopup);

  const handleShareClick = () => {
    setShowShareModal(true);
    setShowPopup(false); // Close the profile popup when opening share modal
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
  };

  useEffect(() => {
    const fetchUserAndCompanyData = async () => {
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserEmail(userSnap.data().email || 'N/A');
        }

        const companyRef = doc(db, 'client', clientId);
        const companySnap = await getDoc(companyRef);
        if (companySnap.exists() && companySnap.data().company_logo) {
          setCompanyLogo(companySnap.data().company_logo);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    if (userId && clientId) fetchUserAndCompanyData();
  }, [userId, clientId]);

  return (
    <div className="login-section">
      <div className="login-header">
        <button className="share-button" onClick={handleShareClick}>
          Share
        </button>
        <img
          src={userPhotoURL}
          alt="User Profile"
          className="profile-picture"
          onClick={togglePopup}
          onError={(e) => (e.target.src = '/default-profile.png')}
        />
      </div>
      {showPopup && (
        <div className="profile-popup">
          <span className="login-text">{userName} from {companyName}</span>
          <p><strong>Email:</strong> {userEmail}</p>
          <p><strong>Company Name:</strong> {companyName}</p>
          <img
            src={companyLogo}
            alt="Company Logo"
            className="company-logo"
            onError={(e) => (e.target.src = '/default-logo.png')}
          />
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
      {showShareModal && (
        <div className="share-modal">
          <div className="share-modal-content">
            <span className="close-button" onClick={handleCloseShareModal}>×</span>
            <p>Share this URL:</p>
            <input type="text" value={currentUrl} readOnly />
            <button onClick={() => navigator.clipboard.writeText(currentUrl)}>Copy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginSection;