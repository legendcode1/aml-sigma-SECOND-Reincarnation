// Assuming this is in a parent component like App.jsx or similar
import React from 'react';
import LoginSection from './LoginSection';
import { domainClientMapping } from '../auth/auth.jsx';

const ParentComponent = () => {
  const domain = window.location.hostname; // Or any other method to get the domain
  const companyName = domainClientMapping[domain]?.['company-name'] || 'Default Company'; // Fallback to 'Default Company' if no match
  
  return (
    <div>
      <LoginSection 
        loginText="Login"
        companyName={companyName} 
        onClick={() => console.log("Login clicked")}
      />
    </div>
  );
};

export default ParentComponent;
