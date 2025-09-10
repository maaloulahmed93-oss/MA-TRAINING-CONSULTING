import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff,
  Building2
} from 'lucide-react';
import { authenticatePartner } from '../../services/partnershipAuth';

interface PartnershipLoginModalProps {
  isOpen: boolean;
  onAuthenticated: (partnerId: string) => void;
}

const PartnershipLoginModal: React.FC<PartnershipLoginModalProps> = ({
  isOpen,
  onAuthenticated
}) => {
  const [partnerId, setPartnerId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDemoIds, setShowDemoIds] = useState(false);

  const demoIds = ['PARTNER123', 'ENTREPRISE456'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!partnerId.trim()) {
      setError('Veuillez saisir un ID de partenaire');
      return;
    }

    if (partnerId.length < 4) {
      setError('L\'ID doit contenir au moins 4 caractères');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const isValid = await authenticatePartner(partnerId);
      
      if (isValid) {
        setSuccess('Authentification réussie !');
        setTimeout(() => {
          onAuthenticated(partnerId);
        }, 1000);
      } else {
        setError('ID de partenaire invalide');
      }
    } catch (_err) {
      setError('Erreur lors de l\'authentification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoIdClick = (demoId: string) => {
    setPartnerId(demoId);
    setError('');
    setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Building2 className="w-8 h-8 text-white" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Accès Sécurisé Partenariat
          </h2>
          <p className="text-gray-600">
            Connectez-vous avec votre ID de partenaire
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="partnerId" className="block text-sm font-medium text-gray-700 mb-2">
              ID de Partenaire
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="partnerId"
                type="text"
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value.toUpperCase())}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Saisissez votre ID"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <User className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Vérification...</span>
              </div>
            ) : (
              'Vérifier'
            )}
          </button>
        </form>

        {/* Demo IDs Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setShowDemoIds(!showDemoIds)}
            className="flex items-center justify-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 w-full"
          >
            {showDemoIds ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showDemoIds ? 'Masquer' : 'Voir'} les IDs de démonstration</span>
          </button>
          
          {showDemoIds && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              <p className="text-xs text-gray-500 text-center mb-3">
                IDs de test disponibles :
              </p>
              <div className="grid grid-cols-1 gap-2">
                {demoIds.map((demoId) => (
                  <button
                    key={demoId}
                    onClick={() => handleDemoIdClick(demoId)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition-colors duration-200 font-mono"
                  >
                    {demoId}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Session sécurisée - Expiration automatique après 24h
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PartnershipLoginModal;
