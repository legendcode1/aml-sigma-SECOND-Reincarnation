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
      console.log('User data:', userData);

      // Store user data in localStorage for easy access later
      localStorage.setItem('userName', userData.userName || 'SIGMA'); // Store userName (default 'SIGMA')
      localStorage.setItem('companyName', userData.companyName || 'Unknown Company'); // Store companyName (default 'Unknown Company')

      // Return user data for use in the component
      return userData;
    } else {
      console.log('No user data found');
    }
  } catch (error) {
    console.error('Error logging in:', error.message);
    throw new Error('Login failed');
  }
};
