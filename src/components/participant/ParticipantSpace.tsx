import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User } from 'lucide-react';
import ParticipantLogin from './ParticipantLogin';
import ParticipantDashboard from './ParticipantDashboard';
import MesFormations from './MesFormations';
import Projets from './Projets';
import Coaching from './Coaching';
import Notifications from './Notifications';
import { mockParticipants } from '../../data/participantData';

type PageType = 'login' | 'dashboard' | 'formations' | 'projects' | 'coaching' | 'notifications';

const ParticipantSpace = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('login');
  const [participantId, setParticipantId] = useState<string>('');

  const handleLogin = (id: string) => {
    setParticipantId(id);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setParticipantId('');
    setCurrentPage('login');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
  };

  const participant = mockParticipants[participantId];

  // Page de connexion
  if (currentPage === 'login') {
    return <ParticipantLogin onLogin={handleLogin} />;
  }

  // Interface principale avec navigation
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-sm border-b sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MT</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">MA Training Consulting</h1>
                <p className="text-xs text-gray-500">Espace Participant</p>
              </div>
            </div>

            {/* User Info and Logout */}
            {participant && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  {participant.avatar && (
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  )}
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                    <p className="text-xs text-gray-500">{participant.email}</p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Déconnexion</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Page Content */}
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {currentPage === 'dashboard' && (
          <ParticipantDashboard 
            participantId={participantId} 
            onNavigate={handleNavigate} 
          />
        )}
        {currentPage === 'formations' && (
          <MesFormations 
            participantId={participantId} 
            onNavigate={handleNavigate} 
          />
        )}
        {currentPage === 'projects' && (
          <Projets 
            participantId={participantId} 
            onNavigate={handleNavigate} 
          />
        )}
        {currentPage === 'coaching' && (
          <Coaching 
            participantId={participantId} 
            onNavigate={handleNavigate} 
          />
        )}
        {currentPage === 'notifications' && (
          <Notifications 
            participantId={participantId} 
            onNavigate={handleNavigate} 
          />
        )}
      </motion.div>

      {/* Floating Navigation (Mobile) */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed bottom-4 left-4 right-4 md:hidden z-50"
      >
        <div className="bg-white rounded-2xl shadow-lg border p-2">
          <div className="flex items-center justify-around">
            <button
              onClick={() => handleNavigate('dashboard')}
              className={`p-3 rounded-xl transition-colors ${
                currentPage === 'dashboard' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleNavigate('formations')}
              className={`p-3 rounded-xl transition-colors ${
                currentPage === 'formations' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📚
            </button>
            <button
              onClick={() => handleNavigate('projects')}
              className={`p-3 rounded-xl transition-colors ${
                currentPage === 'projects' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📁
            </button>
            <button
              onClick={() => handleNavigate('coaching')}
              className={`p-3 rounded-xl transition-colors ${
                currentPage === 'coaching' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              💬
            </button>
            <button
              onClick={() => handleNavigate('notifications')}
              className={`p-3 rounded-xl transition-colors relative ${
                currentPage === 'notifications' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🔔
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ParticipantSpace;
