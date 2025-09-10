import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

interface CommercialLoginModalProps {
  isOpen: boolean;
  onAuthenticated: (commercialId: string) => void;
}

const CommercialLoginModal: React.FC<CommercialLoginModalProps> = ({
  isOpen,
  onAuthenticated,
}) => {
  const [commercialId, setCommercialId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDemoIds, setShowDemoIds] = useState(false);

  // Valid commercial IDs (in production, this would be handled by backend)
  const validIds = [
    "COMM123",
    "COMM456",
    "COMMERCIAL789",
    "AFFILIATE2024",
    "DEMO-COMM",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commercialId.trim()) {
      setError("Veuillez saisir un ID commercial");
      return;
    }

    if (commercialId.length < 4) {
      setError("L'ID doit contenir au moins 4 caractères");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate API call
    setTimeout(() => {
      const isValidId = validIds.includes(commercialId.toUpperCase());

      if (isValidId) {
        // Store in localStorage
        localStorage.setItem(
          "commercialSession",
          JSON.stringify({
            commercialId: commercialId.toUpperCase(),
            timestamp: Date.now(),
            isValid: true,
          })
        );

        onAuthenticated(commercialId.toUpperCase());
      } else {
        setError("ID commercial invalide");
        // Add shake animation class
        const modal = document.querySelector(".commercial-login-modal");
        if (modal) {
          modal.classList.add("shake-error");
          setTimeout(() => modal.classList.remove("shake-error"), 500);
        }
      }

      setIsLoading(false);
    }, 1500);
  };

  const handleDemoIdClick = (id: string) => {
    setCommercialId(id);
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="commercial-login-modal bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">Accès Sécurisé Commercial</h2>
          </div>
          <p className="text-orange-100 text-sm">
            Veuillez vous identifier pour accéder à votre espace commercial
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Commercial
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={commercialId}
                  onChange={(e) => {
                    setCommercialId(e.target.value);
                    setError("");
                  }}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  placeholder="Entrez votre ID commercial"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Vérification...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Vérifier</span>
                </div>
              )}
            </button>
          </form>

          {/* Demo IDs Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowDemoIds(!showDemoIds)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
            >
              {showDemoIds ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span>
                {showDemoIds ? "Masquer" : "Voir"} les IDs de démonstration
              </span>
            </button>

            {showDemoIds && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2"
              >
                <p className="text-xs text-gray-500 mb-2">
                  IDs de test disponibles :
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {validIds.map((id) => (
                    <button
                      key={id}
                      onClick={() => handleDemoIdClick(id)}
                      className="text-xs bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 px-2 py-1 rounded transition-colors"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Security Note */}
          <div className="mt-4 p-3 bg-orange-50 rounded-lg">
            <p className="text-xs text-orange-700">
              <Lock className="w-3 h-3 inline mr-1" />
              Votre session expire automatiquement après 24h d'inactivité
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CommercialLoginModal;
