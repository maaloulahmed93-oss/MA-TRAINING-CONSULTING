import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ArrowLeft,
  Download,
  Star
} from 'lucide-react';
import { mockProjects } from '../../data/participantData';

interface ProjetsProps {
  participantId?: string;
  onNavigate: (page: string) => void;
}

const Projets = ({ onNavigate }: ProjetsProps) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [selectedProject, setSelectedProject] = useState<typeof mockProjects[0] | null>(null);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setUploadFiles(Array.from(event.target.files));
    }
  };

  const handleSubmitProject = () => {
    if (!selectedProject || uploadFiles.length === 0) {
      alert('Veuillez sélectionner au moins un fichier.');
      return;
    }

    // Simulation d'upload
    console.log('Uploading files for project:', selectedProject?.title, uploadFiles);
    
    const isResubmission = selectedProject.files && selectedProject.files.length > 0;
    const actionText = isResubmission ? 'resoumis' : 'soumis';
    
    setShowUploadModal(false);
    setUploadFiles([]);
    setSelectedProject(null);
    
    // Ici on ajouterait la logique d'upload réelle
    alert(`Projet "${selectedProject?.title}" ${actionText} avec succès !\n${uploadFiles.length} fichier(s) uploadé(s).`);
  };

  const handleOpenUploadModal = (project: typeof mockProjects[0]) => {
    setSelectedProject(project);
    setUploadFiles([]); // Reset files for new upload
    setShowUploadModal(true);
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
        {/* Stats Cards */}
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
                <p className="text-2xl font-bold text-gray-900">{mockProjects.length}</p>
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
                  {mockProjects.filter(p => p.status === 'Accepté').length}
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
                  {mockProjects.filter(p => p.status === 'En attente').length}
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
                  {(mockProjects.filter(p => p.grade).reduce((acc, p) => acc + (p.grade || 0), 0) / 
                    mockProjects.filter(p => p.grade).length).toFixed(1)}/20
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Projects List */}
        <div className="space-y-6">
          {mockProjects.map((project, index) => {
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

                  {/* Files */}
                  {project.files.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Fichiers soumis:</h4>
                      <div className="space-y-2">
                        {project.files.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {file.size} • Uploadé le {new Date(file.uploadDate).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                      {project.status === 'En attente' || project.status === 'Refusé' ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleOpenUploadModal(project)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            project.files.length > 0 
                              ? 'bg-orange-500 text-white hover:bg-orange-600' 
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          <Upload className="w-4 h-4" />
                          <span>{project.files.length > 0 ? 'Resoummettre' : 'Soumettre'}</span>
                        </motion.button>
                      ) : (
                        <span className="text-sm text-gray-500">Projet terminé</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
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
                ? `${selectedProject.files?.length > 0 ? 'Resoummettre' : 'Soumettre'}: ${selectedProject.title}` 
                : 'Uploader un projet'
              }
            </h2>
            
            {/* Affichage des fichiers existants pour resoumission */}
            {selectedProject?.files && selectedProject.files?.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                  📁 Fichiers actuellement soumis:
                </h4>
                <ul className="text-sm text-yellow-600 mb-3">
                  {selectedProject.files?.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-yellow-700">{file.name}</span>
                      <span className="text-yellow-600">{file.size}</span>
                    </div>
                  ))}
                </ul>
                <p className="text-sm text-yellow-700 mb-2">
                  📁 Fichiers actuels ({selectedProject.files?.length || 0}) :anciens
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {(selectedProject?.files?.length || 0) > 0 
                    ? 'Sélectionner les nouveaux fichiers' 
                    : 'Sélectionner les fichiers'
                  }
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Glissez-déposez vos fichiers ici ou
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
                  >
                    parcourez
                  </label>
                </div>
              </div>

              {uploadFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Fichiers sélectionnés:</h4>
                  <div className="space-y-2">
                    {uploadFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
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
                  onClick={handleSubmitProject}
                  disabled={uploadFiles.length === 0}
                  className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    (selectedProject?.files?.length || 0) > 0
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {(selectedProject?.files?.length || 0) > 0 ? 'Resoummettre' : 'Soumettre'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Projets;
