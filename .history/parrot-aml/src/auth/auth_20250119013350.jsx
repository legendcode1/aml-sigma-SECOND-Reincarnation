import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'; // Import Firestore functions

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfku8hikwXrII_Uv2u0pL6-f0a0a0mKr8",
  authDomain: "datumcorp-aml.firebaseapp.com",
  projectId: "datumcorp-aml",
  storageBucket: "datumcorp-aml.appspot.com",
  messagingSenderId: "710428028162",
  appId: "1:710428028162:web:486e3aad77de49d0d8261b",
  measurementId: "G-KSL9Y2V3HX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

// Function to fetch user data by UID
export const fetchUserDataByUID = async (uid) => {
  try {
    const userDocRef = doc(db, 'users', uid); // Reference to the document with the given UID
    const userDoc = await getDoc(userDocRef); // Fetch the document

    if (!userDoc.exists()) {
      throw new Error(`No user found with UID: ${uid}`);
    }

    const userData = userDoc.data(); // Extract data from the document
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
    const companyDocRef = doc(db, 'company', companyId); // Reference to the document in 'company' collection
    const companyDoc = await getDoc(companyDocRef); // Fetch the document

    if (!companyDoc.exists()) {
      throw new Error(`No company found with ID: ${companyId}`);
    }

    const companyData = companyDoc.data(); // Extract data from the document
    console.log('Fetched company data:', companyData);
    return companyData;
  } catch (error) {
    console.error('Error fetching company data:', error.message);
    throw error;
  }
};

// Function to handle login
export const loginUser = async (email, password) => {
  try {
    // Authenticate the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch user data from Firestore using UID
    const userData = await fetchUserDataByUID(user.uid);

    // Use the company ID from the user data to fetch company data
    const companyId = userData['company id ']; // Replace with correct field name if necessary
    const companyData = await fetchCompanyDataByID(companyId);

    // Store user and company data in localStorage
    localStorage.setItem('client_id', companyId);
    localStorage.setItem('company_name', companyData['name'] || 'Unknown'); // Adjust field as needed
    localStorage.setItem('user_id', user.uid);

    return user;
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
};

// Export auth and db if needed elsewhere
export { auth, db };
