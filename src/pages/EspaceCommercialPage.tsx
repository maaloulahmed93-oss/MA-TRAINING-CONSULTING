import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, LogOut, TrendingUp, DollarSign, Users, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CommercialLoginModal from '../components/commercial/CommercialLoginModal';
import CommercialDashboard from '../components/commercial/CommercialDashboard';
import { 
  isCommercialAuthenticated, 
  getCommercialInfo, 
  clearCommercialSession 
} from '../services/commercialAuth';
import { 
  CommercialUser,
  initializeCommercialData,
  getLevelInfo
} from '../services/commercialData';

const EspaceCommercialPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [commercialInfo, setCommercialInfo] = useState<{ id: string; name: string } | null>(null);
  const [commercialData, setCommercialData] = useState<CommercialUser | null>(null);

  const checkAuthentication = useCallback(() => {
    console.log('🔍 EspaceCommercialPage: Starting authentication check');
    
    const authenticated = isCommercialAuthenticated();
    const info = getCommercialInfo();
    
    console.log('✅ Authentication result:', { authenticated, info });
    
    setIsAuthenticated(authenticated);
    setCommercialInfo(info);
    setIsLoading(false);
    
    console.log('🏁 Authentication check completed');
  }, []);

  useEffect(() => {
    console.log('🚀 EspaceCommercialPage: Component mounting');
    checkAuthentication();
  }, [checkAuthentication]);

  const handleAuthenticated = useCallback((commercialId: string) => {
    console.log('✅ User authenticated successfully:', commercialId);
    
    // Initialize commercial data
    const data = initializeCommercialData(commercialId);
    setCommercialData(data);
    
    checkAuthentication();
  }, [checkAuthentication]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    clearCommercialSession();
    setIsAuthenticated(false);
    setCommercialInfo(null);
    setCommercialData(null);
  };

  const handleDataUpdate = (updatedData: CommercialUser) => {
    setCommercialData(updatedData);
    // Also update the commercial info if needed
    setCommercialInfo({
      id: updatedData.id,
      name: updatedData.name
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </motion.div>
      </div>
    );
  }

  // Not authenticated - show login modal
  if (!isAuthenticated) {
    console.log('🔐 Rendering login modal');
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
        <CommercialLoginModal
          isOpen={true}
          onAuthenticated={handleAuthenticated}
          onClose={() => navigate(-1)}
        />
      </div>
    );
  }

  // Authenticated - show main content
  console.log('✅ Rendering main authenticated content');
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {commercialInfo && (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {commercialInfo.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {commercialInfo.id}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
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
          className="text-center"
        >
          <div className="inline-flex items-center space-x-3 bg-white rounded-full px-6 py-3 shadow-lg mb-8">
            <span className="text-3xl">📈</span>
            <span className="text-lg font-semibold text-gray-700">Espace Commercial</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Bienvenue {commercialInfo?.name}
            <span className="block bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              dans votre Espace Commercial
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Gérez vos ventes, suivez vos commissions et accédez à tous vos outils commerciaux.
          </p>

          {commercialData ? (
            <div className="max-w-6xl mx-auto">
              {/* Level Badge */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full text-white font-semibold ${
                  getLevelInfo(commercialData.points).color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                  getLevelInfo(commercialData.points).color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  getLevelInfo(commercialData.points).color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  'bg-gradient-to-r from-orange-500 to-orange-600'
                }`}>
                  <Award className="w-5 h-5" />
                  <span>Niveau {getLevelInfo(commercialData.points).level} - {getLevelInfo(commercialData.points).name}</span>
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                    {commercialData.points} points
                  </span>
                </div>
                {getLevelInfo(commercialData.points).nextLevel && (
                  <p className="text-gray-600 mt-2">
                    {getLevelInfo(commercialData.points).pointsToNext} points pour atteindre le niveau {getLevelInfo(commercialData.points).nextLevel}
                  </p>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Points</p>
                      <p className="text-2xl font-bold text-gray-900">{commercialData.points}</p>
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
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Commission</p>
                      <p className="text-2xl font-bold text-gray-900">{commercialData.commission}€</p>
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
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ventes</p>
                      <p className="text-2xl font-bold text-gray-900">{commercialData.salesCount}</p>
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
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Niveau</p>
                      <p className="text-2xl font-bold text-gray-900">{commercialData.level}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Recent Sales */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-lg p-6 mb-8"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventes Récentes</h3>
                <div className="space-y-4">
                  {commercialData.sales.slice(0, 3).map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{sale.client}</p>
                        <p className="text-sm text-gray-600">{sale.program}</p>
                        <p className="text-xs text-gray-500">{sale.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{sale.amount}€</p>
                        <p className="text-sm text-green-600">+{sale.commission}€ commission</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          sale.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          sale.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {sale.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Commercial Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <CommercialDashboard 
                  commercialData={commercialData}
                  onDataUpdate={handleDataUpdate}
                />
              </motion.div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚧</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Chargement des données...
                </h3>
                <p className="text-gray-600">
                  Veuillez patienter pendant le chargement de vos informations commerciales.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EspaceCommercialPage;
