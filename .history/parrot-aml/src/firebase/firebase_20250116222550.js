// Import necessary Firebase functions
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';  // Add Firebase Authentication

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfku8hikwXrII_Uv2u0pL6-f0a0a0mKr8",
  authDomain: "datumcorp-aml.firebaseapp.com",
  projectId: "datumcorp-aml",
  storageBucket: "datumcorp-aml.appspot.com",
  messagingSenderId: "710428028162",
  appId: "1:710428028162:web:486e3aad77de49d0d8261b",
  measurementId: "G-KSL9Y2V3HX"
};

// Initialize Firebase only if not already initialized
let app;
if (getApps().length === 0) {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
} else {
  // If already initialized, get the existing app
  app = getApp();
}

// Initialize Firebase Analytics (optional, remove if not using)
const analytics = getAnalytics(app);

// Initialize Firebase Auth
const auth = getAuth(app); // Initialize Auth service

// Export Firestore, Auth, and other Firebase services
export const firestore = getFirestore(app);
export { app, analytics, auth };
