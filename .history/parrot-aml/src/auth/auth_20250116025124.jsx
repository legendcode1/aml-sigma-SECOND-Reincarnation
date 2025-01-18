// Import the already initialized Firebase app and authentication services
import { getAuth } from "firebase/auth";
import { app } from '../firebase.js';  // Import the app from your firebase.js file

// Domain-to-client_id mapping
const domainClientMapping = {
  'sinergi.com': 'client-id-sinergi',
  'datum.com': 'client-id-datum'
};

// Function to handle login
export const loginUser = async (email, password) => {
  const domain = email.split('@')[1]; // Extract the domain part of the email

  // Check if the domain is valid
  if (!domainClientMapping[domain]) {
    throw new Error('This email domain is not allowed.');
  }

  const client_id = domainClientMapping[domain]; // Get the client_id based on the domain
  const auth = getAuth(app);  // Get the authentication service using the imported app

  try {
    // Authenticate the user with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store the client_id for the session (use localStorage, React context, etc.)
    localStorage.setItem('client_id', client_id);

    // Return user data (or redirect, or whatever you need)
    return user;
  } catch (error) {
    throw new Error('Login failed: ' + error.message);
  }
};
