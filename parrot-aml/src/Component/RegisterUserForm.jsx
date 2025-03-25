// parrot-aml/src/Component/RegisterUserForm.jsx
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import '../StyleSheet/RegisterUserForm.css';

const RegisterUserForm = ({ clientId, onUserRegistered, onGoBack }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        occupation: '',
        phone: '',
        photoURL: '',
        role: 'User',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditPhotoClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
        setFormData((prev) => ({ ...prev, file }));
    };

    const handleRegisterUser = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password || !formData.name || !formData.occupation || !formData.phone) {
            setError('All required fields must be filled.');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const auth = getAuth();
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const user = userCredential.user;

            let photoURL = formData.photoURL || null;
            if (formData.file) {
                const uploadData = new FormData();
                uploadData.append('file', formData.file);
                uploadData.append('upload_preset', 'unsigned_profile');

                const res = await fetch('https://api.cloudinary.com/v1_1/dolqhixzw/image/upload', {
                    method: 'POST',
                    body: uploadData,
                });
                const data = await res.json();
                if (data.secure_url) {
                    photoURL = data.secure_url;
                } else {
                    throw new Error('Image upload failed: No secure URL returned');
                }
            }

            await setDoc(doc(db, 'users', user.uid), {
                'company id': clientId,
                email: formData.email,
                name: formData.name,
                occupation: formData.occupation,
                phone: formData.phone,
                photoURL,
                role: formData.role,
            });

            console.log('User registered successfully:', user.uid);
            setFormData({
                email: '',
                password: '',
                name: '',
                occupation: '',
                phone: '',
                photoURL: '',
                role: 'User',
            });
            setPreviewImage(null);
            onUserRegistered();
        } catch (error) {
            console.error('Error registering user:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-user-container">
            <div className="form-header">
                <h3 className="register-title">Register New User</h3>
                <button className="back-button" onClick={onGoBack}>
                    Back
                </button>
            </div>
            <form className="register-form" onSubmit={handleRegisterUser}>
                <div className="form-group">
                    <label className="form-label">Email:</label>
                    <div className="register-input-container">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="register-input"
                            required
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Password:</label>
                    <div className="register-input-container">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="register-input"
                            required
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Name:</label>
                    <div className="register-input-container">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="register-input"
                            required
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Occupation:</label>
                    <div className="register-input-container">
                        <input
                            type="text"
                            name="occupation"
                            value={formData.occupation}
                            onChange={handleInputChange}
                            className="register-input"
                            required
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Phone:</label>
                    <div className="register-input-container">
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="register-input"
                            required
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Profile Image:</label>
                    <div className="register-input-container profile-image-section">
                        <div className="profile-image-preview">
                            {previewImage ? (
                                <img src={previewImage} alt="Preview" className="profile-preview-img" />
                            ) : (
                                <div className="no-image-placeholder">No Image Selected</div>
                            )}
                        </div>
                        <button
                            type="button"
                            className="edit-photo-button"
                            onClick={handleEditPhotoClick}
                        >
                            Upload Photo
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Role:</label>
                    <div className="register-input-container">
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className="register-input"
                        >
                            <option value="User">User</option>
                            <option value="Moderator">Moderator</option>
                        </select>
                    </div>
                </div>
                <button
                    type="submit"
                    className="register-button"
                    disabled={loading}
                >
                    Register
                </button>
            </form>
            {error && <div className="error-message">{error}</div>}
            {loading && <div className="loading-message">Registering user...</div>}
        </div>
    );
};

RegisterUserForm.propTypes = {
    clientId: PropTypes.string.isRequired,
    onUserRegistered: PropTypes.func.isRequired,
    onGoBack: PropTypes.func.isRequired, // Added for back navigation
};

export default RegisterUserForm;