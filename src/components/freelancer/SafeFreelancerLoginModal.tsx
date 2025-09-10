import React, { useState } from 'react';
import * as freelancerAuthService from '../../services/freelancerAuth';

interface SafeFreelancerLoginModalProps {
  onAuthenticated: (freelancerId: string) => void;
}

const SafeFreelancerLoginModal: React.FC<SafeFreelancerLoginModalProps> = ({ onAuthenticated }) => {
  const [freelancerId, setFreelancerId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDemoIds, setShowDemoIds] = useState(false);

  const demoIds = [
    'FREEL123',
    'FREEL456', 
    'FREELANCER789',
    'DEMO-FREELANCER'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!freelancerId.trim()) {
      setError('Veuillez saisir un ID de freelancer');
      return;
    }

    if (freelancerId.length < 4) {
      setError('L\'ID doit contenir au moins 4 caractères');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate authentication process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to authenticate using the service if available
      let isAuthenticated = false;
      
      try {
        isAuthenticated = await freelancerAuthService.authenticateFreelancer(freelancerId);
      } catch (serviceError) {
        console.error('❌ Authentication service error:', serviceError);
        // Fallback: accept demo IDs
        isAuthenticated = demoIds.includes(freelancerId.toUpperCase());
      }
      
      if (isAuthenticated) {
        setSuccess('Connexion réussie !');
        setTimeout(() => {
          onAuthenticated(freelancerId);
        }, 500);
      } else {
        setError('ID de freelancer invalide');
      }
      
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoIdClick = (id: string) => {
    setFreelancerId(id);
    setError('');
    setSuccess('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white">🔐</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Accès Sécurisé Freelancer</h2>
          <p className="text-gray-600 mt-2">Entrez votre ID pour accéder à votre espace</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="freelancerId" className="block text-sm font-medium text-gray-700 mb-2">
              ID Freelancer
            </label>
            <div className="relative">
              <input
                type="text"
                id="freelancerId"
                value={freelancerId}
                onChange={(e) => setFreelancerId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Entrez votre ID freelancer"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="text-gray-400">👤</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-800">
                <span>⚠️</span>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-800">
                <span>✅</span>
                <span className="text-sm font-medium">{success}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Vérification...</span>
              </div>
            ) : (
              'Se Connecter'
            )}
          </button>
        </form>

        {/* Demo IDs Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setShowDemoIds(!showDemoIds)}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            {showDemoIds ? '🔼' : '🔽'} IDs de démonstration
          </button>
          
          {showDemoIds && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-500">Cliquez sur un ID pour le tester :</p>
              <div className="grid grid-cols-2 gap-2">
                {demoIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleDemoIdClick(id)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            🔒 Votre session expirera automatiquement après 24 heures d'inactivité.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SafeFreelancerLoginModal;
