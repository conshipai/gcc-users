// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Check if running inside shell or standalone
const isStandalone = !window.shellContext;

if (isStandalone) {
  // Standalone mode - render directly
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Export for module federation
export { App as default };
