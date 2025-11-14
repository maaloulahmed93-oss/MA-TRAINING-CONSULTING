import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Bell } from 'lucide-react';
import ParticipantDashboard from './ParticipantDashboard';
import MesFormations from './MesFormations';
import Projets from './Projets';
import Coaching from './Coaching';
import Notifications from './Notifications';
import { mockParticipants } from '../../data/participantData';
import { participantApiService } from '../../services/participantApiService';

type PageType = 'login' | 'dashboard' | 'formations' | 'projects' | 'coaching' | 'notifications';

const ParticipantSpace = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('login');
  const [participantId, setParticipantId] = useState<string>('');
  const [participant, setParticipant] = useState<any>(null);
  const [isLoadingParticipant, setIsLoadingParticipant] = useState(false);
  const [loginForm, setLoginForm] = useState({ id: '', email: '' });
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const handleLogin = async (id: string, email: string) => {
    console.log('🔐 ParticipantSpace: Login avec ID:', id, 'Email:', email);
    
    if (!id.trim() || !email.trim()) {
      setLoginError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    try {
      // Verify participant credentials with backend
      const response = await fetch(`https://matc-backend.onrender.com/api/participants/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ participantId: id.trim(), email: email.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const participantData = {
            id: id.trim(),
            email: email.trim(),
            fullName: data.data.fullName,
            loginTime: new Date().toISOString()
          };
          
          // Save login state to localStorage
          localStorage.setItem('participantSession', JSON.stringify(participantData));
          localStorage.setItem('currentParticipantId', id.trim());
          
          setParticipantId(id.trim());
          setCurrentPage('dashboard');
          console.log('✅ ParticipantSpace: Connexion réussie et session sauvegardée');
        } else {
          setLoginError('ID ou email incorrect');
        }
      } else {
        setLoginError('ID ou email incorrect');
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      setLoginError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    console.log('🚪 ParticipantSpace: Déconnexion');
    setParticipantId('');
    setParticipant(null);
    setCurrentPage('login');
    setLoginForm({ id: '', email: '' });
    setLoginError('');
    
    // Clear all session data
    localStorage.removeItem('currentParticipantId');
    localStorage.removeItem('participantSession');
    
    console.log('✅ Session supprimée, retour à la page de connexion');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
  };

  // Check for existing session on component mount
  useEffect(() => {
    const checkExistingSession = () => {
      console.log('🔄 ParticipantSpace: Vérification session existante...');
      
      try {
        const savedSession = localStorage.getItem('participantSession');
        const savedParticipantId = localStorage.getItem('currentParticipantId');
        
        if (savedSession && savedParticipantId) {
          const sessionData = JSON.parse(savedSession);
          console.log('✅ Session trouvée:', sessionData);
          
          // Check if session is still valid (less than 24 hours old)
          const loginTime = new Date(sessionData.loginTime);
          const now = new Date();
          const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            setParticipantId(savedParticipantId);
            setCurrentPage('dashboard');
            console.log('✅ Session restaurée automatiquement');
          } else {
            // Session expired, clear it
            localStorage.removeItem('participantSession');
            localStorage.removeItem('currentParticipantId');
            console.log('⚠️ Session expirée, suppression');
          }
        } else {
          console.log('ℹ️ Aucune session trouvée');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification de session:', error);
        // Clear corrupted session data
        localStorage.removeItem('participantSession');
        localStorage.removeItem('currentParticipantId');
      } finally {
        setIsInitializing(false);
      }
    };

    checkExistingSession();
  }, []);

  // Load participant data when participantId changes
  useEffect(() => {
    const loadParticipant = async () => {
      if (!participantId) {
        setParticipant(null);
        return;
      }

      setIsLoadingParticipant(true);
      try {
        console.log('👤 ParticipantSpace: Chargement participant:', participantId);
        
        // Try API first
        const apiParticipant = await participantApiService.getParticipant(participantId);
        if (apiParticipant) {
          const participantData = {
            id: apiParticipant.id || apiParticipant.partnerId,
            name: apiParticipant.fullName,
            email: apiParticipant.email,
            avatar: apiParticipant.avatar,
            enrolledDate: apiParticipant.enrollmentDate || new Date().toISOString(),
            totalProgress: apiParticipant.totalProgress || 0,
            completedCourses: 0,
            totalCourses: 0
          };
          setParticipant(participantData);
          console.log('✅ ParticipantSpace: Participant chargé depuis API:', participantData);
        } else {
          // Fallback to mock data
          const mockParticipant = mockParticipants[participantId];
          if (mockParticipant) {
            setParticipant(mockParticipant);
            console.log('⚠️ ParticipantSpace: Participant chargé depuis mock:', mockParticipant);
          } else {
            console.error('❌ ParticipantSpace: Participant non trouvé:', participantId);
            setParticipant(null);
          }
        }
      } catch (error) {
        console.error('❌ ParticipantSpace: Erreur chargement participant:', error);
        // Fallback to mock data
        const mockParticipant = mockParticipants[participantId];
        if (mockParticipant) {
          setParticipant(mockParticipant);
          console.log('⚠️ ParticipantSpace: Fallback vers mock data:', mockParticipant);
        } else {
          setParticipant(null);
        }
      } finally {
        setIsLoadingParticipant(false);
      }
    };

    loadParticipant();
  }, [participantId]);

  // Show loading screen while checking for existing session
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Vérification de session...</h2>
          <p className="text-gray-600">Patientez un moment</p>
        </div>
      </div>
    );
  }

  // Page de connexion - Enhanced Design
  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl px-0">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative">
            <div className="flex flex-col lg:flex-row lg:min-h-[500px]">
              {/* Left Side - Login Form */}
              <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center relative">
                <div className="mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Bonjour!</h1>
                  <p className="text-sm sm:text-base text-gray-600">Connectez-vous à votre compte</p>
                </div>

                {/* Error Message */}
                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    <p className="text-sm">{loginError}</p>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin(loginForm.id, loginForm.email);
                }} className="space-y-5 sm:space-y-6">
                  {/* Email Field */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      placeholder="E-mail"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                      className="block w-full pl-12 pr-4 py-3 sm:py-4 bg-blue-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-700 placeholder-gray-500"
                      required
                      disabled={isLoggingIn}
                    />
                  </div>

                  {/* ID Field (as Password) */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="ID Participant"
                      value={loginForm.id}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, id: e.target.value }))}
                      className="block w-full pl-12 pr-4 py-3 sm:py-4 bg-blue-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-700 placeholder-gray-500"
                      required
                      disabled={isLoggingIn}
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                      Se souvenir de moi
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoggingIn || !loginForm.id.trim() || !loginForm.email.trim()}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 sm:py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoggingIn ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connexion...
                      </>
                    ) : (
                      'SE CONNECTER'
                    )}
                  </button>
                </form>

                {/* Help Section */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500">
                    Besoin d'aide ? Contactez votre administrateur
                  </p>
                </div>
              </div>

              {/* Right Side - Welcome Section */}
              <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-500 to-purple-600 p-8 sm:p-10 lg:p-12 flex flex-col justify-center text-white relative overflow-hidden mt-8 lg:mt-0">
                {/* Decorative Wave Shapes */}
                <div className="absolute top-0 right-0 w-full h-32">
                  <svg viewBox="0 0 400 100" className="w-full h-full">
                    <path d="M0,50 Q100,0 200,50 T400,50 L400,0 L0,0 Z" fill="rgba(255,255,255,0.1)" />
                  </svg>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-40">
                  <svg viewBox="0 0 400 120" className="w-full h-full">
                    <path d="M0,120 Q100,70 200,120 T400,120 L400,120 L0,120 Z" fill="rgba(255,255,255,0.1)" />
                  </svg>
                </div>

                <div className="relative z-10 text-center">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Bienvenue!</h2>
                  <p className="text-base sm:text-lg text-blue-100 leading-relaxed max-w-md mx-auto px-2">
                    Accédez à votre espace de formation consultative avec tous vos cours, ressources et outils d'apprentissage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interface principale avec navigation
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm border-b sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MT</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">MA Training Consulting</h1>
                <p className="text-xs text-gray-500">Espace Participant</p>
              </div>
            </div>

            {/* User Info and Logout */}
            {isLoadingParticipant ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Chargement...</span>
              </div>
            ) : participant ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  {participant.avatar ? (
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                    <p className="text-xs text-gray-500">{participant.email}</p>
                  </div>
                </div>
                
                {/* Notifications Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigate('notifications')}
                  className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors border ${
                    currentPage === 'notifications'
                      ? 'bg-orange-50 text-orange-600 border-orange-200'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50 border-gray-200 hover:border-orange-200'
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">Notifications</span>
                  {/* Notification badge - will be dynamic */}
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    !
                  </span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-red-200 hover:border-red-300"
                  title="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline font-medium">Déconnexion</span>
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm text-gray-500">Utilisateur non trouvé</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Page Content */}
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {currentPage === 'dashboard' && (
          <ParticipantDashboard 
            participantId={participantId} 
            onNavigate={handleNavigate} 
          />
        )}
        {currentPage === 'formations' && (
          <MesFormations 
            participantId={participantId} 
            onNavigate={handleNavigate} 
          />
        )}
        {currentPage === 'projects' && (
          <Projets 
            participantId={participantId} 
            onNavigate={handleNavigate} 
          />
        )}
        {currentPage === 'coaching' && (
          <Coaching 
            participantId={participantId} 
            onNavigate={handleNavigate} 
          />
        )}
        {currentPage === 'notifications' && (
          <Notifications 
            participantId={participantId} 
            onNavigate={handleNavigate} 
          />
        )}
      </motion.div>

      {/* Floating Navigation (Mobile) */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed bottom-4 left-4 right-4 md:hidden z-50"
      >
        <div className="bg-white rounded-2xl shadow-lg border p-2">
          <div className="flex items-center justify-around">
            <button
              onClick={() => handleNavigate('dashboard')}
              className={`p-3 rounded-xl transition-colors ${
                currentPage === 'dashboard' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleNavigate('formations')}
              className={`p-3 rounded-xl transition-colors ${
                currentPage === 'formations' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📚
            </button>
            <button
              onClick={() => handleNavigate('projects')}
              className={`p-3 rounded-xl transition-colors ${
                currentPage === 'projects' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📁
            </button>
            <button
              onClick={() => handleNavigate('coaching')}
              className={`p-3 rounded-xl transition-colors ${
                currentPage === 'coaching' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              💬
            </button>
            <button
              onClick={() => handleNavigate('notifications')}
              className={`p-3 rounded-xl transition-colors ${
                currentPage === 'notifications' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ParticipantSpace;
