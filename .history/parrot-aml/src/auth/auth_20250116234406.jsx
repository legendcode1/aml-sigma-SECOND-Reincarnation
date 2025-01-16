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
    clientId: 'client-id-transinergi116',
    companyName: 'Trans Sinergi'
  },
  'datum.com': {
    clientId: 'client-id-datum116',
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

  try {
    // Authenticate the user with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store the client_id and company_name for the session
    localStorage.setItem('client_id', clientId);
    localStorage.setItem('company_name', companyName); // Store companyName in localStorage

    // Return user data (or redirect, or whatever you need)
    return user;
  } catch (error) {
    throw new Error('Login failed: ' + error.message);
  }
};
