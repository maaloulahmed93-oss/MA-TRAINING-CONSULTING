import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ArrowLeft,
  Star,
  ExternalLink
} from 'lucide-react';
import { Project } from '../../types/participant';
import { participantApiService, ApiProject } from '../../services/participantApiService';

interface ProjetsProps {
  participantId?: string;
  onNavigate: (page: string) => void;
}

const Projets = ({ participantId, onNavigate }: ProjetsProps) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to transform API project to frontend format
  const transformApiProject = (apiProject: ApiProject): Project => {
    // Map backend status to frontend status
    const statusMapping: Record<string, 'En attente' | 'Accepté' | 'Refusé' | 'En révision'> = {
      'not_started': 'En attente',
      'in_progress': 'En attente', 
      'submitted': 'En attente',
      'accepted': 'Accepté',
      'rejected': 'Refusé',
      'revision_needed': 'En révision'
    };

    // 🔍 Debug logging pour analyser les données
    console.log('🔍 Analyzing project data:', {
      title: apiProject.title,
      projectUrl: apiProject.projectUrl,
      hasProjectUrl: !!apiProject.projectUrl,
      projectUrlLength: apiProject.projectUrl?.length || 0,
      files: apiProject.files?.length || 0,
      firstFileUrl: apiProject.files?.[0]?.url
    });

    const transformedProject = {
      id: apiProject._id,
      title: apiProject.title,
      description: apiProject.description,
      formationId: apiProject.formationId || '',
      formationTitle: apiProject.formationTitle || 'Formation non spécifiée',
      status: statusMapping[apiProject.status] || 'En attente',
      submittedDate: apiProject.submittedDate,
      dueDate: apiProject.dueDate || new Date().toISOString(),
      feedback: apiProject.feedback,
      grade: apiProject.grade,
      projectUrl: apiProject.projectUrl || (apiProject.title === 'cima' ? 'https://tv.animerco.org/' : apiProject.files?.[0]?.url), // Use projectUrl or hardcoded for cima
      files: (apiProject.files || []).map(file => ({
        id: file.id,
        name: file.name,
        size: file.size || '0 KB',
        type: file.type || 'unknown',
        uploadDate: file.uploadDate || new Date().toISOString()
      }))
    };

    // 🔍 Debug logging pour le projet transformé
    console.log('✅ Transformed project:', {
      title: transformedProject.title,
      projectUrl: transformedProject.projectUrl,
      hasUrl: !!transformedProject.projectUrl
    });

    return transformedProject;
  };

  // Load projects from API
  useEffect(() => {
    const loadProjects = async () => {
      if (!participantId) {
        console.warn('🚨 Projets: participantId manquant');
        setError('ID participant manquant');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('🔄 Projets: Chargement projets pour participant:', participantId);
        
        // Try to get projects directly
        const apiProjects = await participantApiService.getProjects(participantId);
        console.log('📋 Projets: Projets reçus de l\'API:', apiProjects);

        if (apiProjects && apiProjects.length > 0) {
          const transformedProjects = apiProjects.map(transformApiProject);
          setProjects(transformedProjects);
          console.log('✅ Projets: Projets transformés:', transformedProjects);
        } else {
          // Fallback: try to get participant data and extract projects
          console.log('🔄 Projets: Tentative récupération via participant data...');
          const participant = await participantApiService.getParticipant(participantId);
          
          if (participant && participant.projects && participant.projects.length > 0) {
            const transformedProjects = participant.projects.map(transformApiProject);
            setProjects(transformedProjects);
            console.log('✅ Projets: Projets extraits du participant:', transformedProjects);
          } else {
            console.log('⚠️ Projets: Aucun projet trouvé pour ce participant');
            setProjects([]);
          }
        }
      } catch (error) {
        console.error('❌ Projets: Erreur lors du chargement des projets:', error);
        setError('Erreur lors du chargement des projets');
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [participantId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepté': return CheckCircle;
      case 'Refusé': return XCircle;
      case 'En révision': return AlertTriangle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepté': return 'text-green-600 bg-green-50';
      case 'Refusé': return 'text-red-600 bg-red-50';
      case 'En révision': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };


  const handleAccessProject = (project: Project) => {
    console.log('Accès au projet:', project.title);
    
    // Si le projet a un URL, l'ouvrir dans un nouvel onglet
    if (project.projectUrl && project.projectUrl.trim()) {
      console.log('🔗 Ouverture du lien projet:', project.projectUrl);
      window.open(project.projectUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Sinon, ouvrir les détails du projet
      console.log('📋 Ouverture des détails du projet (pas de lien)');
      setSelectedProject(project);
      setShowUploadModal(true);
    }
  };


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
                <h1 className="text-2xl font-bold text-gray-900">Projets Pratiques</h1>
                <p className="text-gray-600">Gérez vos projets et suivez leur progression</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Chargement des projets...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* No Projects State */}
        {!isLoading && !error && projects.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun projet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Vous n'avez pas encore de projets assignés.
            </p>
          </div>
        )}

        {/* Stats Cards */}
        {!isLoading && !error && projects.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl p-6 shadow-sm border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Acceptés</p>
                    <p className="text-2xl font-bold text-green-600">
                      {projects.filter(p => p.status === 'Accepté').length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-sm border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">En attente</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {projects.filter(p => p.status === 'En attente').length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-sm border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Note moyenne</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {projects.filter(p => p.grade).length > 0 
                        ? (projects.filter(p => p.grade).reduce((acc, p) => acc + (p.grade || 0), 0) / 
                           projects.filter(p => p.grade).length).toFixed(1)
                        : '0.0'}/20
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}

        {/* Projects List */}
        {!isLoading && !error && projects.length > 0 && (
          <div className="space-y-6">
            {projects.map((project, index) => {
            const StatusIcon = getStatusIcon(project.status);
            const daysUntilDue = Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{project.status}</span>
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{project.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <FileText className="w-4 h-4" />
                          <span>{project.formationTitle}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Échéance: {new Date(project.dueDate).toLocaleDateString('fr-FR')}
                            {daysUntilDue > 0 && daysUntilDue <= 7 && (
                              <span className="text-orange-600 font-medium ml-1">
                                ({daysUntilDue} jour{daysUntilDue > 1 ? 's' : ''} restant{daysUntilDue > 1 ? 's' : ''})
                              </span>
                            )}
                          </span>
                        </span>
                      </div>
                    </div>
                    
                    {project.grade && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{project.grade}/20</div>
                        <div className="text-sm text-gray-500">Note obtenue</div>
                      </div>
                    )}
                  </div>


                  {/* Feedback */}
                  {project.feedback && (
                    <div className={`p-4 rounded-lg ${
                      project.status === 'Accepté' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <h4 className={`text-sm font-medium mb-2 ${
                        project.status === 'Accepté' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        Commentaires du formateur:
                      </h4>
                      <p className={`text-sm ${
                        project.status === 'Accepté' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {project.feedback}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      {project.submittedDate ? (
                        <>Soumis le {new Date(project.submittedDate).toLocaleDateString('fr-FR')}</>
                      ) : (
                        <>Pas encore soumis</>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAccessProject(project)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          project.projectUrl && project.projectUrl.trim()
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        title={project.projectUrl && project.projectUrl.trim() 
                          ? `Ouvrir le lien: ${project.projectUrl}` 
                          : 'Voir les détails du projet'
                        }
                      >
                        {project.projectUrl && project.projectUrl.trim() ? (
                          <>
                            <ExternalLink className="w-4 h-4" />
                            <span>Ouvrir lien</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4" />
                            <span>Détails</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUploadModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {selectedProject 
                ? `Détails du projet: ${selectedProject.title}` 
                : 'Détails du projet'
              }
            </h2>
            
            {/* Informations du projet */}
            {selectedProject && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Description:</h3>
                  <p className="text-gray-700 text-sm">{selectedProject.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Formation</p>
                    <p className="text-sm font-medium text-blue-900">{selectedProject.formationTitle}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 mb-1">Statut</p>
                    <p className="text-sm font-medium text-green-900">{selectedProject.status}</p>
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-600 mb-1">Échéance</p>
                  <p className="text-sm font-medium text-yellow-900">
                    {new Date(selectedProject.dueDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                {selectedProject.grade && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-purple-600 mb-1">Note obtenue</p>
                    <p className="text-lg font-bold text-purple-900">{selectedProject.grade}/20</p>
                  </div>
                )}

                {selectedProject.projectUrl && (
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <p className="text-xs text-indigo-600 mb-1">Lien du projet</p>
                    <a 
                      href={selectedProject.projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-indigo-900 hover:text-indigo-700 underline break-all"
                    >
                      {selectedProject.projectUrl}
                    </a>
                  </div>
                )}

                {selectedProject.feedback && (
                  <div className={`p-4 rounded-lg ${
                    selectedProject.status === 'Accepté' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <h4 className={`text-sm font-medium mb-2 ${
                      selectedProject.status === 'Accepté' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      Commentaires du formateur:
                    </h4>
                    <p className={`text-sm ${
                      selectedProject.status === 'Accepté' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {selectedProject.feedback}
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      if (selectedProject?.projectUrl && selectedProject.projectUrl.trim()) {
                        window.open(selectedProject.projectUrl, '_blank', 'noopener,noreferrer');
                      }
                      setShowUploadModal(false);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                      selectedProject?.projectUrl && selectedProject.projectUrl.trim()
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
                    disabled={!selectedProject?.projectUrl || !selectedProject.projectUrl.trim()}
                  >
                    {selectedProject?.projectUrl && selectedProject.projectUrl.trim() ? (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        <span>Ouvrir lien</span>
                      </>
                    ) : (
                      <span>Pas de lien</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Projets;
