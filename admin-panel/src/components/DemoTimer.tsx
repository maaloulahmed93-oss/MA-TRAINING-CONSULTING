import React, { useEffect, useState } from 'react';

interface DemoTimerProps {
  durationMinutes?: number;
  onExpire?: () => void;
}

const DemoTimer: React.FC<DemoTimerProps> = ({ 
  durationMinutes = 45, 
  onExpire 
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const STORAGE_KEY = 'admin_demo_start_time';
    
    // Récupérer ou initialiser le timestamp (différent du frontend)
    let startTime = localStorage.getItem(STORAGE_KEY);
    
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem(STORAGE_KEY, startTime);
    }
    
    const startTimestamp = parseInt(startTime, 10);
    const durationMs = durationMinutes * 60 * 1000;
    const endTime = startTimestamp + durationMs;
    
    const updateTimer = () => {
      const now = Date.now();
      const remaining = endTime - now;
      
      if (remaining <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
        setShowWarning(false);
        localStorage.removeItem(STORAGE_KEY);
        onExpire?.();
        return;
      }
      
      setTimeLeft(remaining);
      
      // Afficher l'avertissement quand il reste 5 minutes
      if (remaining <= 5 * 60 * 1000) {
        setShowWarning(true);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [durationMinutes, onExpire]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Si expiré, ne rien afficher (le composant parent gère le blocage)
  if (isExpired) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Badge DÉMO */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-lg shadow-lg border-2 border-amber-300 animate-pulse">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-bold text-sm">DÉMO ADMIN - À VENDRE</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
      
      {/* Avertissement 5 min avant */}
      {showWarning && (
        <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold animate-bounce">
          ⚠️ Plus que {formatTime(timeLeft)} !
        </div>
      )}
    </div>
  );
};

export default DemoTimer;
