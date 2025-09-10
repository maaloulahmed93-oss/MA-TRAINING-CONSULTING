import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye,
  Plus,
  Link,
  File,
  Image,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { ExtendedProject, ProjectDocument } from '../../services/partnershipProjectsService';

interface DocumentManagementModalProps {
  project: ExtendedProject | null;
  isOpen: boolean;
  onClose: () => void;
  onDocumentsUpdate: (updatedProject: ExtendedProject) => void;
}

interface NewDocument {
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'other';
  url: string;
  isLink: boolean;
}

const DocumentManagementModal: React.FC<DocumentManagementModalProps> = ({
  project,
  isOpen,
  onClose,
  onDocumentsUpdate
}) => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newDocument, setNewDocument] = useState<NewDocument>({
    name: '',
    type: 'pdf',
    url: '',
    isLink: false
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  if (!project) return null;

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'doc':
        return <File className="w-6 h-6 text-blue-500" />;
      case 'image':
        return <Image className="w-6 h-6 text-green-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-6 h-6 text-green-600" />;
      default:
        return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewDocument(prev => ({
        ...prev,
        name: file.name,
        type: getFileType(file.name),
        url: URL.createObjectURL(file),
        isLink: false
      }));
    }
  };

  const getFileType = (fileName: string): 'pdf' | 'doc' | 'image' | 'other' => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'doc';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      default:
        return 'other';
    }
  };

  const simulateUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulation d'upload avec progression
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(i);
    }

    // Ajouter le document au projet
    const newDoc: ProjectDocument = {
      id: `DOC${Date.now()}`,
      name: newDocument.name,
      type: newDocument.type,
      url: newDocument.url,
      uploadDate: new Date().toLocaleDateString('fr-FR')
    };

    const updatedProject = {
      ...project,
      documents: [...(project.documents || []), newDoc]
    };

    onDocumentsUpdate(updatedProject);

    setNotification({
      type: 'success',
      message: `Document "${newDocument.name}" ajouté avec succès !`
    });

    // Reset form
    setNewDocument({ name: '', type: 'pdf', url: '', isLink: false });
    setShowUploadForm(false);
    setIsUploading(false);
    setUploadProgress(0);

    // Clear notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddDocument = async () => {
    if (!newDocument.name.trim()) {
      setNotification({
        type: 'error',
        message: 'Veuillez saisir un nom pour le document'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (newDocument.isLink && !newDocument.url.trim()) {
      setNotification({
        type: 'error',
        message: 'Veuillez saisir une URL valide'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    await simulateUpload();
  };

  const handleDeleteDocument = (docId: string) => {
    const updatedProject = {
      ...project,
      documents: project.documents?.filter(doc => doc.id !== docId) || []
    };

    onDocumentsUpdate(updatedProject);

    setNotification({
      type: 'success',
      message: 'Document supprimé avec succès !'
    });

    setTimeout(() => setNotification(null), 3000);
  };

  const handleDownloadDocument = (doc: ProjectDocument) => {
    // Simulation de téléchargement
    console.log(`📥 Téléchargement du document: ${doc.name}`);
    
    // Créer un lien de téléchargement simulé
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification({
      type: 'success',
      message: `Téléchargement de "${doc.name}" démarré !`
    });

    setTimeout(() => setNotification(null), 3000);
  };

  const handlePreviewDocument = (doc: ProjectDocument) => {
    // Ouvrir le document dans un nouvel onglet
    window.open(doc.url, '_blank');
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
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestion des Documents</h2>
                    <p className="text-gray-600">{project.title}</p>
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
              {/* Notification */}
              <AnimatePresence>
                {notification && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
                      notification.type === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {notification.type === 'success' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span>{notification.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Add Document Button */}
              {!showUploadForm && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowUploadForm(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Ajouter un document</span>
                  </button>
                </div>
              )}

              {/* Upload Form */}
              <AnimatePresence>
                {showUploadForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un nouveau document</h3>
                    
                    {/* Toggle between file upload and link */}
                    <div className="flex space-x-4 mb-4">
                      <button
                        onClick={() => setNewDocument(prev => ({ ...prev, isLink: false }))}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          !newDocument.isLink 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <Upload className="w-4 h-4 inline mr-2" />
                        Fichier
                      </button>
                      <button
                        onClick={() => setNewDocument(prev => ({ ...prev, isLink: true }))}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          newDocument.isLink 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <Link className="w-4 h-4 inline mr-2" />
                        Lien
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Document Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom du document *
                        </label>
                        <input
                          type="text"
                          value={newDocument.name}
                          onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: Cahier des charges v2.1"
                        />
                      </div>

                      {/* Document Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type de document
                        </label>
                        <select
                          value={newDocument.type}
                          onChange={(e) => setNewDocument(prev => ({ 
                            ...prev, 
                            type: e.target.value as 'pdf' | 'doc' | 'image' | 'other' 
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pdf">PDF</option>
                          <option value="doc">Document Word</option>
                          <option value="image">Image</option>
                          <option value="other">Autre</option>
                        </select>
                      </div>

                      {/* File Upload or URL */}
                      {newDocument.isLink ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            URL du document *
                          </label>
                          <input
                            type="url"
                            value={newDocument.url}
                            onChange={(e) => setNewDocument(prev => ({ ...prev, url: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com/document.pdf"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fichier *
                          </label>
                          <input
                            type="file"
                            onChange={handleFileUpload}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                          />
                        </div>
                      )}

                      {/* Upload Progress */}
                      {isUploading && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Upload en cours...</span>
                            <span className="text-sm font-bold text-blue-600">{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                              className="bg-blue-600 h-2 rounded-full"
                            />
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button
                          onClick={handleAddDocument}
                          disabled={isUploading}
                          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{isUploading ? 'Ajout en cours...' : 'Ajouter'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowUploadForm(false);
                            setNewDocument({ name: '', type: 'pdf', url: '', isLink: false });
                          }}
                          disabled={isUploading}
                          className="flex items-center space-x-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                          <span>Annuler</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Documents List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Documents du projet ({project.documents?.length || 0})
                </h3>
                
                {project.documents && project.documents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {project.documents.map((doc, index) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          {getFileIcon(doc.type)}
                          <div>
                            <h4 className="font-medium text-gray-900">{doc.name}</h4>
                            <p className="text-sm text-gray-600">
                              {doc.type.toUpperCase()} • Ajouté le {doc.uploadDate}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePreviewDocument(doc)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Prévisualiser"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(doc)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Aucun document disponible</p>
                    <p className="text-gray-400">Ajoutez des documents pour commencer</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DocumentManagementModal;
