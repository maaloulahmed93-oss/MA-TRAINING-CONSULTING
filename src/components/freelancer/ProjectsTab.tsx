import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Folder, 
  Calendar, 
  Clock, 
  Users, 
  User, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { ProjectStatus, FreelancerStats } from '../../types/freelancer';
import { getProjectStatus, mockFreelancerStats } from '../../services/freelancerData';

const ProjectsTab: React.FC = () => {
  // Suivi des données mock
  console.log('Projects:', getProjectStatus());
  const [projects] = useState<ProjectStatus[]>(getProjectStatus());
  const [stats] = useState<FreelancerStats>(mockFreelancerStats);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed' | 'cancelled'>('all');

  const filteredProjects = projects.filter(project => 
    filter === 'all' || project.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'pending_review':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'pending_review':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      case 'pending_review':
        return 'En révision';
      default:
        return 'Inconnu';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const calculateDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projets totaux</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Folder className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Terminés</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedProjects}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de réussite</p>
              <p className="text-2xl font-bold text-purple-600">{stats.successRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalEarnings.toLocaleString()} €</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Header avec filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">📋</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Projets</h2>
        </div>
        <p className="text-gray-600">Suivez l'avancement de vos projets</p>
        
        <div className="flex gap-2">
          {(['all', 'in_progress', 'completed', 'cancelled'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterType
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterType === 'all' ? 'Tous' : 
               filterType === 'in_progress' ? 'En cours' :
               filterType === 'completed' ? 'Terminés' : 'Annulés'}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des projets */}
      <div className="grid gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-8 border-purple-500 mb-6 hover:shadow-2xl transition-shadow duration-200 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-purple-100 text-purple-600 rounded-full p-2 text-xl">📁</span>
              <h3 className="text-3xl font-extrabold text-purple-900 group-hover:text-purple-700 transition-colors">{project.title}</h3>
            </div>
            {/* Badge Statut */}
            <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
              project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              project.status === 'completed' ? 'bg-green-100 text-green-700' :
              project.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              project.status === 'planning' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {project.status === 'in_progress' ? 'En cours' :
                project.status === 'completed' ? 'Terminé' :
                project.status === 'cancelled' ? 'Annulé' :
                project.status === 'planning' ? 'Planifié' :
                'Inconnu'}
            </span>
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              {/* Informations principales */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{project.title}</h3>
                    <div className="flex items-center gap-4 text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Début: {formatDate(project.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Fin: {formatDate(project.endDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      {getStatusText(project.status)}
                    </span>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progression</span>
                    <span className="text-sm font-bold text-gray-900">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                    />
                  </div>
                </div>

                {/* Mode de travail et équipe */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    {project.teamMembers.length <= 1 ? (
                      <User className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Users className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="text-sm text-gray-600">
                      Mode: {project.teamMembers.length <= 1 ? 'Solo' : 'Équipe'}
                    </span>
                  </div>
                  
                  {project.teamMembers && project.teamMembers.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Équipe:</span>
                      <div className="flex gap-1">
                        {project.teamMembers.map((member, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Informations sur les délais */}
                {project.status === 'in_progress' && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Temps restant:</span>
                      <span className={`text-sm font-bold ${
                        calculateDaysRemaining(project.endDate) > 7 
                          ? 'text-green-600' 
                          : calculateDaysRemaining(project.endDate) > 3 
                          ? 'text-orange-600' 
                          : 'text-red-600'
                      }`}>
                        {calculateDaysRemaining(project.endDate) > 0 
                          ? `${calculateDaysRemaining(project.endDate)} jours`
                          : 'Échéance dépassée'
                        }
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Dernière mise à jour: {formatDate(project.startDate)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Aucun projet {filter !== 'all' ? (
              filter === 'in_progress' ? 'en cours' : 
              filter === 'completed' ? 'terminé' : 'annulé'
            ) : ''}
          </h3>
          <p className="text-gray-500">
            {filter === 'all' ? 'Acceptez des offres pour commencer vos premiers projets' : 'Changez de filtre pour voir d\'autres projets'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectsTab;
