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
import TestimonialsPage from "./pages/TestimonialsPage";
import EventsPage from "./pages/EventsPage";
import PartnerTestimonialsPage from "./pages/PartnerTestimonialsPage";
import FooterSettingsPage from "./pages/FooterSettingsPage";
import UsersPage from "./pages/UsersPage";
import PartnerManagementPage from './pages/PartnerManagementPage';
import CommercialServicesPage from './pages/CommercialServicesPage';
import ParticipantsPage from "./pages/ParticipantsPage";
import FreeCoursesManager from "./components/free-courses/FreeCoursesManager";
import AttestationsPage from "./pages/AttestationsPage";
import StaticPagesPage from "./pages/StaticPagesPage";
import HeroSectionPage from "./pages/HeroSectionPage";
import AboutSectionPage from "./pages/AboutSectionPage";
import ContactSectionPage from "./pages/ContactSectionPage";
import SettingsPage from "./pages/SettingsPage";
import SiteConfigPage from "./pages/SiteConfigPage";
import AppearancePage from "./pages/AppearancePage";
import FreelancerOffersPage from "./pages/FreelancerOffersPage";
import FreelancerMeetingsPage from "./pages/FreelancerMeetingsPage";
import RegistrationsPage from "./pages/RegistrationsPage";
import NewsletterPage from "./pages/NewsletterPage";
import NotificationsPage from "./pages/NotificationsPage";
import FinancePage from "./pages/FinancePage";
import DigitalizationServicesPage from "./pages/DigitalizationServicesPage";
import DigitalizationProductsPage from "./pages/DigitalizationProductsPage";
import DigitalizationPortfolioPage from "./pages/DigitalizationPortfolioPage";
import DigitalizationContactsPage from "./pages/DigitalizationContactsPage";
import DigitalizationTestimonialsPage from "./pages/DigitalizationTestimonialsPage";

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
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
 * Handles all routing logic
 */
const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Route - Login */}
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

      {/* Protected Routes */}
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
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                {/* Dashboard */}
                <Route path="/" element={<Dashboard />} />

                {/* Content Management */}
                <Route path={ROUTES.PROGRAMS} element={<ProgramsPage />} />
                <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
                <Route path={ROUTES.PACKS} element={<PacksPage />} />
                <Route
                  path={ROUTES.TESTIMONIALS}
                  element={<TestimonialsPage />}
                />
                <Route path={ROUTES.EVENTS} element={<EventsPage />} />
                <Route
                  path={ROUTES.PARTNER_TESTIMONIALS}
                  element={<PartnerTestimonialsPage />}
                />
                <Route
                  path={ROUTES.FOOTER_SETTINGS}
                  element={<FooterSettingsPage />}
                />

                {/* User Management */}
                                <Route path={ROUTES.USERS} element={<UsersPage />} />
                <Route path={ROUTES.PARTNERS} element={<PartnerManagementPage />} />
                <Route path="/commercial-services" element={<CommercialServicesPage />} />
                <Route path={ROUTES.FREELANCER_OFFERS} element={<FreelancerOffersPage />} />
                <Route path={ROUTES.FREELANCER_MEETINGS} element={<FreelancerMeetingsPage />} />
                <Route
                  path={ROUTES.PARTICIPANTS}
                  element={<ParticipantsPage />}
                />
                <Route
                  path={ROUTES.ATTESTATIONS}
                  element={<AttestationsPage />}
                />
                <Route path="/free-courses" element={<FreeCoursesManager />} />

                {/* Static Pages */}
                <Route
                  path={ROUTES.STATIC_PAGES}
                  element={<StaticPagesPage />}
                />
                <Route
                  path={ROUTES.HERO_SECTION}
                  element={<HeroSectionPage />}
                />
                <Route
                  path={ROUTES.ABOUT_SECTION}
                  element={<AboutSectionPage />}
                />
                <Route
                  path={ROUTES.CONTACT_SECTION}
                  element={<ContactSectionPage />}
                />

                {/* Settings */}
                <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
                <Route path={ROUTES.SITE_CONFIG} element={<SiteConfigPage />} />
                <Route path={ROUTES.APPEARANCE} element={<AppearancePage />} />

                {/* Registrations List */}
                <Route path={ROUTES.REGISTRATIONS} element={<RegistrationsPage />} />

                {/* Newsletter */}
                <Route path={ROUTES.NEWSLETTER} element={<NewsletterPage />} />

                {/* Notifications */}
                <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />

                {/* Finance */}
                <Route path={ROUTES.FINANCE} element={<FinancePage />} />

                {/* Digitalization Module */}
                <Route
                  path={ROUTES.DIGITALIZATION}
                  element={<Navigate to={ROUTES.DIGITALIZATION_SERVICES} replace />}
                />
                <Route path={ROUTES.DIGITALIZATION_SERVICES} element={<DigitalizationServicesPage />} />
                <Route path={ROUTES.DIGITALIZATION_PRODUCTS} element={<DigitalizationProductsPage />} />
                <Route path={ROUTES.DIGITALIZATION_PORTFOLIO} element={<DigitalizationPortfolioPage />} />
                <Route path={ROUTES.DIGITALIZATION_CONTACTS} element={<DigitalizationContactsPage />} />
                <Route path={ROUTES.DIGITALIZATION_TESTIMONIALS} element={<DigitalizationTestimonialsPage />} />

                {/* Catch all - redirect to dashboard */}
                <Route
                  path="*"
                  element={<Navigate to={ROUTES.DASHBOARD} replace />}
                />
              </Routes>
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
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
};

export default App;
