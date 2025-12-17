import React, { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { DashboardLayout } from './components/DashboardLayout';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return <DashboardLayout onLogout={() => setIsAuthenticated(false)} />;
}