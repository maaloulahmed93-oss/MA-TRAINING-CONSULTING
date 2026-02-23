import React, { useState } from 'react';

interface DemoExpiredProps {
  storageKey?: string;
  onUnlock?: () => void;
}

const UNLOCK_CODE = 'matc@44172284';

const DemoExpired: React.FC<DemoExpiredProps> = ({ 
  storageKey = 'admin_demo_start_time',
  onUnlock 
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUnlock = () => {
    if (code === UNLOCK_CODE) {
      // Réinitialiser le timer
      localStorage.removeItem(storageKey);
      const newTime = Date.now().toString();
      localStorage.setItem(storageKey, newTime);
      
      setSuccess(true);
      setError(false);
      
      // Appeler le callback si fourni
      onUnlock?.();
      
      // Recharger la page après 1 seconde
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setError(true);
      setSuccess(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Icône */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        {/* Titre */}
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Démonstration Admin Terminée
        </h2>
        
        {/* Message */}
        <p className="text-slate-600 mb-6 leading-relaxed">
          La période d'essai de 45 minutes pour l'admin panel est terminée. Ce projet est disponible à la vente.
        </p>
        
        {/* Section Déblocage par Code */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800 mb-3 font-semibold">
            🔓 Vous avez un code de déblocage ?
          </p>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(false);
              }}
              onKeyPress={handleKeyPress}
              placeholder="Entrez le code..."
              className="flex-1 px-4 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={handleUnlock}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Débloquer
            </button>
          </div>
          
          {/* Messages d'erreur/succès */}
          {error && (
            <p className="text-red-600 text-xs mt-2">
              ❌ Code incorrect. Veuillez réessayer.
            </p>
          )}
          {success && (
            <p className="text-green-600 text-xs mt-2">
              ✅ Code correct ! Redémarrage...
            </p>
          )}
        </div>
        
        {/* Badge VENTE */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold text-lg mb-6">
          🔥 PROJET À VENDRE 🔥
        </div>
        
        {/* Contact */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-slate-500 mb-2">Contactez-nous pour acheter</p>
          <a 
            href="mailto:contact@ma-training-consulting.com" 
            className="text-blue-600 font-semibold hover:underline block mb-1"
          >
            contact@ma-training-consulting.com
          </a>
          <p className="text-slate-700 font-bold text-lg">
            ou appelez : +216 XX XXX XXX
          </p>
        </div>
        
        {/* Note */}
        <p className="text-xs text-slate-400">
          Rafraîchir la page ne réactivera pas la démo sans code.
        </p>
      </div>
    </div>
  );
};

export default DemoExpired;
