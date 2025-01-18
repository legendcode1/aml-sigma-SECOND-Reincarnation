import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to handle login
export const loginUser = async (email, password) => {
  try {
    // Fetch user data from Firestore
    const userDocRef = doc(db, 'users', email);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log('Email not found in Firestore:', email);
      throw new Error('This email is not registered. Please sign up.');
    }

    const userData = userDoc.data();
    console.log('User data fetched from Firestore:', userData);

    // Authenticate user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user data in Firestore
    const authenticatedUserDocRef = doc(db, 'users', user.uid);
    await setDoc(authenticatedUserDocRef, {
      email: user.email,
    });

    console.log('User authenticated:', user);

    // Store user data in localStorage
    localStorage.setItem('client_id', userData['client id']);
    localStorage.setItem('company_name', userData['company name']);
    localStorage.setItem('user_id', userData.id);

    // Redirect to dashboard
    window.location.href = '/main';

    return user;
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.error('Permission denied. Check Firestore rules:', error.message);
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('User not found. Please check your email or sign up.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else {
      throw new Error('Login failed: ' + error.message);
    }
  }
};
