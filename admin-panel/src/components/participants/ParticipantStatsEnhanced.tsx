import React from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { ParticipantStats } from '../../types/participant';

interface ParticipantStatsEnhancedProps {
  stats: ParticipantStats;
}

const ParticipantStatsEnhanced: React.FC<ParticipantStatsEnhancedProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Participants',
      value: stats.total,
      icon: UsersIcon,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900'
    },
    {
      title: 'Participants Actifs',
      value: stats.active,
      icon: CheckCircleIcon,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-900'
    },
    {
      title: 'Diplômés',
      value: stats.graduated,
      icon: AcademicCapIcon,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-900'
    },
    {
      title: 'En Progression',
      value: stats.inProgress,
      icon: ClockIcon,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-900'
    },
    {
      title: 'Nouveaux ce mois',
      value: stats.newThisMonth,
      icon: UserPlusIcon,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      textColor: 'text-indigo-900'
    },
    {
      title: 'Progression Moyenne',
      value: `${Math.round(stats.averageProgress)}%`,
      icon: ArrowTrendingUpIcon,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`${card.bgColor} rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-white/50`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
            
            {/* Progress indicator for some stats */}
            {card.title === 'Progression Moyenne' && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(stats.averageProgress, 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            {card.title === 'Participants Actifs' && stats.total > 0 && (
              <div className="mt-4">
                <div className="flex items-center text-xs text-gray-500">
                  <span>{Math.round((stats.active / stats.total) * 100)}% du total</span>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ParticipantStatsEnhanced;
