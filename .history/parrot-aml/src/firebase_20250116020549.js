// Import the necessary functions from Firebase SDK
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

// Your Firebase web app's configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfku8hikwXrII_Uv2u0pL6-f0a0a0mKr8",
  authDomain: "datumcorp-aml.firebaseapp.com",
  projectId: "datumcorp-aml",
  storageBucket: "datumcorp-aml.appspot.com",  // Fix the storageBucket URL (should end with .appspot.com)
  messagingSenderId: "710428028162",
  appId: "1:710428028162:web:486e3aad77de49d0d8261b",
  measurementId: "G-KSL9Y2V3HX"
};

// Initialize Firebase only if it isn't initialized already
let app;
if (getApps().length === 0) {
  // Initialize Firebase only if no apps have been initialized
  app = initializeApp(firebaseConfig);
} else {
  // If an app is already initialized, use the existing app
  app = getApp();
}

// Optional: Initialize Firebase Analytics (remove if not using analytics)
const analytics = getAnalytics(app);

// Export Firestore and other necessary Firebase services
export const firestore = getFirestore(app);
export { app, analytics };
