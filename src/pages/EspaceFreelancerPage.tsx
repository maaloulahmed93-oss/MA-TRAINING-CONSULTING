import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import SafeFreelancerLoginModal from '../components/freelancer/SafeFreelancerLoginModal';
import DashboardOverview from '../components/DashboardOverview';
import JobOffersTab from '../components/freelancer/JobOffersTab';
import ProjectsTab from '../components/freelancer/ProjectsTab';
import MeetingsTab from '../components/freelancer/MeetingsTab';
import DeliverablesTab from '../components/freelancer/DeliverablesTab';
import NotificationsTab from '../components/freelancer/NotificationsTab';

// Service imports - wrapped in try-catch for safety
import * as freelancerAuthService from '../services/freelancerAuth';
import * as freelancerDataService from '../services/freelancerData';

console.log('✅ Services loaded successfully');

// Types
type TabType = 'dashboard' | 'offers' | 'projects' | 'meetings' | 'deliverables' | 'notifications';

interface FreelancerInfo {
  freelancerId: string;
}

interface FreelancerStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalEarnings: number;
  monthlyEarnings: number;
  averageRating: number;
  totalHours: number;
  successRate: number;
  responseTime: string;
  clientSatisfaction: number;
}

const EspaceFreelancerPage: React.FC = () => {
  console.log('🚀 EspaceFreelancerPage: Component rendering');
  
  // Navigation
  const navigate = useNavigate();
  
  // State management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [freelancerInfo, setFreelancerInfo] = useState<FreelancerInfo | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<FreelancerStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Safe authentication check with error handling
  const checkAuthentication = useCallback(async () => {
    console.log('🔍 EspaceFreelancerPage: Starting authentication check');
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!freelancerAuthService) {
        throw new Error('Authentication service not available');
      }
      
      const authenticated = freelancerAuthService.isFreelancerAuthenticated();
      const session = freelancerAuthService.getFreelancerSession();
      
      console.log('🔍 Authentication result:', { authenticated, session });
      
      if (authenticated && session) {
        setIsAuthenticated(true);
        setFreelancerInfo({ freelancerId: session.freelancerId });
        
        // Load stats if available
        if (freelancerDataService?.mockFreelancerStats) {
          setStats(freelancerDataService.mockFreelancerStats);
        }
        
        console.log('✅ User authenticated successfully');
      } else {
        setIsAuthenticated(false);
        setFreelancerInfo(null);
        console.log('❌ User not authenticated');
      }
      
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
      setIsAuthenticated(false);
      setFreelancerInfo(null);
    } finally {
      setIsLoading(false);
      console.log('🏁 Authentication check completed');
    }
  }, []); // Empty dependency array - safe because it doesn't depend on any state

  // Effect for initial authentication check
  useEffect(() => {
    console.log('🎬 EspaceFreelancerPage: useEffect triggered');
    checkAuthentication();
  }, [checkAuthentication]);

  // Handle successful authentication
  const handleAuthenticated = useCallback((freelancerId: string) => {
    console.log('🎉 Authentication successful for:', freelancerId);
    setIsAuthenticated(true);
    setFreelancerInfo({ freelancerId });
    setIsLoading(false);
    // Don't re-check authentication immediately to avoid loop
    // checkAuthentication();
  }, []);

  // Handler for logout
  const handleLogout = useCallback(() => {
    console.log('👋 Logging out user');
    try {
      if (freelancerAuthService?.clearFreelancerSession) {
        freelancerAuthService.clearFreelancerSession();
      }
      setIsAuthenticated(false);
      setFreelancerInfo(null);
      setActiveTab('dashboard');
      setStats(null);
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  }, []);

  // Handler for navigation back
  const handleBack = useCallback(() => {
    console.log('🔙 Navigating back to home');
    navigate('/');
  }, [navigate]);

  // Loading state
  if (isLoading) {
    console.log('⏳ Rendering loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.log('❌ Rendering error state:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur de Chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-2">
            <button 
              onClick={checkAuthentication}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Réessayer
            </button>
            <button 
              onClick={handleBack}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated state - show login modal
  if (!isAuthenticated) {
    console.log('🔐 Rendering login modal');
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <ErrorBoundary componentName="LoginModal">
          <SafeFreelancerLoginModal onAuthenticated={handleAuthenticated} />
        </ErrorBoundary>
      </div>
    );
  }

  // Main authenticated content
  console.log('✅ Rendering main authenticated content');
  return (
    <ErrorBoundary componentName="EspaceFreelancerPage">
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header Section */}
        <ErrorBoundary componentName="Header">
          <header className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <span>←</span>
                    <span className="font-medium">Retour</span>
                  </button>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <h1 className="text-xl font-bold text-gray-800">Espace Freelancer</h1>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {freelancerInfo?.freelancerId || 'Utilisateur'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Freelancer
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <span>🚪</span>
                    <span className="font-medium">Déconnexion</span>
                  </button>
                </div>
              </div>
            </div>
          </header>
        </ErrorBoundary>

        {/* Navigation Tabs - Placeholder for now */}
        <ErrorBoundary componentName="Navigation">
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-8 overflow-x-auto">
                {[
  {
    key: 'dashboard',
    label: 'Tableau de bord',
    icon: '🏠',
    tooltip: 'Vue d’ensemble'
  },
  {
    key: 'offers',
    label: 'Offres',
    icon: '📄',
    tooltip: 'Voir les offres reçues'
  },
  {
    key: 'projects',
    label: 'Projets',
    icon: '📁',
    tooltip: 'Gérer vos projets'
  },
  {
    key: 'meetings',
    label: 'Réunions',
    icon: '📅',
    tooltip: 'Consulter vos réunions'
  },
  {
    key: 'deliverables',
    label: 'Livrables',
    icon: '📦',
    tooltip: 'Voir et soumettre vos livrables'
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: '🔔',
    tooltip: 'Voir les décisions de l\'admin'
  }
].map((tab) => (
  <button
    key={tab.key}
    onClick={() => setActiveTab(tab.key as TabType)}
    className={`relative flex items-center gap-2 py-4 px-4 rounded-t-lg border-b-2 font-semibold text-base whitespace-nowrap transition-all duration-200
      ${activeTab === tab.key
        ? 'border-green-500 text-green-700 bg-green-50 shadow-inner'
        : 'border-transparent text-gray-500 hover:text-green-700 hover:bg-gray-50 hover:border-gray-300'}
    `}
    title={tab.tooltip}
    aria-label={tab.label}
  >
    <span className="text-xl">{tab.icon}</span>
    <span>{tab.label}</span>
    {activeTab === tab.key && (
      <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
    )}
  </button>
))}
              </div>
            </div>
          </nav>
        </ErrorBoundary>

        {/* Main Content */}
        <ErrorBoundary componentName="MainContent">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Dashboard Content - Safe fallback for now */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-white">👤</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Bienvenue, {freelancerInfo?.freelancerId}
                    </h2>
                    <p className="text-gray-600">
                      Gérez vos missions et collaborations depuis votre espace personnel
                    </p>
                  </div>
                </div>
              </div>


              {/* Tab Content dynamique */}
              {activeTab === 'dashboard' ? (
                <DashboardOverview />
              ) : activeTab === 'offers' ? (
                <JobOffersTab onAccepted={() => setActiveTab('projects')} />
              ) : activeTab === 'projects' ? (
                <ProjectsTab />
              ) : activeTab === 'meetings' ? (
                <MeetingsTab />
              ) : activeTab === 'deliverables' ? (
                <DeliverablesTab />
              ) : activeTab === 'notifications' ? (
                <NotificationsTab freelancerId={freelancerInfo?.freelancerId || ''} />
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {(() => {
                      const label = `${activeTab}`;
                      return `Contenu pour: ${label.charAt(0).toUpperCase()}${label.slice(1)}`;
                    })()}
                  </h3>
                  <p className="text-gray-600">
                    Cette section sera remplacée par le composant spécifique à l'onglet sélectionné.
                  </p>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">
                      🔧 Zone réservée pour les composants d'onglets:
                      <br />• JobOffersTab (onglet: offers)
                      <br />• ProjectsTab (onglet: projects)
                      <br />• MeetingsTab (onglet: meetings)
                      <br />• DeliverablesTab (onglet: deliverables)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default EspaceFreelancerPage;
