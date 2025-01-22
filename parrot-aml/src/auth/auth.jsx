import { Buffer } from 'buffer';
import { EventEmitter } from 'events';
import process from 'process';
import util from 'util';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore'; // Import Firestore functions
import { loadChatMessagesFirestore } from '../indexedDB'; // Import the function from indexedDB.js
import axios from 'axios';
import { GoogleAuth } from 'google-auth-library'; // Import GoogleAuth from google-auth-library

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfku8hikwXrII_Uv2u0pL6-f0a0a0mKr8",
  authDomain: "datumcorp-aml.firebaseapp.com",
  projectId: "datumcorp-aml",
  storageBucket: "datumcorp-aml.appspot.com",
  messagingSenderId: "710428028162",
  appId: "1:710428028162:web:486e3aad77de49d0d8261b",
  measurementId: "G-KSL9Y2V3HX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

// Path to your service account key file
const SERVICE_ACCOUNT_FILE = 'parrot-aml/src/auth/datumcorp-main-7ab0fea0925b.json';

// Target URL for authentication (your Cloud Run backend)
const TARGET_URL = 'https://aegisllm-backend-633765957616.asia-southeast1.run.app';

async function getAuthHeaders() {
  try {
    // Create a GoogleAuth instance
    const auth = new GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'], // Ensure proper scopes are set
    });

    // Obtain a client to generate an ID token
    const client = await auth.getIdTokenClient(TARGET_URL);

    // Get the ID token
    const tokenResponse = await client.getRequestHeaders();
    
    return {
      ...tokenResponse,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  } catch (error) {
    console.error('Error generating auth headers:', error);
    throw error;
  }
}

async function makeAuthenticatedRequest(payload) {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${TARGET_URL}/report`, payload, { headers });
    return response.data;
  } catch (error) {
    console.error('Error making authenticated request:', error);
    throw error;
  }
}

// Function to fetch user data by UID
export const fetchUserDataByUID = async (uid) => {
  try {
    const userDocRef = doc(db, 'users', uid); // Reference to 'users' document
    const userDoc = await getDoc(userDocRef); // Fetch user document

    if (!userDoc.exists()) {
      throw new Error(`No user found with UID: ${uid}`);
    }
    
    const userData = userDoc.data(); // Extract data from the user document

    // Fetch 'name' field from user document
    const userName = userData.name || 'Unknown User'; // Default to 'Unknown User' if name doesn't exist

    localStorage.setItem('user_id', userData.uid); // Store user ID in localStorage
    localStorage.setItem('user_name', userName); // Store user name in localStorage

    console.log('Fetched user data:', userData);
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error.message);
    throw error;
  }
};

// Function to fetch company data by company ID
export const fetchCompanyDataByID = async (companyId) => {
  try {
    const companyDocRef = doc(db, 'client', companyId); // Reference to 'client' document
    console.log(`Attempting to fetch client data for company ID: ${companyId}`);
    const companyDoc = await getDoc(companyDocRef); // Fetch company document

    if (!companyDoc.exists()) {
      throw new Error(`No company found with ID: ${companyId}`);
    }

    // Assuming 'company_name' is the field name in Firestore
    const companyName = companyDoc.data().company_name || 'Unknown'; // If 'company_name' is missing, default to 'Unknown'
    localStorage.setItem('company_name', companyName); // Store company name if available

    const companyData = companyDoc.data(); // Extract data from the company document
    console.log('Fetched company data:', companyData);
    return companyData;
  } catch (error) {
    console.error('Error fetching company data:', error.message);
    throw error;
  }
};

// Function to fetch chat history for a company
export const fetchChatHistoryByCompanyID = async (companyId) => {
  try {
    const chatHistoryCollectionRef = collection(db, 'client', companyId, 'chat_history'); // Reference to 'chat_history' subcollection
    const chatHistorySnapshot = await getDocs(chatHistoryCollectionRef);

    if (chatHistorySnapshot.empty) {
      throw new Error(`No chat history found for company ID: ${companyId}`);
    }

    const chatHistory = chatHistorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Extract chat history data
    console.log('Fetched chat history:', chatHistory);

    // Load chat history into IndexedDB
    await loadChatMessagesFirestore(chatHistory);

    return chatHistory;
  } catch (error) {
    console.error('Error fetching chat history:', error.message);
    throw error;
  }
};

// Function to handle login and fetch related data
export const loginUser = async (email, password) => {
  try {
    // Authenticate the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user) {
      throw new Error('Authentication failed.');
    }
    console.log('User successfully authenticated:', user.uid);

    // Fetch user data from Firestore using UID
    const userData = await fetchUserDataByUID(user.uid);

    // Log the fetched user data to confirm the structure
    console.log('Fetched user data:', userData);

    // Check if 'company' field exists in the user data
    const companyId = userData['company id']; // Ensure this field exists in Firestore, not 'company id'
    if (!companyId) {
      throw new Error('Company ID not found in user data.');
    }

    console.log('Company ID found:', companyId);

    // Fetch company data using the 'company id'
    const companyData = await fetchCompanyDataByID(companyId);
    const chatHistory = await fetchChatHistoryByCompanyID(companyId);

    // Return user and company data for further use
    return { user, userData, companyData, chatHistory };
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
};

// Export auth and db for use in other modules
export { auth, db, makeAuthenticatedRequest };