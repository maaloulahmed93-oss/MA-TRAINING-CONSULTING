import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle,
  ArrowLeft,
  Filter,
  Trash2,
  ExternalLink,
  Briefcase,
  Phone,
  Mail
} from 'lucide-react';
import { mockNotifications } from '../../data/participantData';
import { Notification as AppNotification } from '../../types/participant';

interface NotificationsProps {
  participantId?: string;
  onNavigate: (page: string) => void;
}

const Notifications = ({ onNavigate }: NotificationsProps) => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Système de notifications automatiques
  useEffect(() => {
    const generateRandomJobNotification = (): AppNotification => {
      const companies = ['TechStart', 'InnovCorp', 'DigitalPro', 'WebSolutions', 'DataTech', 'CloudSoft'];
      const positions = ['Développeur Full Stack', 'Chef de Projet', 'Data Analyst', 'UX Designer', 'DevOps Engineer', 'Product Manager'];
      const salaries = ['35K-45K MAD', '40K-55K MAD', '30K-40K MAD', '45K-60K MAD', '50K-65K MAD'];
      const contracts = ['CDI', 'CDD', 'Freelance', 'Stage'];
      
      const company = companies[Math.floor(Math.random() * companies.length)];
      const position = positions[Math.floor(Math.random() * positions.length)];
      const salary = salaries[Math.floor(Math.random() * salaries.length)];
      const contract = contracts[Math.floor(Math.random() * contracts.length)];
      
      return {
        id: `NOTIF-AUTO-${Date.now()}`,
        title: `Nouvelle offre - ${position}`,
        message: `${company} recherche un(e) ${position}. ${contract}, salaire: ${salary}. Veuillez contacter notre équipe d'organisation si vous êtes intéressé.`,
        type: 'job',
        date: new Date().toISOString().split('T')[0],
        isRead: false,
        actionUrl: 'contact-team',
        company,
        position,
        salary,
        contract
      };
    };

    // Générer une nouvelle notification d'emploi toutes les 30 secondes (pour la démo)
    const interval = setInterval(() => {
      const newNotification = generateRandomJobNotification();
      setNotifications(prev => [newNotification, ...prev]);
      
      // Afficher une notification toast
      setToastMessage(`Nouvelle offre: ${newNotification.position} chez ${newNotification.company}`);
      setShowToast(true);
      
      // Masquer le toast après 5 secondes
      setTimeout(() => setShowToast(false), 5000);
      
      console.log('Nouvelle offre d\'emploi reçue:', newNotification.title);
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      case 'job': return Briefcase;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'job': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-white border-gray-200';
    
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'job': return 'bg-purple-50 border-purple-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.isRead;
      case 'read': return notification.isRead;
      default: return true;
    }
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const contactTeam = (notification: AppNotification) => {
    // Marquer comme lu automatiquement
    markAsRead(notification.id);
    
    // Simuler l'ouverture d'un modal de contact ou redirection
    const message = `Bonjour,\n\nJe suis intéressé(e) par l'offre d'emploi "${notification.position}" chez ${notification.company}.\n\nPouvez-vous me donner plus d'informations ?\n\nCordialement`;
    
    // Simuler l'envoi d'email ou ouverture d'un modal
    alert(`Message préparé pour l'équipe d'organisation:\n\n${message}`);
    
    console.log('Contact team for job:', notification.position, 'at', notification.company);
  };

  const handleNotificationAction = (notification: AppNotification) => {
    if (notification.type === 'job' && notification.actionUrl === 'contact-team') {
      contactTeam(notification);
    } else if (notification.actionUrl && notification.actionUrl.startsWith('/')) {
      // Navigation vers une page interne
      onNavigate(notification.actionUrl.substring(1));
      markAsRead(notification.id);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-gray-600">Restez informé de vos activités</p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={markAllAsRead}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Tout marquer comme lu</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats and Filter */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
                <div className="text-sm text-gray-600">Non lues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {notifications.length - unreadCount}
                </div>
                <div className="text-sm text-gray-600">Lues</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Toutes les notifications</option>
                <option value="unread">Non lues</option>
                <option value="read">Lues</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-12 shadow-sm border text-center"
            >
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'unread' ? 'Aucune notification non lue' : 
                 filter === 'read' ? 'Aucune notification lue' : 
                 'Aucune notification'}
              </h3>
              <p className="text-gray-600">
                {filter === 'all' ? 
                  'Vous recevrez ici toutes vos notifications importantes.' :
                  'Changez le filtre pour voir d\'autres notifications.'
                }
              </p>
            </motion.div>
          ) : (
            filteredNotifications.map((notification, index) => {
              const NotificationIcon = getNotificationIcon(notification.type);
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`border rounded-xl p-6 hover:shadow-md transition-all duration-200 ${
                    getNotificationBgColor(notification.type, notification.isRead)
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      getNotificationColor(notification.type)
                    }`}>
                      <NotificationIcon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`text-lg font-semibold ${
                              notification.isRead ? 'text-gray-700' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className={`text-sm mb-3 ${
                            notification.isRead ? 'text-gray-500' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          
                          {/* Job-specific details */}
                          {notification.type === 'job' && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="font-medium text-purple-700">Entreprise:</span>
                                  <span className="ml-1 text-purple-600">{notification.company}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-purple-700">Poste:</span>
                                  <span className="ml-1 text-purple-600">{notification.position}</span>
                                </div>
                                {notification.salary && (
                                  <div>
                                    <span className="font-medium text-purple-700">Salaire:</span>
                                    <span className="ml-1 text-purple-600">{notification.salary}</span>
                                  </div>
                                )}
                                {notification.contract && (
                                  <div>
                                    <span className="font-medium text-purple-700">Contrat:</span>
                                    <span className="ml-1 text-purple-600">{notification.contract}</span>
                                  </div>
                                )}
                                {notification.environment && (
                                  <div>
                                    <span className="font-medium text-purple-700">Environnement:</span>
                                    <span className="ml-1 text-purple-600">{notification.environment}</span>
                                  </div>
                                )}
                                {notification.benefits && (
                                  <div>
                                    <span className="font-medium text-purple-700">Avantages:</span>
                                    <span className="ml-1 text-purple-600">{notification.benefits}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>
                              {new Date(notification.date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="capitalize">
                              {notification.type === 'job' ? 'Offre d\'emploi' : notification.type}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {notification.actionUrl && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleNotificationAction(notification)}
                              className={`p-2 hover:bg-opacity-20 rounded-lg transition-colors ${
                                notification.type === 'job' 
                                  ? 'text-purple-600 hover:bg-purple-100' 
                                  : 'text-blue-600 hover:bg-blue-100'
                              }`}
                              title={notification.type === 'job' ? 'Contacter l\'équipe' : 'Voir plus'}
                            >
                              {notification.type === 'job' ? (
                                <Phone className="w-4 h-4" />
                              ) : (
                                <ExternalLink className="w-4 h-4" />
                              )}
                            </motion.button>
                          )}
                          
                          {!notification.isRead && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Marquer comme lu"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </motion.button>
                          )}
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                      
                      {notification.actionUrl && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleNotificationAction(notification)}
                          className={`mt-3 inline-flex items-center space-x-2 font-medium text-sm transition-colors ${
                            notification.type === 'job'
                              ? 'text-purple-600 hover:text-purple-700 bg-purple-100 hover:bg-purple-200 px-4 py-2 rounded-lg'
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          {notification.type === 'job' ? (
                            <>
                              <Mail className="w-4 h-4" />
                              <span>Contacter l'équipe d'organisation</span>
                            </>
                          ) : (
                            <>
                              <span>Voir les détails</span>
                              <ExternalLink className="w-4 h-4" />
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        {filteredNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8 bg-white rounded-xl p-6 shadow-sm border"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div className="flex flex-wrap gap-3">
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={markAllAsRead}
                  className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Marquer tout comme lu</span>
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter('unread')}
                className="flex items-center space-x-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-medium hover:bg-orange-200 transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span>Voir les non lues</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2"
        >
          <Briefcase className="w-5 h-5" />
          <span className="font-medium">{toastMessage}</span>
          <button
            onClick={() => setShowToast(false)}
            className="ml-2 text-purple-200 hover:text-white"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Notifications;
