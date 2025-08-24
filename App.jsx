import React, { useState, useEffect } from 'react';
import UserManagement from './components/UserManagement';
import './styles/tailwind.css';

const App = ({ shellContext }) => {
  const [config, setConfig] = useState({
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
    isDarkMode: false,
    user: null,
    token: null
  });

  useEffect(() => {
    // Receive context from shell
    if (shellContext) {
      setConfig({
        apiUrl: shellContext.apiUrl || config.apiUrl,
        isDarkMode: shellContext.isDarkMode || false,
        user: shellContext.user,
        token: shellContext.token
      });

      // Apply dark mode
      if (shellContext.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Standalone mode - get from localStorage
      const token = localStorage.getItem('auth_token');
      const user = JSON.parse(localStorage.getItem('user_data') || '{}');
      const isDarkMode = localStorage.getItem('darkMode') === 'true';
      
      setConfig({
        ...config,
        token,
        user,
        isDarkMode
      });

      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  }, [shellContext]);

  // Listen for shell messages (theme changes, etc.)
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'SHELL_CONFIG_UPDATE') {
        setConfig(prev => ({
          ...prev,
          ...event.data.payload
        }));
        
        if (event.data.payload.isDarkMode !== undefined) {
          if (event.data.payload.isDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Check authentication
  if (!config.token || !config.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className={`text-center p-6 rounded-lg ${
          config.isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className={`text-xl font-bold mb-2 ${
            config.isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Authentication Required
          </h2>
          <p className={config.isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Please log in through the main application
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      config.isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <UserManagement 
        config={config}
        isDarkMode={config.isDarkMode}
        user={config.user}
        token={config.token}
        apiUrl={config.apiUrl}
      />
    </div>
  );
};

export default App;
