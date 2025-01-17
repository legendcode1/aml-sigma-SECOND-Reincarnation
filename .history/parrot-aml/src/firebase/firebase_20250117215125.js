// src/firebase/firebase.js
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth'; // Add authentication
import { 
  getFirestore,
  collection,
  getDocs
} from 'firebase/firestore'; // Add Firestore

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
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const analytics = getAnalytics(app);
const auth = getAuth(app); // Initialize Auth service
const firestore = getFirestore(app); // Initialize Firestore

const db = getFirestore(); 
const colref = collection(db, 'users');
getDocs(colref).then((snapshot) => { 
  console.log(snapshot.docs); 
});


export { app, auth, analytics, firestore };
