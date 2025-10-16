import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";

// Simple test components
const LoginPage = () => <div>Login Page</div>;
const Dashboard = () => <div>Dashboard</div>;

const App: React.FC = () => {
  console.log('🚀 Simple App starting...');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
