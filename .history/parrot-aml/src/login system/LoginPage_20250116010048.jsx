import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For page redirection
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Firebase Authentication

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Navigate to the next page on success

  const handleLogin = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the email domain is correct (example domain 'transinergi.com')
      const emailDomain = email.split('@')[1];
      if (emailDomain === 'transinergi.com') {
        // Redirect to the main layout page
        navigate('/main');
      } else {
        setErrorMessage('Invalid email domain');
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Login</button>
        {errorMessage && <p>{errorMessage}</p>}
      </form>
    </div>
  );
};

export default LoginPage;
