import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, X, ExternalLink, Clock, Calendar, FileText, ArrowLeft } from 'lucide-react';
import { participantApiService } from '../../services/participantApiService';

interface Notification {
  id: string;
  title?: string;
  message: string;
  type: 'information';
  date: string;
  isRead: boolean;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high';
  
  // Simple fields
  description?: string;
  contact?: string;
}

interface NotificationsProps {
  participantId: string;
  onNavigate: (page: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ participantId, onNavigate }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadNotifications();
  }, [participantId]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // First try to get notifications from the dedicated API endpoint
      const apiNotifications = await participantApiService.getNotifications(participantId);
      
      if (apiNotifications && apiNotifications.length > 0) {
        // Convert API notifications to our format
        const convertedNotifications = apiNotifications.map(apiNotif => ({
          id: apiNotif._id || apiNotif.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: apiNotif.title || 'Notification',
          message: apiNotif.message || apiNotif.description || 'Message de notification',
          type: 'information' as 'information',
          date: apiNotif.date || new Date().toISOString(),
          isRead: apiNotif.isRead || false,
          description: apiNotif.description,
          contact: apiNotif.contact,
          actionUrl: apiNotif.actionUrl,
          priority: 'medium' as 'low' | 'medium' | 'high'
        }));
        
        // Sort notifications by date (newest first)
        const sortedNotifications = convertedNotifications.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setNotifications(sortedNotifications);
        console.log(`✅ Loaded ${sortedNotifications.length} notifications from API`);
      } else {
        // Fallback: try to get from participant data
        const participant = await participantApiService.getParticipant(participantId);
        if (participant && participant.notifications && participant.notifications.length > 0) {
          // Sort notifications by date (newest first)
          const sortedNotifications = participant.notifications.sort((a: Notification, b: Notification) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setNotifications(sortedNotifications);
          console.log(`✅ Loaded ${sortedNotifications.length} notifications from participant data`);
        } else {
          // No notifications found, show empty state
          setNotifications([]);
          console.log('ℹ️ No notifications found for participant');
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Update on backend
      const participant = await participantApiService.getParticipant(participantId);
      if (participant) {
        const updatedNotifications = participant.notifications?.map((n: Notification) => 
          n.id === notificationId ? { ...n, isRead: true } : n
        );
        
        // Update participant with new notification status
        await participantApiService.updateParticipant(participantId, {
          ...participant,
          notifications: updatedNotifications
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );

      // Update on backend
      const participant = await participantApiService.getParticipant(participantId);
      if (participant) {
        const updatedNotifications = participant.notifications?.map((n: Notification) => ({ ...n, isRead: true }));
        
        await participantApiService.updateParticipant(participantId, {
          ...participant,
          notifications: updatedNotifications
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      // Update on backend
      const participant = await participantApiService.getParticipant(participantId);
      if (participant) {
        const updatedNotifications = participant.notifications?.filter((n: Notification) => n.id !== notificationId);
        
        await participantApiService.updateParticipant(participantId, {
          ...participant,
          notifications: updatedNotifications
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  const getNotificationIcon = () => {
    return <FileText className="w-5 h-5 text-blue-500" />;
  };


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'read':
        return notification.isRead;
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Chargement des notifications...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          {/* Bouton Retour */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bell className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 
                    ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                    : 'Toutes les notifications sont lues'
                  }
                </p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'Toutes', count: notifications.length },
              { key: 'unread', label: 'Non lues', count: unreadCount },
              { key: 'read', label: 'Lues', count: notifications.length - unreadCount }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-sm p-8 text-center"
            >
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' 
                  ? 'Aucune notification'
                  : filter === 'unread'
                  ? 'Aucune notification non lue'
                  : 'Aucune notification lue'
                }
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Vous n\'avez pas encore de notifications.'
                  : filter === 'unread'
                  ? 'Toutes vos notifications sont lues.'
                  : 'Aucune notification lue pour le moment.'
                }
              </p>
            </motion.div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-sm border-l-4 ${
                  !notification.isRead ? 'border-l-blue-500' : 'border-l-gray-300'
                } hover:shadow-md transition-shadow`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          {notification.title && (
                            <h3 className="text-lg font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                          )}
                          {notification.priority && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.priority)}`}>
                              {notification.priority === 'high' ? 'Urgent' : 
                               notification.priority === 'medium' ? 'Moyen' : 'Faible'}
                            </span>
                          )}
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        
                        <p className="text-gray-700 mb-3">{notification.message}</p>
                        
                        {/* Information Details */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-3 border border-blue-200">
                          <div className="flex items-center mb-2">
                            <FileText className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="text-sm font-semibold text-blue-800">Détails Information</span>
                          </div>
                          
                          {notification.description && (
                            <div className="mb-3">
                              <span className="text-sm font-medium text-blue-800">Description:</span>
                              <p className="text-blue-700 mt-1 leading-relaxed">{notification.description}</p>
                            </div>
                          )}
                          
                          {notification.contact && (
                            <div className="mb-3">
                              <span className="text-sm font-medium text-blue-800">Contact:</span>
                              <p className="text-blue-700 mt-1">{notification.contact}</p>
                            </div>
                          )}
                          
                          {!notification.description && !notification.contact && (
                            <div className="text-blue-600 text-sm italic">
                              Aucun détail supplémentaire disponible pour cette notification.
                            </div>
                          )}
                        </div>

                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(notification.date).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(notification.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        
                        {/* Action buttons for internal navigation */}
                        {notification.actionUrl && (notification.actionUrl.startsWith('/') || notification.actionUrl.includes('formations') || notification.actionUrl.includes('projects') || notification.actionUrl.includes('coaching')) && (
                          <div className="mt-3">
                            <button
                              onClick={() => {
                                const url = notification.actionUrl!;
                                if (url === '/formations' || url.includes('formations')) {
                                  onNavigate('formations');
                                } else if (url === '/projects' || url.includes('projects')) {
                                  onNavigate('projects');
                                } else if (url === '/coaching' || url.includes('coaching')) {
                                  onNavigate('coaching');
                                }
                              }}
                              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <span>Voir détails</span>
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Marquer comme lu"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
