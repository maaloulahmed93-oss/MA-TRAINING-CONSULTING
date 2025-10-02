import React, { useState, useEffect } from 'react';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import CommercialNewDashboard from '../components/commercial/CommercialNewDashboard-simple';
import { commercialNewApiService, CommercialNewData } from '../services/commercialNewApiService-simple';

const EspaceCommercialNewPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [commercialData, setCommercialData] = useState<CommercialNewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [loginForm, setLoginForm] = useState({
    partnerId: ''
  });

  useEffect(() => {
    const session = commercialNewApiService.getSession();
    if (session && commercialNewApiService.isSessionValid()) {
      setIsAuthenticated(true);
      setCommercialData(session);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await commercialNewApiService.login(loginForm.partnerId);
      
      if (result.success) {
        setIsAuthenticated(true);
        setCommercialData(result.data);
        commercialNewApiService.saveSession(result.data);
      } else {
        setError(result.message || 'Erreur de connexion');
      }
    } catch (error) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    commercialNewApiService.logout();
    setIsAuthenticated(false);
    setCommercialData(null);
    setLoginForm({ partnerId: '' });
  };

  const handleDataUpdate = (newData: CommercialNewData) => {
    setCommercialData(newData);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Espace Commercial
            </h1>
            <p className="text-gray-600">
              Système 3 niveaux : Apprenti → Confirmé → Partenaire
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Commercial
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginForm.partnerId}
                  onChange={(e) => setLoginForm({ ...loginForm, partnerId: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="COMM-123456"
                  required
                />
                <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-4" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Connexion...' : 'Se Connecter'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © 2025 MA Training & Consulting
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!commercialData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Espace Commercial
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {commercialData.fullName}
                </p>
                <p className="text-xs text-gray-500">
                  {commercialData.partnerId}
                </p>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CommercialNewDashboard
          commercialData={commercialData}
          onDataUpdate={handleDataUpdate}
        />
      </div>
    </div>
  );
};

export default EspaceCommercialNewPage;
