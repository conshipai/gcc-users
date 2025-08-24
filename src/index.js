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

// ===================================
// public/index.html
`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Freight Users Management</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`

// ===================================
// src/styles/index.css
`@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-400 dark:bg-gray-600 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500 dark:bg-gray-500;
}`

// ===================================
// src/styles/tailwind.css
`@tailwind base;
@tailwind components;
@tailwind utilities;`

// ===================================
// .babelrc
{
  "presets": [
    "@babel/preset-env",
    "@babel/preset-react"
  ]
}

// ===================================
// .env.example
`REACT_APP_API_URL=http://localhost:3001
SHELL_URL=http://localhost:3000
APP_NAME=users
PORT=3002`

// ===================================
// .gitignore
`node_modules/
dist/
build/
.env
.env.local
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*`
