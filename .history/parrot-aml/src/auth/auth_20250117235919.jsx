import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Firestore imports

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

// Function to check if the email is registered in Firestore and fetch its data
const getUserData = async (email) => {
  try {
    const userDocRef = doc(db, 'users', email); // Reference to the user's document by email
    const userDoc = await getDoc(userDocRef); // Fetch the document

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('User data fetched from Firestore:', userData);
      return {
        ...userData,
        id: userDoc.id // Include the document ID (email) as part of the returned data
      };
    } else {
      console.log('Email not found in Firestore:', email);
      return null; // Return null if no document exists
    }
  } catch (error) {
    console.error('Error fetching user data from Firestore:', error);
    throw new Error('Unable to fetch user data.');
  }
};

// Function to handle login
export const loginUser = async (email, password) => {
  // Fetch the user's data from Firestore
  const userData = await getUserData(email);
  if (!userData) {
    throw new Error('This email is not registered. Please sign up.');
  }

  try {
    // Authenticate the user with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Debugging output for successful authentication
    console.log('User authenticated:', user);

    // Store the user data for the session
    localStorage.setItem('client_id', userData.clientId); // From Firestore
    localStorage.setItem('company_name', userData.companyName); // From Firestore
    localStorage.setItem('user_id', userData.id); // The document ID (email)
    console.log('Stored client_id:', localStorage.getItem('client_id'));
    console.log('Stored company_name:', localStorage.getItem('company_name'));
    console.log('Stored user_id:', localStorage.getItem('user_id'));

    // Redirect to dashboard after successful login
    window.location.href = '/dashboard'; // Example: Redirect to dashboard

    // Return user data
    return user;
  } catch (error) {
    // Improved error handling
    if (error.code === 'auth/user-not-found') {
      throw new Error('User not found. Please check your email or sign up.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else {
      throw new Error('Login failed: ' + error.message);
    }
  }
};
