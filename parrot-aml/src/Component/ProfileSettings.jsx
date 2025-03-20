// parrot-aml/src/Component/ProfileSettings.jsx
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../StyleSheet/ProfileSettings.css';
import { auth, db } from '../firebase/firebase';
import { updateDoc, doc } from 'firebase/firestore';
import { updatePassword, updateProfile } from 'firebase/auth';

const ProfileSettings = ({ onGoBack }) => {
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState(auth.currentUser?.photoURL || '');
  const [error, setError] = useState(null); // New error state
  const fileInputRef = useRef(null);

  useEffect(() => {
    setProfileImageUrl(auth.currentUser?.photoURL || '');
  }, [auth.currentUser?.photoURL]);

  const handleEditPhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleNameSubmit = async () => {
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, { name });
      await updateProfile(auth.currentUser, { displayName: name });
      console.log("New name submitted:", name);
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      await updatePassword(auth.currentUser, newPassword);
      console.log("Password updated successfully");
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned_profile');
    try {
      console.log("Starting image upload to Cloudinary...");
      const res = await fetch('https://api.cloudinary.com/v1_1/dolqhixzw/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, { photoURL: data.secure_url });
        await updateProfile(auth.currentUser, { photoURL: data.secure_url });
        setProfileImageUrl(data.secure_url);
        setError(null);
        console.log("Profile image updated successfully:", data.secure_url);
      } else {
        throw new Error('Image upload failed: No secure URL returned');
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setError('Failed to upload image. Please try again.');
    }
  };

  return (
    <div data-layer="Profile-Section" className="ProfileSection">
      <div data-layer="Profile" className="Profile">
        <div data-svg-wrapper data-layer="profile-image" className="ProfileImage">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt="Profile" className="ProfileImg" />
          ) : (
            <svg width="149" height="149" viewBox="0 0 149 149" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M74.5 0C84.3793 0 93.854 3.92454 100.84 10.9103C107.825 17.896 111.75 27.3707 111.75 37.25C111.75 47.1293 107.825 56.604 100.84 63.5897C93.854 70.5755 84.3793 74.5 74.5 74.5C64.6207 74.5 55.146 70.5755 48.1603 63.5897C41.1745 56.604 37.25 47.1293 37.25 37.25C37.25 27.3707 41.1745 17.896 48.1603 10.9103C55.146 3.92454 64.6207 0 74.5 0ZM74.5 18.625C69.5603 18.625 64.823 20.5873 61.3301 24.0801C57.8373 27.573 55.875 32.3103 55.875 37.25C55.875 42.1897 57.8373 46.927 61.3301 50.4199C64.823 53.9127 69.5603 55.875 74.5 55.875C79.4397 55.875 84.177 53.9127 87.6699 50.4199C91.1627 46.927 93.125 42.1897 93.125 37.25C93.125 32.3103 91.1627 27.573 87.6699 24.0801C84.177 20.5873 79.4397 18.625 74.5 18.625ZM74.5 83.8125C99.3644 83.8125 149 96.1981 149 121.062V149H0V121.062C0 96.1981 49.6356 83.8125 74.5 83.8125ZM74.5 101.506C46.8419 101.506 17.6938 115.103 17.6938 121.062V131.306H131.306V121.062C131.306 115.103 102.158 101.506 74.5 101.506Z"
                fill="white"
              />
            </svg>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <div data-layer="edit-profile-button" className="EditProfileButton" onClick={handleEditPhotoClick}>
          <div data-layer="edit-button" className="EditButton">
            <div data-layer="Edit Photo Profile" className="EditPhotoProfile">
              Edit Photo Profile
            </div>
          </div>
        </div>
      </div>
      <div data-layer="edit-contaiiner" className="EditContaiiner">
        <div data-layer="edit-name-div" className="EditNameDiv">
          <div data-layer="name-headline" className="NameHeadline">
            name:
          </div>
          <div data-svg-wrapper data-layer="name-edit-column" className="NameEditColumn">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="NameInput"
            />
          </div>
          <div data-layer="name-submit-button" className="NameSubmitButton">
            <div data-layer="Submit" className="Submit" onClick={handleNameSubmit}>
              Submit
            </div>
          </div>
        </div>
        <div data-layer="edit-password-div" className="EditPasswordDiv">
          <div data-layer="Password:" className="Password">
            Password:
          </div>
          <div data-layer="sub-password-div" className="SubPasswordDiv">
            <div data-layer="current-password" className="CurrentPassword">
              <div data-layer="current-password" className="CurrentPasswordText">
                Current Password:
              </div>
              <div data-svg-wrapper data-layer="PasswordEditColumn" className="PasswordEditColumn">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="PasswordInput"
                />
              </div>
            </div>
            <div data-layer="current-password" className="CurrentPassword">
              <div data-layer="new-password" className="NewPassword">
                New Password:
              </div>
              <div data-svg-wrapper data-layer="PasswordEditColumn" className="PasswordEditColumn">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="PasswordInput"
                />
              </div>
            </div>
            <div data-layer="password-submit-button" className="PasswordSubmitButton">
              <div data-layer="Submit" className="Submit" onClick={handlePasswordSubmit}>
                Submit
              </div>
            </div>
          </div>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div data-layer="go-back-button" className="GoBackButton" onClick={onGoBack}>
        &lt; Go Back
      </div>
    </div>
  );
};

ProfileSettings.propTypes = {
  onGoBack: PropTypes.func.isRequired,
};

export default ProfileSettings;