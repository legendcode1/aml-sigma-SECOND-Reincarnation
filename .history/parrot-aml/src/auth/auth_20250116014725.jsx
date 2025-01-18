// auth.js
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

// Allowed email domains
const allowedDomains = ['sinergi.com', 'datum.com'];

const isValidDomain = (email) => {
  const domain = email.split('@')[1];
  return allowedDomains.includes(domain);
};

export const handleLogin = async (email, password) => {
  if (!isValidDomain(email)) {
    alert('This email domain is not allowed.');
    return;
  }

  const auth = getAuth();
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Login Error:', error.message);
  }
};

export const handleSignUp = async (email, password) => {
  if (!isValidDomain(email)) {
    alert('This email domain is not allowed.');
    return;
  }

  const auth = getAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    console.log('Verification email sent!');
  } catch (error) {
    console.error('Sign-Up Error:', error.message);
  }
};