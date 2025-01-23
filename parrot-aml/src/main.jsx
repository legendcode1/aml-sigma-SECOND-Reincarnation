import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter

// Import polyfills
import { Buffer } from 'buffer'; // Import Buffer explicitly
import process from 'process'; // Import process explicitly

// Add polyfills to the global scope
window.Buffer = Buffer; // Polyfill Buffer
window.process = process; // Polyfill process

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* Wrap the App component with BrowserRouter */}
      <App />
    </BrowserRouter>
  </StrictMode>
);