import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom'; // Correct import
import { Buffer } from 'buffer'; // Correct import
import process from 'process'; // Correct import

// Polyfill Buffer and process
window.Buffer = Buffer;
window.process = process;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
