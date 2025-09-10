import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { authenticateTrainer, getDemoIds } from '../../services/trainerAuth';

interface TrainerLoginModalProps {
  onAuthenticated: () => void;
}

const TrainerLoginModal = ({ onAuthenticated }: TrainerLoginModalProps) => {
  const [trainerId, setTrainerId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemoIds, setShowDemoIds] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // Simulation d'une vérification asynchrone
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = authenticateTrainer(trainerId);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onAuthenticated();
      }, 1000);
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  const demoIds = getDemoIds();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop avec blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 15 }}
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            Accès Sécurisé Formateur
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600"
          >
            Veuillez saisir votre ID de formateur pour accéder au dashboard
          </motion.p>
        </div>

        {/* Formulaire */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Champ ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Formateur
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={trainerId}
                onChange={(e) => setTrainerId(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center font-mono text-lg tracking-wider"
                placeholder="FORM123"
                required
                disabled={isLoading || success}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Messages d'erreur/succès */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-green-700 text-sm">Authentification réussie ! Redirection...</span>
            </motion.div>
          )}

          {/* Bouton de vérification */}
          <motion.button
            type="submit"
            disabled={isLoading || success}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
              isLoading || success
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Vérification...</span>
              </div>
            ) : success ? (
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Authentifié !</span>
              </div>
            ) : (
              'Vérifier'
            )}
          </motion.button>
        </motion.form>

        {/* IDs de démonstration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 pt-6 border-t border-gray-200"
        >
          <button
            type="button"
            onClick={() => setShowDemoIds(!showDemoIds)}
            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mx-auto"
          >
            {showDemoIds ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showDemoIds ? 'Masquer' : 'Voir'} les IDs de démonstration</span>
          </button>
          
          {showDemoIds && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-3 p-3 bg-blue-50 rounded-lg"
            >
              <p className="text-xs text-blue-600 mb-2 font-medium">IDs de test disponibles :</p>
              <div className="grid grid-cols-2 gap-2">
                {demoIds.map((id) => (
                  <button
                    key={id}
                    onClick={() => setTrainerId(id)}
                    className="text-xs font-mono bg-white border border-blue-200 rounded px-2 py-1 hover:bg-blue-100 transition-colors"
                  >
                    {id}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Note de sécurité */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-4 p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-start space-x-2">
            <Shield className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-600">
              Votre session sera automatiquement sauvegardée et expirera après 24 heures d'inactivité.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TrainerLoginModal;
