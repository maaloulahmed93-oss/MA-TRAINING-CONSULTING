import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Building2,
  Mail
} from 'lucide-react';
import { savePartnershipSession } from '../../services/partnershipAuth';

interface PartnershipLoginModalProps {
  isOpen: boolean;
  onAuthenticated: (partnerId: string) => void;
}

const PartnershipLoginModal: React.FC<PartnershipLoginModalProps> = ({
  isOpen,
  onAuthenticated
}) => {
  const [partnerId, setPartnerId] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!partnerId.trim()) {
      setError('Veuillez saisir un ID de partenaire');
      return;
    }

    if (!email.trim()) {
      setError('Veuillez saisir votre email');
      return;
    }

    if (partnerId.length < 4) {
      setError('L\'ID doit contenir au moins 4 caractères');
      return;
    }

    // Validation email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format d\'email invalide');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Appel API avec email et ID
      const response = await fetch('https://matc-backend.onrender.com/api/partners/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId: partnerId.toUpperCase(),
          email: email.trim(),
          partnerType: 'entreprise'
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('Authentification réussie !');
        
        // Sauvegarder la session localement
        savePartnershipSession(partnerId);
        
        setTimeout(() => {
          onAuthenticated(partnerId);
        }, 1000);
      } else {
        setError(data.message || 'ID de partenaire ou email invalide');
      }
    } catch (_err) {
      setError('Erreur lors de l\'authentification');
    } finally {
      setIsLoading(false);
    }
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
            Connectez-vous avec votre ID de partenaire et email
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
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <User className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email du compte *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="votre.email@exemple.com"
                disabled={isLoading}
                required
              />
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
