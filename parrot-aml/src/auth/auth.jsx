import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Import Firestore functions

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

    // Return user and company data for further use
    return { user, userData, companyData };
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
};

// store minimal data in localStorage

// Export auth and db for use in other modules
export { auth, db };
