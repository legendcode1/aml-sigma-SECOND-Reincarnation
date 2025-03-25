// parrot-aml/src/auth/auth.jsx
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { loadChatMessagesFirestore } from '../indexedDB';
import axios from 'axios';

// Firebase configuration using Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Fetch the user document from Firestore.
 * Returns the raw user data so that the caller can pick out the company ID.
 */
export const fetchUserDataByUID = async (uid) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      throw new Error(`No user found with UID: ${uid}`);
    }
    const data = userDoc.data();
    console.log('Fetched user data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error.message);
    throw error;
  }
};

/**
 * Fetch the company data from Firestore.
 */
export const fetchCompanyDataByID = async (companyId) => {
  try {
    const companyDocRef = doc(db, 'client', companyId);
    console.log(`Attempting to fetch client data for company ID: ${companyId}`);
    const companyDoc = await getDoc(companyDocRef);
    if (!companyDoc.exists()) {
      throw new Error(`No company found with ID: ${companyId}`);
    }
    const companyData = companyDoc.data();
    console.log('Fetched company data:', companyData);
    return companyData;
  } catch (error) {
    console.error('Error fetching company data:', error.message);
    throw error;
  }
};

/**
 * Fetch chat history for a given company from Firestore.
 */
export const fetchChatHistoryByCompanyID = async (companyId) => {
  try {
    const chatHistoryCollectionRef = collection(db, 'client', companyId, 'chat_history');
    const chatHistorySnapshot = await getDocs(chatHistoryCollectionRef);
    if (chatHistorySnapshot.empty) {
      throw new Error(`No chat history found for company ID: ${companyId}`);
    }
    const chatHistory = chatHistorySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log('Fetched chat history:', chatHistory);
    await loadChatMessagesFirestore(chatHistory);
    return chatHistory;
  } catch (error) {
    console.error('Error fetching chat history:', error.message);
    throw error;
  }
};

/**
 * Handle login and fetch all related data.
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    if (!user) {
      throw new Error('Authentication failed.');
    }
    console.log('User successfully authenticated:', user.uid);
    const userData = await fetchUserDataByUID(user.uid);
    console.log('Fetched user data:', userData);
    const companyId = userData['company id'];
    if (!companyId) {
      throw new Error('Company ID not found in user data.');
    }
    console.log('Company ID found:', companyId);
    const companyData = await fetchCompanyDataByID(companyId);
    const chatHistory = await fetchChatHistoryByCompanyID(companyId);
    return { user, userData, companyData, chatHistory };
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
};

/**
 * Register a new user (for Moderator use).
 */
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, 'users', user.uid), userData);
    console.log('User registered successfully:', user.uid);
    return user;
  } catch (error) {
    console.error('Error registering user:', error.message);
    throw error;
  }
};

export { auth, db };