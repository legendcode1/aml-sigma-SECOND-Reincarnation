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

// Example usage
(async () => {
  const testUID = "F6tMvLc7lCMQhLQVeiPSNHjUzYH2"; // Replace this with the desired UID
  try {
    const userData = await fetchUserDataByUID(testUID);
    console.log('User data for UID:', testUID, userData);
  } catch (error) {
    console.error(error.message);
  }
})();
