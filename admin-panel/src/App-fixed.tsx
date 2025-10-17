import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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
import TestimonialsPage from "./pages/TestimonialsPage";
import EventsPage from "./pages/EventsPage";
import PartnerTestimonialsPage from "./pages/PartnerTestimonialsPage";
import FooterSettingsPage from "./pages/FooterSettingsPage";
import UsersPage from "./pages/UsersPage";

console.log('🚀 MATC Admin Panel starting...');

/**
 * Main App Routes Component
 * Fixed structure to avoid useAuth infinite loops
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Route - Login */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      
      {/* Protected Routes - All wrapped in Layout */}
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path={ROUTES.PROGRAMS} element={<Layout><ProgramsPage /></Layout>} />
      <Route path={ROUTES.CATEGORIES} element={<Layout><CategoriesPage /></Layout>} />
      <Route path={ROUTES.PACKS} element={<Layout><PacksPage /></Layout>} />
      <Route path={ROUTES.TESTIMONIALS} element={<Layout><TestimonialsPage /></Layout>} />
      <Route path={ROUTES.EVENTS} element={<Layout><EventsPage /></Layout>} />
      <Route path={ROUTES.PARTNER_TESTIMONIALS} element={<Layout><PartnerTestimonialsPage /></Layout>} />
      <Route path={ROUTES.FOOTER_SETTINGS} element={<Layout><FooterSettingsPage /></Layout>} />
      <Route path={ROUTES.USERS} element={<Layout><UsersPage /></Layout>} />
      
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * Main App Component
 * Properly structured with AuthProvider wrapping the routes
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
