import React from 'react';
import { motion } from 'framer-motion';
import {
  FolderOpen,
  CheckCircle,
  Clock,
  Pause,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  planningProjects: number;
  onHoldProjects: number;
  averageProgress: number;
  totalBudget: number;
  totalParticipants: number;
  upcomingDeadlines: number;
}

interface ProjectStatsWidgetProps {
  stats: ProjectStats;
  partnerName: string;
}

const ProjectStatsWidget: React.FC<ProjectStatsWidgetProps> = ({
  stats,
  partnerName
}) => {
  // Calculer les pourcentages pour le graphique circulaire
  const statusData = [
    { 
      label: 'En cours', 
      value: stats.activeProjects, 
      color: '#f59e0b',
      icon: Clock
    },
    { 
      label: 'Terminés', 
      value: stats.completedProjects, 
      color: '#10b981',
      icon: CheckCircle
    },
    { 
      label: 'Planification', 
      value: stats.planningProjects, 
      color: '#3b82f6',
      icon: FolderOpen
    },
    { 
      label: 'En pause', 
      value: stats.onHoldProjects, 
      color: '#ef4444',
      icon: Pause
    }
  ];

  // Filtrer les données avec des valeurs > 0
  const activeStatusData = statusData.filter(item => item.value > 0);

  // Composant pour une métrique
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  // Graphique en barres simple
  const SimpleBarChart: React.FC = () => {
    const maxValue = Math.max(...activeStatusData.map(d => d.value));
    
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Répartition des projets
        </h4>
        {activeStatusData.map((item, index) => {
          const Icon = item.icon;
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          
          return (
            <div key={item.label} className="flex items-center space-x-3">
              <Icon className="w-4 h-4" style={{ color: item.color }} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">
                    {item.label}
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {item.value}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                    className="h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Graphique de progression circulaire
  const CircularProgress: React.FC<{ 
    percentage: number; 
    color: string; 
    size?: number 
  }> = ({ percentage, color, size = 60 }) => {
    const radius = (size - 8) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f3f4f6"
            strokeWidth="4"
            fill="transparent"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-900">
            {percentage}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Statistiques des Projets
          </h3>
          <p className="text-sm text-gray-600">
            Vue d'ensemble pour {partnerName}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CircularProgress 
            percentage={stats.averageProgress} 
            color="#3b82f6" 
            size={50}
          />
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total"
          value={stats.totalProjects}
          icon={<FolderOpen className="w-4 h-4 text-blue-600" />}
          color="bg-blue-100"
          subtitle="projets"
        />
        <MetricCard
          title="Budget"
          value={`${(stats.totalBudget / 1000).toFixed(0)}K€`}
          icon={<DollarSign className="w-4 h-4 text-green-600" />}
          color="bg-green-100"
          subtitle="total"
        />
        <MetricCard
          title="Équipe"
          value={stats.totalParticipants}
          icon={<Users className="w-4 h-4 text-purple-600" />}
          color="bg-purple-100"
          subtitle="participants"
        />
        <MetricCard
          title="Échéances"
          value={stats.upcomingDeadlines}
          icon={<TrendingUp className="w-4 h-4 text-orange-600" />}
          color="bg-orange-100"
          subtitle="à venir"
        />
      </div>

      {/* Graphique de répartition */}
      {stats.totalProjects > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <SimpleBarChart />
        </div>
      )}

      {/* Message si pas de projets */}
      {stats.totalProjects === 0 && (
        <div className="text-center py-8">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            Aucun projet trouvé. Commencez par créer votre premier projet !
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ProjectStatsWidget;
