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
import ProgramsPage from "./pages/ProgramsPage";
import CategoriesPage from "./pages/CategoriesPage";
import PacksPage from "./pages/PacksPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import EventsPage from "./pages/EventsPage";
import PartnerTestimonialsPage from "./pages/PartnerTestimonialsPage";
import FooterSettingsPage from "./pages/FooterSettingsPage";
import UsersPage from "./pages/UsersPage";
import RegistrationsPage from "./pages/RegistrationsPage";
import NewsletterPage from "./pages/NewsletterPage";
import ParticipantsPage from "./pages/ParticipantsPage";
import AttestationsPage from "./pages/AttestationsPage";
import FreeCoursesPage from "./pages/FreeCoursesPage";
import FinancePage from "./pages/FinancePage";
import PartnerManagementPage from "./pages/PartnerManagementPage";
import CommercialServicesPage from "./pages/CommercialServicesPage";
import FreelancerOffersPage from "./pages/FreelancerOffersPage";
import FreelancerMeetingsPage from "./pages/FreelancerMeetingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import DigitalizationServicesPage from "./pages/DigitalizationServicesPage";
import DigitalizationProductsPage from "./pages/DigitalizationProductsPage";
import DigitalizationPortfolioPage from "./pages/DigitalizationPortfolioPage";
import DigitalizationContactsPage from "./pages/DigitalizationContactsPage";
import DigitalizationTestimonialsPage from "./pages/DigitalizationTestimonialsPage";

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
      <Route path={ROUTES.REGISTRATIONS} element={<Layout><RegistrationsPage /></Layout>} />
      <Route path={ROUTES.NEWSLETTER} element={<Layout><NewsletterPage /></Layout>} />
      <Route path={ROUTES.PARTICIPANTS} element={<Layout><ParticipantsPage /></Layout>} />
      <Route path={ROUTES.ATTESTATIONS} element={<Layout><AttestationsPage /></Layout>} />
      <Route path={ROUTES.FREE_COURSES} element={<Layout><FreeCoursesPage /></Layout>} />
      <Route path={ROUTES.FINANCE} element={<Layout><FinancePage /></Layout>} />
      <Route path={ROUTES.PARTNERS} element={<Layout><PartnerManagementPage /></Layout>} />
      <Route path={ROUTES.COMMERCIAL_SERVICES} element={<Layout><CommercialServicesPage /></Layout>} />
      <Route path={ROUTES.FREELANCER_OFFERS} element={<Layout><FreelancerOffersPage /></Layout>} />
      <Route path={ROUTES.FREELANCER_MEETINGS} element={<Layout><FreelancerMeetingsPage /></Layout>} />
      <Route path={ROUTES.NOTIFICATIONS} element={<Layout><NotificationsPage /></Layout>} />
      <Route path={ROUTES.DIGITALIZATION_SERVICES} element={<Layout><DigitalizationServicesPage /></Layout>} />
      <Route path={ROUTES.DIGITALIZATION_PRODUCTS} element={<Layout><DigitalizationProductsPage /></Layout>} />
      <Route path={ROUTES.DIGITALIZATION_PORTFOLIO} element={<Layout><DigitalizationPortfolioPage /></Layout>} />
      <Route path={ROUTES.DIGITALIZATION_CONTACTS} element={<Layout><DigitalizationContactsPage /></Layout>} />
      <Route path={ROUTES.DIGITALIZATION_TESTIMONIALS} element={<Layout><DigitalizationTestimonialsPage /></Layout>} />
      
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
