import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { authenticateFreelancer } from '../../services/freelancerAuth';

interface FreelancerLoginModalProps {
  onAuthenticated: () => void;
}

const FreelancerLoginModal: React.FC<FreelancerLoginModalProps> = ({ onAuthenticated }) => {
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
      // Simulation d'une vérification API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isAuthenticated = await authenticateFreelancer(freelancerId);
      
      if (isAuthenticated) {
        setSuccess('Connexion réussie !');
        setTimeout(() => {
          onAuthenticated();
        }, 500);
      } else {
        setError('ID de freelancer invalide');
      }
    } catch {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Lock className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Accès Sécurisé Freelancer
          </h2>
          <p className="text-gray-600">
            Connectez-vous avec votre ID de freelancer
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="freelancerId" className="block text-sm font-medium text-gray-700 mb-2">
              ID Freelancer
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="freelancerId"
                value={freelancerId}
                onChange={(e) => setFreelancerId(e.target.value.toUpperCase())}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="Saisissez votre ID"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Messages d'erreur et de succès */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}
            
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg"
              >
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bouton de connexion */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Vérification...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* IDs de démonstration */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setShowDemoIds(!showDemoIds)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors mx-auto"
          >
            {showDemoIds ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showDemoIds ? 'Masquer' : 'Voir'} les IDs de démonstration
          </button>
          
          <AnimatePresence>
            {showDemoIds && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-2"
              >
                <p className="text-xs text-gray-500 text-center mb-3">
                  Cliquez sur un ID pour l'utiliser :
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {demoIds.map((id) => (
                    <button
                      key={id}
                      onClick={() => handleDemoIdClick(id)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors font-mono"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Note de sécurité */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Votre session expirera automatiquement après 24h d'inactivité
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default FreelancerLoginModal;
