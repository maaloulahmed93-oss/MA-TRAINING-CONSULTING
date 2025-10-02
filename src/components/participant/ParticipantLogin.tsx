import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, User, AlertCircle } from 'lucide-react';
import { validAccessIds, mockParticipants } from '../../data/participantData';

interface ParticipantLoginProps {
  onLogin: (participantId: string) => void;
}

const ParticipantLogin = ({ onLogin }: ParticipantLoginProps) => {
  const [accessId, setAccessId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Try to authenticate with backend API first
      const response = await fetch(`http://localhost:3001/api/participants/${accessId}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId: accessId })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          onLogin(accessId);
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      console.warn('API authentication failed, trying fallback:', error);
    }

    // Fallback to mock data validation
    await new Promise(resolve => setTimeout(resolve, 500));

    if (validAccessIds.includes(accessId)) {
      onLogin(accessId);
    } else {
      setError('ID d\'accès invalide. Veuillez vérifier votre identifiant.');
    }
    
    setIsLoading(false);
  };

  const getParticipantName = (id: string) => {
    return mockParticipants[id]?.name || 'Participant';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full -translate-y-16 translate-x-16 opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-300 to-blue-500 rounded-full translate-y-12 -translate-x-12 opacity-10"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <User className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Espace Participant</h1>
            <p className="text-gray-600">Accédez à vos formations</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="accessId" className="block text-sm font-medium text-gray-700 mb-2">
                ID d'accès
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="accessId"
                  value={accessId}
                  onChange={(e) => setAccessId(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                    error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  placeholder="Entrez votre ID d'accès"
                  required
                />
                <LogIn className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg shake-error"
              >
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Vérification...</span>
                </div>
              ) : (
                'Accéder'
              )}
            </motion.button>
          </form>

          {/* Demo IDs */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">IDs de démonstration :</h3>
            <div className="space-y-1">
              {validAccessIds.slice(0, 3).map((id) => (
                <button
                  key={id}
                  onClick={() => setAccessId(id)}
                  className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                >
                  {id} - {getParticipantName(id)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ParticipantLogin;
