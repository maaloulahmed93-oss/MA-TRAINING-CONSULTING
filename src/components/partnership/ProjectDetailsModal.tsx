import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Users, 
  FileText, 
  Download, 
  Mail, 
  CheckCircle, 
  Clock,
  User,
  MapPin,
  DollarSign,
  Target,
  Briefcase
} from 'lucide-react';
import { ExtendedProject, ProjectDocument, ProjectMilestone, downloadDocument, generateContactEmail } from '../../services/partnershipProjectsService';

interface ProjectDetailsModalProps {
  project: ExtendedProject | null;
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  isOpen,
  onClose,
  partnerName
}) => {
  if (!project) return null;

  const getStatusIcon = (completed: boolean) => {
    if (completed) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-purple-100 text-purple-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        return status;
    }
  };

  const handleContactTeam = () => {
    const emailUrl = generateContactEmail(project, partnerName);
    window.location.href = emailUrl;
  };

  const handleDownloadDocument = (doc: ProjectDocument) => {
    downloadDocument(doc);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600">{project.progress}% complété</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression du projet</span>
                  <span className="text-sm font-bold text-blue-600">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                  />
                </div>
              </div>

              {/* Project Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Date de début</p>
                      <p className="font-medium">{project.startDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Date de fin prévue</p>
                      <p className="font-medium">{project.endDate}</p>
                    </div>
                  </div>
                  {project.budget && (
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Budget</p>
                        <p className="font-medium text-green-600">{project.budget.toLocaleString()} €</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Participants</p>
                      <p className="font-medium">{project.participants.length} membres</p>
                    </div>
                  </div>
                  {project.contactEmail && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Contact</p>
                        <p className="font-medium">{project.contactEmail}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium">Projet de partenariat</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description du projet</h3>
                <p className="text-gray-700 leading-relaxed">{project.description}</p>
              </div>

              {/* Milestones */}
              {project.milestones && project.milestones.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Jalons du projet</h3>
                  <div className="space-y-3">
                    {project.milestones.map((milestone: ProjectMilestone, index: number) => (
                      <motion.div
                        key={milestone.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                      >
                        {getStatusIcon(milestone.completed)}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                          {milestone.description && (
                            <p className="text-sm text-gray-600">{milestone.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{milestone.date}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            milestone.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {milestone.completed ? 'Terminé' : 'En cours'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Members */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Participants du projet</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.participants.map((participant: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{participant}</h4>
                        <p className="text-sm text-gray-600">Participant</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              {project.documents && project.documents.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents du projet</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.documents.map((doc, index) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <div>
                            <h4 className="font-medium text-gray-900">{doc.name}</h4>
                            <p className="text-sm text-gray-600">{doc.type}</p>
                            <p className="text-xs text-gray-500">Ajouté le {doc.uploadDate}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Télécharger le document"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={handleContactTeam}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
                >
                  <Mail className="w-5 h-5" />
                  <span>Contacter l'équipe</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
                >
                  <X className="w-5 h-5" />
                  <span>Fermer</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectDetailsModal;
