import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";

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

// Domain-to-client_id mapping
const domainClientMapping = {
  'transinergi.com': {
    clientId: '-transinergi116',
    companyName: 'Trans Sinergi'
  },
  'datum.com': {
    clientId: '-datum116',
    companyName: 'DatumCorp'
  }
};

// Function to handle login
export const loginUser = async (email, password) => {
  const domain = email.split('@')[1]; // Extract the domain part of the email

  // Check if the domain is valid
  if (!domainClientMapping[domain]) {
    throw new Error('This email domain is not allowed.');
  }

  const { clientId, companyName } = domainClientMapping[domain]; // Get clientId and companyName based on the domain

  // Debugging outputs
  console.log('clientId:', clientId);
  console.log('companyName:', companyName);

  try {
    // Authenticate the user with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Debugging output for successful authentication
    console.log('User authenticated:', user);

    // Store the client_id and company_name for the session
    localStorage.setItem('client_id', clientId);
    localStorage.setItem('company_name', companyName); // Store companyName in localStorage

    // Debugging output after storing in localStorage
    console.log('Stored client_id:', localStorage.getItem('client_id'));
    console.log('Stored company_name:', localStorage.getItem('company_name'));

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
