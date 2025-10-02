import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, ArrowRightOnRectangleIcon, ChartBarIcon, CurrencyDollarIcon, UserGroupIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CommercialLoginForm from '../components/commercial/CommercialLoginForm';
import { hybridCommercialService, CommercialDeal, CommercialStats } from '../services/commercialApiService';

const EspaceCommercialPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [commercialInfo, setCommercialInfo] = useState<any>(null);
  const [deals, setDeals] = useState<CommercialDeal[]>([]);
  const [stats, setStats] = useState<CommercialStats | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const checkAuthentication = () => {
    const sessionValid = hybridCommercialService.isSessionValid();
    const sessionData = hybridCommercialService.getSessionData();
    
    setIsAuthenticated(sessionValid);
    setCommercialInfo(sessionData?.commercial || null);
    setIsLoading(false);
    
    if (sessionValid && sessionData?.commercial) {
      loadCommercialData(sessionData.commercial.partnerId);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  const handleAuthenticated = (commercialData: any) => {
    setCommercialInfo(commercialData);
    setIsAuthenticated(true);
    loadCommercialData(commercialData.partnerId);
  };

  const loadCommercialData = async (commercialId: string) => {
    try {
      // Load deals
      const dealsResult = await hybridCommercialService.getDeals(commercialId);
      if (dealsResult.success) {
        setDeals(dealsResult.data || []);
      }

      // Load stats
      const statsResult = await hybridCommercialService.getStats(commercialId);
      if (statsResult.success) {
        setStats(statsResult.data || null);
      }
    } catch (error) {
      console.error('Error loading commercial data:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    hybridCommercialService.logout();
    setIsAuthenticated(false);
    setCommercialInfo(null);
    setDeals([]);
    setStats(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </motion.div>
      </div>
    );
  }

  // Not authenticated - show login form
  if (!isAuthenticated) {
    return (
      <CommercialLoginForm
        onLoginSuccess={handleAuthenticated}
        onError={(message) => console.error('Login error:', message)}
      />
    );
  }

  // Authenticated - show main content
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="font-medium">Retour</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {commercialInfo && (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {commercialInfo.fullName}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {commercialInfo.partnerId}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors duration-200"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span className="text-sm">Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 bg-white rounded-full px-6 py-3 shadow-lg mb-8">
              <span className="text-3xl">💼</span>
              <span className="text-lg font-semibold text-gray-700">Espace Commercial</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Bienvenue {commercialInfo?.fullName}
              <span className="block bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                dans votre Espace Commercial
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              Gérez vos deals, suivez vos commissions et développez votre portefeuille client.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-lg">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('deals')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'deals'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                Mes Deals
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'clients'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                Clients
              </button>
            </div>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Deals</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalDeals || 0}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Chiffre d'Affaires</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.chiffreAffaireTotal || 0}€</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Commission</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.commissionTotale || 0}€</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Deals Actives</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.dealsActives || 0}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Recent Deals */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Deals Récentes</h3>
                  <button
                    onClick={() => setActiveTab('deals')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Voir tout
                  </button>
                </div>
                
                {deals.length > 0 ? (
                  <div className="space-y-4">
                    {deals.slice(0, 3).map((deal) => (
                      <div key={deal._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{deal.dealTitle}</p>
                          <p className="text-sm text-gray-600">{deal.clientName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(deal.dateProspection).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{deal.montantTotal}€</p>
                          <p className="text-sm text-green-600">+{deal.montantCommission || 0}€ commission</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            deal.statutDeal === 'signe' ? 'bg-green-100 text-green-800' :
                            deal.statutDeal === 'negociation' ? 'bg-yellow-100 text-yellow-800' :
                            deal.statutDeal === 'prospection' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {deal.statutDeal}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune deal trouvée</p>
                    <p className="text-sm text-gray-400">Commencez par créer votre première deal</p>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* Deals Tab */}
          {activeTab === 'deals' && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestion des Deals</h3>
                <p className="text-gray-600">Fonctionnalité de gestion des deals en cours de développement...</p>
              </div>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestion des Clients</h3>
                <p className="text-gray-600">Fonctionnalité de gestion des clients en cours de développement...</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EspaceCommercialPage;
