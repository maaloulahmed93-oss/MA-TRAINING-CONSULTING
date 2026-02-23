import React, { useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ROUTES } from "./config/routes";

// Demo Components
import DemoTimer from "./components/DemoTimer";
import DemoExpired from "./components/DemoExpired";

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
import NewsletterPage from "./pages/NewsletterPage";
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
import DiagnosticSessionExpertHandoverPage from "./pages/DiagnosticSessionExpertHandoverPage";
import DiagnosticExpertHandoverS1Page from "./pages/DiagnosticExpertHandoverS1Page";
import DiagnosticQuestionsPage from "./pages/DiagnosticQuestionsPage";
import ETrainingTestimonialsPage from "./pages/ETrainingTestimonialsPage";
import ParticipationVerificationsPage from "./pages/ParticipationVerificationsPage";
import ETrainingPricingPage from "./pages/ETrainingPricingPage";
import ConsultingOperationnelAccountsPage from "./pages/ConsultingOperationnelAccountsPage";
import Service2ExamsPage from "./pages/Service2ExamsPage";
import Service2FinishSlotsPage from "./pages/Service2FinishSlotsPage";

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
      <Route path={ROUTES.DIAGNOSTIC_EXPERT_HANDOVER_S1} element={<Layout><DiagnosticExpertHandoverS1Page /></Layout>} />
      <Route path={ROUTES.DIAGNOSTIC_SESSION_DETAIL} element={<Layout><DiagnosticSessionDetailPage /></Layout>} />
      <Route path={ROUTES.DIAGNOSTIC_SESSION_EXPERT_HANDOVER} element={<Layout><DiagnosticSessionExpertHandoverPage /></Layout>} />
      <Route path={ROUTES.DIAGNOSTIC_QUESTIONS} element={<Layout><DiagnosticQuestionsPage /></Layout>} />
      <Route path={ROUTES.CATEGORIES} element={<Layout><CategoriesPage /></Layout>} />
      <Route path={ROUTES.PARTICIPANTS_MANAGEMENT} element={<Layout><ParticipantsManagementPage /></Layout>} />
      <Route path={ROUTES.ETRAINING_TESTIMONIALS} element={<Layout><ETrainingTestimonialsPage /></Layout>} />
      <Route path={ROUTES.ETRAINING_PRICING} element={<Layout><ETrainingPricingPage /></Layout>} />
      <Route path={ROUTES.EVENTS} element={<Layout><EventsPage /></Layout>} />
      <Route path={ROUTES.PARTNER_TESTIMONIALS} element={<Layout><PartnerTestimonialsPage /></Layout>} />
      <Route path={ROUTES.USERS} element={<Layout><UsersPage /></Layout>} />
      <Route path={ROUTES.NEWSLETTER} element={<Layout><NewsletterPage /></Layout>} />
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
      <Route path={ROUTES.SERVICE2_EXAMS} element={<Layout><Service2ExamsPage /></Layout>} />
      <Route path={ROUTES.SERVICE2_FINISH_SLOTS} element={<Layout><Service2FinishSlotsPage /></Layout>} />
      
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
  const [isExpired, setIsExpired] = useState(false);

  console.log('✅ MATC Admin Panel loaded successfully');

  // Si la démo est expirée, afficher uniquement l'écran de blocage
  if (isExpired) {
    return (
      <DemoExpired 
        storageKey="admin_demo_start_time" 
        onUnlock={() => setIsExpired(false)} 
      />
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <DemoTimer durationMinutes={45} onExpire={() => setIsExpired(true)} />
        <AppRoutes />
      </div>
    </AuthProvider>
  );
};

export default App;
