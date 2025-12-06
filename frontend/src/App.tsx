import React, { useState, useEffect } from 'react';
import Auth from './Auth';
import TaskManager from './TaskManager';

function App() {
  const [user, setUser] = useState<any>(null);

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return <TaskManager user={user} onLogout={handleLogout} />;
}

export default App;