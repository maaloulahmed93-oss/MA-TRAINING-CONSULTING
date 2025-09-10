import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Users,
  DollarSign,
  Star,
  ArrowLeft,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TrainerStats } from '../types/trainer';

// Import des services d'authentification
import { 
  isTrainerAuthenticated, 
  clearTrainerSession, 
  getTrainerSession 
} from '../services/trainerAuth';

// Import des services de stockage
import { 
  initializeSampleData, 
  getProgrammes, 
  getParticipants, 
  getPayments 
} from '../services/trainerStorage';

// Import du modal de connexion
import TrainerLoginModal from '../components/trainer/TrainerLoginModal';

// Import des onglets
import ProgrammesTab from '../components/trainer/ProgrammesTab';
import SessionsTab from '../components/trainer/SessionsTab';
import ParticipantsTab from '../components/trainer/ParticipantsTab';
import EventsTab from '../components/trainer/EventsTab';
import PaymentsTab from '../components/trainer/PaymentsTab';

const EspaceFormateurPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('programmes');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trainerInfo, setTrainerInfo] = useState<{ id: string; timestamp: number } | null>(null);
  const [stats, setStats] = useState<TrainerStats>({
    totalProgrammes: 0,
    activeProgrammes: 0,
    totalParticipants: 0,
    totalRevenue: 0,
    totalCommission: 0,
    monthlyCommission: 0
  });

  const checkAuthentication = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const authenticated = isTrainerAuthenticated();
      const session = getTrainerSession();
      
      if (authenticated && session) {
        setIsAuthenticated(true);
        setTrainerInfo({ id: session.trainerId, timestamp: session.timestamp });
        
        // Initialize data and calculate stats only after authentication
        initializeSampleData();
        calculateStats();
      } else {
        setIsAuthenticated(false);
        setTrainerInfo(null);
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

  const handleAuthenticated = () => {
    checkAuthentication();
  };

  const handleLogout = () => {
    clearTrainerSession();
    setIsAuthenticated(false);
    setTrainerInfo(null);
    setActiveTab('programmes'); // Reset to default tab
  };

  const calculateStats = () => {
    const programmes = getProgrammes();
    const participants = getParticipants();
    const payments = getPayments();

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalCommission = payments.reduce((sum, payment) => sum + payment.commission, 0);
    
    // Monthly commission (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyCommission = payments
      .filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      })
      .reduce((sum, payment) => sum + payment.commission, 0);

    setStats({
      totalProgrammes: programmes.length,
      activeProgrammes: programmes.filter(p => p.status === 'Actif').length,
      totalParticipants: participants.length,
      totalRevenue,
      totalCommission,
      monthlyCommission
    });
  };

  const tabs = [
    { id: 'programmes', label: 'Programmes', icon: BookOpen },
    { id: 'sessions', label: 'Séances', icon: Calendar },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'events', label: 'Événements', icon: Star },
    { id: 'payments', label: 'Paiements & Commission', icon: DollarSign }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'programmes':
        return <ProgrammesTab onStatsUpdate={calculateStats} />;
      case 'sessions':
        return <SessionsTab onStatsUpdate={calculateStats} />;
      case 'participants':
        return <ParticipantsTab onStatsUpdate={calculateStats} />;
      case 'events':
        return <EventsTab onStatsUpdate={calculateStats} />;
      case 'payments':
        return <PaymentsTab stats={stats} />;
      default:
        return <ProgrammesTab onStatsUpdate={calculateStats} />;
    }
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

  // Show login modal if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <TrainerLoginModal onAuthenticated={handleAuthenticated} />
      </div>
    );
  }

  // Show dashboard if authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/partenariat')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Espace Formateur</h1>
                <p className="text-gray-600">Gérez vos programmes et participants</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {trainerInfo && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Formateur connecté</p>
                  <p className="text-lg font-semibold text-blue-600">{trainerInfo.id}</p>
                </div>
              )}
              <div className="text-right">
                <p className="text-sm text-gray-600">Commission ce mois</p>
                <p className="text-xl font-bold text-green-600">
                  {stats.monthlyCommission.toFixed(2)} DT
                </p>
              </div>
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
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Programmes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProgrammes}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProgrammes}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Participants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenus</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toFixed(0)} DT</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Commission</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCommission.toFixed(0)} DT</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EspaceFormateurPage;
