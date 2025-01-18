import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Corrected import

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

// Function to handle login
export const loginUser = async (email, password) => {
  try {
    // Fetch user data from Firestore before authentication
    const userDocRef = doc(db, 'users', email); // Get reference to the user's document
    const userDoc = await getDoc(userDocRef); // Fetch the document

    if (!userDoc.exists()) {
      console.log('Email not found in Firestore:', email);
      throw new Error('This email is not registered. Please sign up.');
    }

    const userData = userDoc.data();
    console.log('User data fetched from Firestore:', userData);

    // Authenticate the user with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password); // No .value needed here
    const user = userCredential.user;

    await setDoc(userDocRef, {
      email: user.email,
    })

    console.log('User authenticated:', user);

    // Store the user data in localStorage (optional)
    localStorage.setItem('client_id', userData['client id']);
    localStorage.setItem('company_name', userData['company name']);
    localStorage.setItem('user_id', userData.id);

    // Redirect to dashboard after successful login
    window.location.href = '/main';

    return user;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      throw new Error('User not found. Please check your email or sign up.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else {
      throw new Error('Login failed: ' + error.message);
    }
  }
};
