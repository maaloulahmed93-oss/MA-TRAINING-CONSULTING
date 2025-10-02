import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import des nouveaux services API
import { 
  formateurAuthService, 
  FormateurLoginResponse 
} from '../services/formateurApiService';

// Import du nouveau composant de connexion
import FormateurLoginForm from '../components/formateur/FormateurLoginForm';

// Import de la nouvelle dashboard
import FormateurDashboard from '../components/formateur/FormateurDashboard';

const EspaceFormateurPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string>('');
  const [formateurInfo, setFormateurInfo] = useState<FormateurLoginResponse['data'] | null>(null);

  const checkAuthentication = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Vérifier si une session existe
      const authenticated = formateurAuthService.isAuthenticated();
      const formateur = formateurAuthService.getCurrentFormateur();
      
      if (authenticated && formateur) {
        setIsAuthenticated(true);
        setFormateurInfo(formateur);
      } else {
        setIsAuthenticated(false);
        setFormateurInfo(null);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors de la vérification d\'authentification:', error);
      setIsLoading(false);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const handleLogin = async (formateurId: string, email: string) => {
    try {
      setLoginError('');
      setIsLoading(true);
      
      const formateur = await formateurAuthService.login(formateurId, email);
      setIsAuthenticated(true);
      setFormateurInfo(formateur);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setLoginError(error instanceof Error ? error.message : 'Erreur de connexion');
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    formateurAuthService.logout();
    setIsAuthenticated(false);
    setFormateurInfo(null);
  };

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Vérification de l'authentification...</p>
        </motion.div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <FormateurLoginForm 
        onLogin={handleLogin}
        isLoading={isLoading}
        error={loginError}
      />
    );
  }

  // Show dashboard if authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec bouton retour et déconnexion */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate('/espace-partenariat')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour au Partenariat</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard principal */}
      {formateurInfo && (
        <FormateurDashboard 
          formateurId={formateurInfo.partnerId}
          formateurName={formateurInfo.fullName}
        />
      )}
    </div>
  );
};

export default EspaceFormateurPage;
