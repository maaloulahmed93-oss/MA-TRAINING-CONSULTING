import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Play
} from 'lucide-react';
import { PartnershipProject } from '../../types/partnership';
import { getPartnershipProjects } from '../../services/partnershipData';

interface ProjectsSectionProps {
  partnerId: string;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ partnerId }) => {
  const [projects] = useState<PartnershipProject[]>(getPartnershipProjects(partnerId));
  const [selectedProject, setSelectedProject] = useState<PartnershipProject | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on_hold':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Play className="w-4 h-4" />;
      case 'planning':
        return <Clock className="w-4 h-4" />;
      case 'on_hold':
        return <Pause className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'in_progress':
        return 'En cours';
      case 'planning':
        return 'Planification';
      case 'on_hold':
        return 'En attente';
      default:
        return 'Inconnu';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FolderOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Projets en cours</h2>
        </div>
        <div className="text-sm text-gray-500">
          {projects.length} projet{projects.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedProject(project)}
          >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {project.description}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(project.status)}`}>
                {getStatusIcon(project.status)}
                {getStatusText(project.status)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progression</span>
                <span className="text-sm font-bold text-blue-600">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Project Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Début: {formatDate(project.startDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Fin: {formatDate(project.endDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span>{project.participants.length} participants</span>
              </div>
              {project.budget && (
                <div className="flex items-center gap-2 text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>{project.budget.toLocaleString('fr-FR')} €</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedProject.title}
                </h3>
                <p className="text-gray-600">
                  {selectedProject.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Status & Progress */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">État du projet</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(selectedProject.status)}`}>
                        {getStatusIcon(selectedProject.status)}
                        {getStatusText(selectedProject.status)}
                      </span>
                      <span className="text-lg font-bold text-blue-600">{selectedProject.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${selectedProject.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Participants</h4>
                  <div className="space-y-2">
                    {selectedProject.participants.map((participant, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {participant.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="text-gray-700">{participant}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Timeline */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Calendrier</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Date de début</p>
                        <p className="text-sm text-gray-600">{formatDate(selectedProject.startDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Date de fin</p>
                        <p className="text-sm text-gray-600">{formatDate(selectedProject.endDate)}</p>
                      </div>
                    </div>
                    {selectedProject.budget && (
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Budget</p>
                          <p className="text-sm text-gray-600">{selectedProject.budget.toLocaleString('fr-FR')} €</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Objectives */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Objectifs</h4>
                  <ul className="space-y-2">
                    {selectedProject.objectives.map((objective, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Deliverables */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Livrables</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedProject.deliverables.map((deliverable, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{deliverable}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet</h3>
          <p className="text-gray-600">Aucun projet de partenariat n'est actuellement en cours.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;
