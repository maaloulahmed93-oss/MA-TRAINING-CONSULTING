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
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route
        path={ROUTES.LOGIN}
        element={
          isAuthenticated ? (
            <Navigate to={ROUTES.DASHBOARD} replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROGRAMS}
        element={
          <ProtectedRoute>
            <Layout>
              <ProgramsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CATEGORIES}
        element={
          <ProtectedRoute>
            <Layout>
              <CategoriesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PACKS}
        element={
          <ProtectedRoute>
            <Layout>
              <PacksPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Layout>
              <Navigate to={ROUTES.DASHBOARD} replace />
            </Layout>
          </ProtectedRoute>
        }
      />
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
