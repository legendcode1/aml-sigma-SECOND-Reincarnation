// src/authService.js
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from './firebase';  // Import Firebase services

// Login function to authenticate user
export const loginUser = async (email, password) => {
  try {
    // Sign in with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch the user data from Firestore using UID
    const userDocRef = doc(firestore, 'users', user.uid);  // Use UID as document ID
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('Fetched user data:', userData);

      // Ensure user data exists and set them in localStorage
      if (userData.userName && userData.companyName) {
        localStorage.setItem('userName', userData.userName);
        localStorage.setItem('companyName', userData.companyName);
      } else {
        console.log("User data is missing some fields.");
      }

      return userData;
    } else {
      console.log('No user data found');
    }
  } catch (error) {
    console.error('Error logging in:', error.message);
    throw new Error('Login failed');
  }
};
