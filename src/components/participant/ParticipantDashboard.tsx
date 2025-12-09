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
  AlertCircle
} from 'lucide-react';
import { mockParticipants } from '../../data/participantData';
import { Participant } from '../../types/participant';
import { participantApiService, ApiParticipant } from '../../services/participantApiService';

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
  // ALL useState hooks declared at the top - NEVER move these or add conditional logic before them
  const [participant, setParticipant] = useState<Participant | ApiParticipant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  
  const [progressStats, setProgressStats] = useState({
    globalProgress: 0,
    completedCourses: 0,
    studyTime: 0,
    achievedGoals: 0,
    totalGoals: 10
  });
  const [showProgressToast, setShowProgressToast] = useState(false);
  const [progressUpdate, setProgressUpdate] = useState<string>('');

  // ALL useEffect hooks declared after useState hooks
  useEffect(() => {
    const loadParticipantData = async () => {
      setIsLoading(true);
      try {
        const apiParticipant = await participantApiService.getParticipant(participantId);
        if (apiParticipant) {
          setParticipant(apiParticipant);
        } else {
          const mockParticipant = mockParticipants[participantId] || mockParticipants['PART-2024-001'];
          setParticipant(mockParticipant);
        }
      } catch (error) {
        console.error('Error loading participant data:', error);
        const mockParticipant = mockParticipants[participantId] || mockParticipants['PART-2024-001'];
        setParticipant(mockParticipant);
      } finally {
        setIsLoading(false);
      }
    };

    loadParticipantData();
  }, [participantId]);

  useEffect(() => {
    if (participant) {
      // Calculate real participant data
      const getCompletedCourses = () => {
        if ('completedCourses' in participant && participant.completedCourses) return participant.completedCourses as number;
        if ('formations' in participant && participant.formations) {
          return (participant.formations as any[]).reduce((total: number, formation: any) => {
            return total + (formation.courses?.filter((c: any) => c.isCompleted).length || 0);
          }, 0) || 0;
        }
        return 0;
      };

      const getTotalCourses = () => {
        if ('totalCourses' in participant) return participant.totalCourses as number;
        if ('formations' in participant && participant.formations) {
          return (participant.formations as any[]).reduce((total: number, formation: any) => {
            return total + (formation.courses?.length || 0);
          }, 0) || 1;
        }
        return 1;
      };

      const getStudyTime = () => {
        if ('studyTime' in participant && participant.studyTime) return participant.studyTime as number;
        // Calculate based on completed courses (assume 5 hours per course)
        return getCompletedCourses() * 5;
      };

      const getAchievedGoals = () => {
        if ('achievedGoals' in participant && participant.achievedGoals) return participant.achievedGoals as number;
        // Calculate based on projects and courses
        const completedProjects = ('projects' in participant && participant.projects) 
          ? (participant.projects as any[]).filter((p: any) => p.status === 'completed' || p.status === 'Terminé').length 
          : 0;
        return getCompletedCourses() + completedProjects;
      };

      const getTotalGoals = () => {
        if ('totalGoals' in participant && participant.totalGoals) return participant.totalGoals as number;
        const totalCourses = getTotalCourses();
        const totalProjects = ('projects' in participant && participant.projects) 
          ? (participant.projects as any[]).length 
          : 0;
        return totalCourses + totalProjects || 6;
      };

      const completedCourses = getCompletedCourses();
      const totalCourses = getTotalCourses();
      const globalProgress = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

      setProgressStats({
        globalProgress: (participant.totalProgress as number) || globalProgress,
        completedCourses: completedCourses,
        studyTime: getStudyTime(),
        achievedGoals: getAchievedGoals(),
        totalGoals: getTotalGoals()
      });

      // Generate participant-specific activities based on real progress data
      const activities: Activity[] = [];
      
      // Get current progress stats for activity generation
      const currentCompletedCourses = getCompletedCourses();
      const currentStudyTime = getStudyTime();
      const currentAchievedGoals = getAchievedGoals();
      const currentTotalGoals = getTotalGoals();
      const currentGlobalProgress = totalCourses > 0 ? Math.round((currentCompletedCourses / totalCourses) * 100) : 0;
      
      // Activity for course completion milestones
      if (currentCompletedCourses > 0) {
        activities.push({
          id: 'courses-completed',
          title: `${currentCompletedCourses} cours terminé${currentCompletedCourses > 1 ? 's' : ''}`,
          description: `Félicitations ! Vous avez terminé ${currentCompletedCourses} cours avec succès.`,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within last week
          type: 'course',
          icon: Award,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600'
        });
      }

      // Activity for study time milestones
      if (currentStudyTime >= 25) {
        const milestones = [25, 50, 100, 200];
        const achievedMilestone = milestones.filter(m => currentStudyTime >= m).pop();
        if (achievedMilestone) {
          activities.push({
            id: `study-milestone-${achievedMilestone}`,
            title: `${achievedMilestone}h d'étude atteintes`,
            description: `Bravo ! Vous avez consacré ${currentStudyTime}h à votre formation.`,
            timestamp: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000), // Within last 5 days
            type: 'achievement',
            icon: Clock,
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
          });
        }
      }

      // Activity for goals achievement
      if (currentAchievedGoals > 0 && currentTotalGoals > 0) {
        const progressPercentage = Math.round((currentAchievedGoals / currentTotalGoals) * 100);
        if (progressPercentage >= 25) {
          activities.push({
            id: 'goals-progress',
            title: `${currentAchievedGoals}/${currentTotalGoals} objectifs atteints`,
            description: `Excellent progrès ! Vous avez atteint ${progressPercentage}% de vos objectifs.`,
            timestamp: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000), // Within last 3 days
            type: 'achievement',
            icon: Target,
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600'
          });
        }
      }

      // Activity for overall progress milestones
      if (currentGlobalProgress >= 25) {
        const milestones = [25, 50, 75, 90];
        const achievedMilestone = milestones.filter(m => currentGlobalProgress >= m).pop();
        if (achievedMilestone) {
          activities.push({
            id: `progress-milestone-${achievedMilestone}`,
            title: `${currentGlobalProgress}% de progression globale`,
            description: `Fantastique ! Vous avez atteint ${achievedMilestone}% de votre parcours de formation.`,
            timestamp: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000), // Within last 2 days
            type: 'achievement',
            icon: TrendingUp,
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600'
          });
        }
      }
      
      // Add completed courses from formations data
      if ('formations' in participant && participant.formations) {
        (participant.formations as any[]).forEach((formation: any) => {
          formation.courses?.forEach((course: any) => {
            if (course.isCompleted) {
              activities.push({
                id: `course-${course.id}`,
                title: `Cours "${course.title}" terminé`,
                description: `Formation: ${formation.title}`,
                timestamp: new Date(course.completedAt || Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                type: 'course',
                icon: Award,
                bgColor: 'bg-green-50',
                iconColor: 'text-green-600'
              });
            }
          });
        });
      }

      // Add project activities
      if ('projects' in participant && participant.projects) {
        (participant.projects as any[]).forEach((project: any) => {
          if (project.status === 'completed' || project.status === 'Terminé') {
            activities.push({
              id: `project-${project.id}`,
              title: `Projet "${project.title}" accepté`,
              description: 'Votre projet a été validé par nos experts.',
              timestamp: new Date(project.updatedAt || Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
              type: 'project',
              icon: FolderOpen,
              bgColor: 'bg-blue-50',
              iconColor: 'text-blue-600'
            });
          }
        });
      }

      // If no activities found, add some default ones based on participant data
      if (activities.length === 0) {
        activities.push({
          id: 'welcome-activity',
          title: 'Bienvenue dans votre espace participant',
          description: 'Votre compte a été activé avec succès. Commencez votre parcours de formation.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          type: 'achievement',
          icon: Award,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600'
        });
      }

      // Sort activities by timestamp and take the most recent ones
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setRecentActivities(activities.slice(0, 5));
    }
  }, [participant]);

  // Helper functions defined after all hooks
  const getParticipantName = () => {
    if (!participant) return 'Participant';
    if ('name' in participant) return participant.name;
    return participant.fullName || 'Participant';
  };


  const getEnrollmentDate = (): string => {
    if (!participant) return new Date().toISOString();
    if ('enrolledDate' in participant && participant.enrolledDate) return participant.enrolledDate;
    if ('enrollmentDate' in participant && participant.enrollmentDate) return participant.enrollmentDate;
    return new Date().toISOString();
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minutes`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heures`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} jours`;
    return `Il y a ${Math.floor(diffInSeconds / 604800)} semaines`;
  };

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
      }
    ];

    const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
    randomUpdate.update();
    setProgressUpdate(randomUpdate.message);
    setShowProgressToast(true);
    setTimeout(() => setShowProgressToast(false), 3000);
  };

  // Conditional rendering AFTER all hooks
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos données...</p>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Erreur de chargement</h1>
          <p className="text-gray-600 mb-4">Impossible de charger les données du participant.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      id: 'formations',
      title: 'Mes Parcours',
      description: '',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      page: 'formations'
    },
    {
      id: 'projects',
      title: 'Projets',
      description: '',
      icon: FolderOpen,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      page: 'projects'
    },
    {
      id: 'coaching',
      title: 'Coaching & Orientation',
      description: '',
      icon: MessageCircle,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      page: 'coaching'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: '',
      icon: Bell,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      page: 'notifications'
    }
  ];

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
      trend: progressStats.completedCourses > 8 ? '+' : ''
    },
    {
      label: 'Temps d\'étude',
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
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
              {('avatar' in participant ? participant.avatar : '') && (
                <img
                  src={'avatar' in participant ? participant.avatar : ''}
                  alt={getParticipantName()}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Bienvenue, {getParticipantName()}
                </h1>
                <p className="text-gray-600">
                  Inscrit depuis le {new Date(getEnrollmentDate()).toLocaleDateString('fr-FR')}
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
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-blue-500 h-2 rounded-full"
                  ></motion.div>
                </div>
                <span className="text-sm font-medium text-gray-900">{progressStats.globalProgress}%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onNavigate(action.page)}
            >
              <div className="p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 ${action.bgColor} rounded-lg mb-4`}>
                  <action.icon className={`w-6 h-6 ${action.textColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                {action.description && (
                  <p className="text-sm text-gray-600">{action.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              {stat.trend && (
                <div className="mt-2">
                  <span className="text-green-600 text-sm font-medium">{stat.trend}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Activités récentes</h2>
              <button
                onClick={updateProgressStats}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Actualiser
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 ${activity.bgColor} rounded-lg flex items-center justify-center`}>
                    <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{getRelativeTime(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toast Notifications */}
      {showProgressToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-green-500 text-white rounded-lg shadow-lg p-4 max-w-sm z-50"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{progressUpdate}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ParticipantDashboard;
