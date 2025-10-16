import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layout Components
import Layout from "./components/layout/Layout";

// Pages
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProgramsPage from "./pages/ProgramsPage";
import CategoriesPage from "./pages/CategoriesPage";
import PacksPage from "./pages/PacksPage";

/**
 * Ultra Simple App - No AuthContext, No Loops
 */
const App: React.FC = () => {
  console.log('🚀 MATC Admin Panel Final Version Starting...');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Dashboard Route */}
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        
        {/* Other Routes */}
        <Route path="/programs" element={<Layout><ProgramsPage /></Layout>} />
        <Route path="/categories" element={<Layout><CategoriesPage /></Layout>} />
        <Route path="/packs" element={<Layout><PacksPage /></Layout>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
