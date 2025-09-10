import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  FolderOpen, 
  MessageCircle, 
  Bell, 
  TrendingUp, 
  Award,
  Clock,
  Target,
  CheckCircle,
  PlayCircle,
  FileText,
  Star,
  Users,
  Calendar
} from 'lucide-react';
import { mockParticipants, mockProjects, mockNotifications } from '../../data/participantData';
import { Participant } from '../../types/participant';

interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'course' | 'project' | 'module' | 'achievement' | 'session' | 'resource';
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  iconColor: string;
}

interface ParticipantDashboardProps {
  participantId: string;
  onNavigate: (page: string) => void;
}

const ParticipantDashboard = ({ participantId, onNavigate }: ParticipantDashboardProps) => {
  const participant: Participant = mockParticipants[participantId] || mockParticipants['PART-2024-001'];
  const unreadNotifications = mockNotifications.filter(n => !n.isRead).length;
  const activeProjects = mockProjects.filter(p => p.status === 'En attente' || p.status === 'En révision').length;

  // État pour les activités récentes et toast
  const [recentActivities, setRecentActivities] = useState<Activity[]>([
    {
      id: 'act-1',
      title: 'Cours "Fondamentaux HTML/CSS" terminé',
      description: 'Félicitations ! Vous avez terminé ce cours avec succès.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
      type: 'course',
      icon: Award,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      id: 'act-2',
      title: 'Projet "Site E-commerce React" accepté',
      description: 'Votre projet a été validé par nos experts.',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
      type: 'project',
      icon: FolderOpen,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'act-3',
      title: 'Nouveau module "Promises et Async/Await" débloqué',
      description: 'Un nouveau module avancé est maintenant disponible.',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Il y a 1 semaine
      type: 'module',
      icon: BookOpen,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ]);
  
  const [showActivityToast, setShowActivityToast] = useState(false);
  const [toastActivity, setToastActivity] = useState<Activity | null>(null);

  // États pour les statistiques dynamiques
  const [progressStats, setProgressStats] = useState({
    globalProgress: participant.totalProgress || 75,
    completedCourses: participant.completedCourses || 8,
    studyTime: 45, // en heures
    achievedGoals: 8,
    totalGoals: 10
  });
  const [showProgressToast, setShowProgressToast] = useState(false);
  const [progressUpdate, setProgressUpdate] = useState<string>('');

  // Génération automatique d'activités
  useEffect(() => {
    const generateRandomActivity = (): Activity => {
      const activities = [
        {
          title: 'Session de coaching terminée',
          description: 'Séance de 45 minutes avec un expert carrière.',
          type: 'session' as const,
          icon: Users,
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600'
        },
        {
          title: 'Nouveau cours "React Avancé" commencé',
          description: 'Vous avez démarré un nouveau parcours d\'apprentissage.',
          type: 'course' as const,
          icon: PlayCircle,
          bgColor: 'bg-indigo-50',
          iconColor: 'text-indigo-600'
        },
        {
          title: 'Ressource "Guide des Bonnes Pratiques" consultée',
          description: 'Vous avez téléchargé une nouvelle ressource.',
          type: 'resource' as const,
          icon: FileText,
          bgColor: 'bg-teal-50',
          iconColor: 'text-teal-600'
        },
        {
          title: 'Badge "Expert JavaScript" obtenu',
          description: 'Félicitations ! Vous avez débloqué un nouveau badge.',
          type: 'achievement' as const,
          icon: Star,
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600'
        },
        {
          title: 'Examen "Bases de Données" réussi',
          description: 'Score: 85/100. Excellente performance !',
          type: 'course' as const,
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600'
        },
        {
          title: 'Rendez-vous planifié avec un mentor',
          description: 'Session prévue pour demain à 14h00.',
          type: 'session' as const,
          icon: Calendar,
          bgColor: 'bg-pink-50',
          iconColor: 'text-pink-600'
        }
      ];

      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      
      return {
        id: `act-auto-${Date.now()}`,
        title: randomActivity.title,
        description: randomActivity.description,
        timestamp: new Date(),
        type: randomActivity.type,
        icon: randomActivity.icon,
        bgColor: randomActivity.bgColor,
        iconColor: randomActivity.iconColor
      };
    };

    // Générer une nouvelle activité toutes les 20 secondes (pour la démo)
    const interval = setInterval(() => {
      const newActivity = generateRandomActivity();
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 4)]); // Garder seulement les 5 plus récentes
      
      // Afficher le toast pour la nouvelle activité
      setToastActivity(newActivity);
      setShowActivityToast(true);
      
      // Masquer le toast après 4 secondes
      setTimeout(() => setShowActivityToast(false), 4000);
      
      console.log('Nouvelle activité générée:', newActivity.title);
    }, 20000); // 20 secondes

    return () => clearInterval(interval);
  }, []);

  // Système de mise à jour automatique des statistiques
  useEffect(() => {
    const updateProgressStats = () => {
      const updates = [
        {
          type: 'progress',
          message: 'Progression globale augmentée',
          update: () => setProgressStats(prev => ({
            ...prev,
            globalProgress: Math.min(100, prev.globalProgress + Math.floor(Math.random() * 3) + 1)
          }))
        },
        {
          type: 'course',
          message: 'Nouveau cours terminé',
          update: () => setProgressStats(prev => ({
            ...prev,
            completedCourses: prev.completedCourses + 1
          }))
        },
        {
          type: 'study',
          message: 'Temps d\'\u00e9tude augmenté',
          update: () => setProgressStats(prev => ({
            ...prev,
            studyTime: prev.studyTime + Math.floor(Math.random() * 2) + 1
          }))
        },
        {
          type: 'goal',
          message: 'Nouvel objectif atteint',
          update: () => setProgressStats(prev => ({
            ...prev,
            achievedGoals: Math.min(prev.totalGoals, prev.achievedGoals + 1)
          }))
        }
      ];

      const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
      randomUpdate.update();
      
      // Afficher le toast de progression
      setProgressUpdate(randomUpdate.message);
      setShowProgressToast(true);
      
      // Masquer le toast après 3 secondes
      setTimeout(() => setShowProgressToast(false), 3000);
      
      console.log('Statistiques mises à jour:', randomUpdate.message);
    };

    // Mettre à jour les statistiques toutes les 15 secondes
    const progressInterval = setInterval(updateProgressStats, 15000);

    return () => clearInterval(progressInterval);
  }, []);

  // Fonction pour formater le temps relatif
  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minutes`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heures`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} jours`;
    return `Il y a ${Math.floor(diffInSeconds / 604800)} semaines`;
  };

  const quickActions = [
    {
      id: 'formations',
      title: 'Mes Formations',
      description: `${participant.completedCourses}/${participant.totalCourses} cours terminés`,
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      page: 'formations'
    },
    {
      id: 'projects',
      title: 'Projets',
      description: `${activeProjects} projet${activeProjects > 1 ? 's' : ''} en cours`,
      icon: FolderOpen,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      page: 'projects'
    },
    {
      id: 'coaching',
      title: 'Coaching & Orientation',
      description: 'Ressources et conseils carrière',
      icon: MessageCircle,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      page: 'coaching'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: `${unreadNotifications} nouvelle${unreadNotifications > 1 ? 's' : ''} notification${unreadNotifications > 1 ? 's' : ''}`,
      icon: Bell,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      page: 'notifications'
    }
  ];

  // Statistiques dynamiques basées sur l'état
  const stats = [
    {
      label: 'Progression globale',
      value: `${progressStats.globalProgress}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      trend: progressStats.globalProgress > (participant.totalProgress || 75) ? '+' : ''
    },
    {
      label: 'Cours terminés',
      value: progressStats.completedCourses,
      icon: Award,
      color: 'text-green-600',
      trend: progressStats.completedCourses > (participant.completedCourses || 8) ? '+' : ''
    },
    {
      label: 'Temps d\'\u00e9tude',
      value: `${progressStats.studyTime}h`,
      icon: Clock,
      color: 'text-purple-600',
      trend: progressStats.studyTime > 45 ? '+' : ''
    },
    {
      label: 'Objectifs atteints',
      value: `${progressStats.achievedGoals}/${progressStats.totalGoals}`,
      icon: Target,
      color: 'text-orange-600',
      trend: progressStats.achievedGoals > 8 ? '+' : ''
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              {participant.avatar && (
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Bienvenue, {participant.name}
                </h1>
                <p className="text-gray-600">
                  Inscrit depuis le {new Date(participant.enrolledDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Progression globale</div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressStats.globalProgress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                  ></motion.div>
                </div>
                <span className="text-lg font-semibold text-blue-600 flex items-center space-x-1">
                  <span>{progressStats.globalProgress}%</span>
                  {progressStats.globalProgress > (participant.totalProgress || 75) && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs text-green-600 font-medium"
                    >
                      ↗
                    </motion.span>
                  )}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    {stat.trend && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center space-x-1"
                      >
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded-full">
                          {stat.trend} Mis à jour
                        </span>
                      </motion.div>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                    <span>{stat.value}</span>
                    {stat.trend && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-sm text-green-600"
                      >
                        ↗
                      </motion.span>
                    )}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color} flex-shrink-0`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Accès rapide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => onNavigate(action.page)}
                className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className={`w-6 h-6 ${action.textColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
                <div className={`mt-4 inline-flex items-center text-sm font-medium ${action.textColor} group-hover:translate-x-1 transition-transform duration-200`}>
                  Accéder →
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Activité récente</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Mise à jour automatique</span>
            </div>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`flex items-center space-x-4 p-4 ${activity.bgColor} rounded-lg hover:shadow-md transition-all duration-200`}
                >
                  <div className={`w-10 h-10 ${activity.bgColor.replace('50', '100')} rounded-full flex items-center justify-center`}>
                    <IconComponent className={`w-5 h-5 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-600 mb-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                  {activity.timestamp.getTime() > Date.now() - 60000 && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Nouveau
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
            
            {recentActivities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucune activité récente</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Toast de Nouvelle Activité */}
      {showActivityToast && toastActivity && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-3 max-w-md"
        >
          <div className="flex-shrink-0">
            <toastActivity.icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              Nouvelle activité !
            </p>
            <p className="text-xs opacity-90 truncate">
              {toastActivity.title}
            </p>
          </div>
          <button
            onClick={() => setShowActivityToast(false)}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
          >
            <Target className="w-4 h-4" />
          </button>
        </motion.div>
      )}
      
      {/* Toast de Progression */}
      {showProgressToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-3 max-w-sm"
        >
          <div className="flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">
              Progression mise à jour !
            </p>
            <p className="text-xs opacity-90 truncate">
              {progressUpdate}
            </p>
          </div>
          <button
            onClick={() => setShowProgressToast(false)}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
          >
            <Target className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ParticipantDashboard;
