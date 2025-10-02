import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, User, Mail, AlertCircle } from 'lucide-react';

interface FormateurLoginFormProps {
  onLogin: (formateurId: string, email: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

const FormateurLoginForm: React.FC<FormateurLoginFormProps> = ({
  onLogin,
  isLoading = false,
  error
}) => {
  const [formateurId, setFormateurId] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formateurId.trim() || !email.trim()) return;
    
    await onLogin(formateurId.trim(), email.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Espace Formateur</h2>
          <p className="text-gray-600">Connectez-vous avec votre ID formateur</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Formateur ID */}
          <div>
            <label htmlFor="formateurId" className="block text-sm font-medium text-gray-700 mb-2">
              ID Formateur
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="formateurId"
                value={formateurId}
                onChange={(e) => setFormateurId(e.target.value.toUpperCase())}
                placeholder="FOR-123456"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
                disabled={isLoading}
                pattern="^FOR-[0-9]{6}$"
                title="Format: FOR-123456"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Format: FOR-123456</p>
          </div>

          {/* Email du compte */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email du compte
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Entrez l'email associé à votre compte formateur
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !formateurId.trim() || !email.trim()}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connexion en cours...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Se connecter</span>
              </>
            )}
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Votre ID formateur vous a été fourni lors de votre inscription.
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Contactez l'administration si vous avez oublié votre ID.
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default FormateurLoginForm;
