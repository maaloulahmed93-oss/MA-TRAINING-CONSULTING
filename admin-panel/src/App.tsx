import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import { ROUTES } from "./config/routes";

// Layout Components
import Layout from "./components/layout/Layout";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Pages
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProgramsPage from "./pages/ProgramsPage";
import CategoriesPage from "./pages/CategoriesPage";
import PacksPage from "./pages/PacksPage";

console.log('🚀 MATC Admin Panel starting...');

/**
 * Protected Route Component
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
};

/**
 * App Routes Component
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/programs" element={<Layout><ProgramsPage /></Layout>} />
      <Route path="/categories" element={<Layout><CategoriesPage /></Layout>} />
      <Route path="/packs" element={<Layout><PacksPage /></Layout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * Main App Component
 */
const App: React.FC = () => {
  console.log('✅ MATC Admin Panel loaded successfully');
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
};

export default App;
