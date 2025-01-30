import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // Import the global CSS styles
import App from './App';  // Import the main App component

// Create a root element where the React app will be rendered
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component inside the root element
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
