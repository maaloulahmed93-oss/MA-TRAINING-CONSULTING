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

// Pages
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import CategoriesPage from "./pages/CategoriesPage";
import ParticipantsManagementPage from './pages/ParticipantsManagementPage';
import EventsPage from "./pages/EventsPage";
import PartnerTestimonialsPage from "./pages/PartnerTestimonialsPage";
import UsersPage from "./pages/UsersPage";
import RegistrationsPage from "./pages/RegistrationsPage";
import NewsletterPage from "./pages/NewsletterPage";
import EspaceProAccountsPage from "./pages/EspaceProAccountsPage";
import EspaceProExpertPanelPage from "./pages/EspaceProExpertPanelPage";
import FinancePage from "./pages/FinancePage";
import NotificationsPage from "./pages/NotificationsPage";
import DigitalizationServicesPage from "./pages/DigitalizationServicesPage";
import DigitalizationProductsPage from "./pages/DigitalizationProductsPage";
import DigitalizationPortfolioPage from "./pages/DigitalizationPortfolioPage";
import DigitalizationContactsPage from "./pages/DigitalizationContactsPage";
import DigitalizationTestimonialsPage from "./pages/DigitalizationTestimonialsPage";
import SettingsPage from "./pages/SettingsPage";
import SiteConfigPage from "./pages/SiteConfigPage";
import AppearancePage from "./pages/AppearancePage";
import EspaceRessourcesSettingsPage from "./pages/EspaceRessourcesSettingsPage";
import FacturationPage from "./pages/FacturationPage";
import DiagnosticSessionsPage from "./pages/DiagnosticSessionsPage";
import DiagnosticSessionDetailPage from "./pages/DiagnosticSessionDetailPage";
import ConsultingOperationnelAccountsPage from "./pages/ConsultingOperationnelAccountsPage";
import ETrainingTestimonialsPage from "./pages/ETrainingTestimonialsPage";
import ParticipationVerificationsPage from "./pages/ParticipationVerificationsPage";

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
      <Route path={ROUTES.DIAGNOSTIC_SESSIONS} element={<Layout><DiagnosticSessionsPage /></Layout>} />
      <Route path={ROUTES.DIAGNOSTIC_SESSION_DETAIL} element={<Layout><DiagnosticSessionDetailPage /></Layout>} />
      <Route path={ROUTES.CATEGORIES} element={<Layout><CategoriesPage /></Layout>} />
      <Route path={ROUTES.PARTICIPANTS_MANAGEMENT} element={<Layout><ParticipantsManagementPage /></Layout>} />
      <Route path={ROUTES.ETRAINING_TESTIMONIALS} element={<Layout><ETrainingTestimonialsPage /></Layout>} />
      <Route path={ROUTES.EVENTS} element={<Layout><EventsPage /></Layout>} />
      <Route path={ROUTES.PARTNER_TESTIMONIALS} element={<Layout><PartnerTestimonialsPage /></Layout>} />
      <Route path={ROUTES.USERS} element={<Layout><UsersPage /></Layout>} />
      <Route path={ROUTES.REGISTRATIONS} element={<Layout><RegistrationsPage /></Layout>} />
      <Route path={ROUTES.NEWSLETTER} element={<Layout><NewsletterPage /></Layout>} />
      <Route path={ROUTES.ESPACE_PRO_ACCOUNTS} element={<Layout><EspaceProAccountsPage /></Layout>} />
      <Route path={ROUTES.ESPACE_PRO_EXPERT_PANEL} element={<Layout><EspaceProExpertPanelPage /></Layout>} />
      <Route path={ROUTES.PARTICIPATION_VERIFICATIONS} element={<Layout><ParticipationVerificationsPage /></Layout>} />
      <Route path={ROUTES.FINANCE} element={<Layout><FinancePage /></Layout>} />
      <Route path={ROUTES.NOTIFICATIONS} element={<Layout><NotificationsPage /></Layout>} />
      <Route path={ROUTES.DIGITALIZATION_SERVICES} element={<Layout><DigitalizationServicesPage /></Layout>} />
      <Route path={ROUTES.DIGITALIZATION_PRODUCTS} element={<Layout><DigitalizationProductsPage /></Layout>} />
      <Route path={ROUTES.DIGITALIZATION_PORTFOLIO} element={<Layout><DigitalizationPortfolioPage /></Layout>} />
      <Route path={ROUTES.DIGITALIZATION_CONTACTS} element={<Layout><DigitalizationContactsPage /></Layout>} />
      <Route path={ROUTES.DIGITALIZATION_TESTIMONIALS} element={<Layout><DigitalizationTestimonialsPage /></Layout>} />
      <Route path={ROUTES.SETTINGS} element={<Layout><SettingsPage /></Layout>} />
      <Route path={ROUTES.SITE_CONFIG} element={<Layout><SiteConfigPage /></Layout>} />
      <Route path={ROUTES.APPEARANCE} element={<Layout><AppearancePage /></Layout>} />
      <Route path={ROUTES.ESPACE_RESSOURCES_SETTINGS} element={<Layout><EspaceRessourcesSettingsPage /></Layout>} />
      <Route path={ROUTES.FACTURATION} element={<Layout><FacturationPage /></Layout>} />
      <Route path={ROUTES.CONSULTING_OPERATIONNEL_ACCOUNTS} element={<Layout><ConsultingOperationnelAccountsPage /></Layout>} />
      
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
