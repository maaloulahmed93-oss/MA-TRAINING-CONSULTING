import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  Mail,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Briefcase,
  FolderOpen,
  PlusCircle
} from 'lucide-react';
import { getCurrentPartnerId } from '../../services/partnershipAuth';
import { getPartnerById } from '../../services/enterpriseApiService';
import { 
  getEnterpriseProjects,
  createEnterpriseProject
} from '../../services/enterpriseApiService';
import { PartnershipProject } from '../../types/partnership';
import CreateProjectModal from '../../components/partnership/CreateProjectModal';
import ProjectDetailsModal from '../../components/partnership/ProjectDetailsModal';
import DocumentManagementModal from '../../components/partnership/DocumentManagementModal';
import EmailCommunicationModal from '../../components/partnership/EmailCommunicationModal';

const PartenaireProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<PartnershipProject[]>([]);
  const [partnerName, setPartnerName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<PartnershipProject | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    status: 'in_progress' as 'planning' | 'in_progress' | 'completed' | 'on_hold',
    progress: 0,
    startDate: '',
    endDate: '',
    budget: undefined as number | undefined,
  });
  const [editError, setEditError] = useState<string>('');
  const [stats, setStats] = useState<{
    total: number;
    inProgress: number;
    completed: number;
    planning: number;
    onHold: number;
    averageProgress: number;
  } | null>(null);

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = () => {
      const currentPartnerId = getCurrentPartnerId();
      if (!currentPartnerId) {
        navigate('/espace-partenariat');
        return;
      }

      // setPartnerId(currentPartnerId); // Pas besoin de stocker partnerId dans le state
      
      // Charger les informations du partenaire
      const partner = getPartnerById(currentPartnerId);
      setPartnerName(partner?.name || 'Partenaire');

      // Charger les projets
      const loadedProjects = getProjects(currentPartnerId);
      setProjects(loadedProjects);
      
      // Calculer les statistiques
      const total = loadedProjects.length;
      const inProgress = loadedProjects.filter(p => p.status === 'in_progress').length;
      const completed = loadedProjects.filter(p => p.status === 'completed').length;
      const planning = loadedProjects.filter(p => p.status === 'planning').length;
      const onHold = loadedProjects.filter(p => p.status === 'on_hold').length;
      const averageProgress = total > 0 ? 
        Math.round(loadedProjects.reduce((sum, p) => sum + p.progress, 0) / total) : 0;
      
      setStats({
        total,
        inProgress,
        completed,
        planning,
        onHold,
        averageProgress
      });
      
      setLoading(false);
    };

    loadData();
  }, [navigate]);

  const handleStartEdit = (project: ExtendedProject) => {
    setEditingId(project.id);
    setEditError('');
    setEditData({
      title: project.title,
      description: project.description,
      status: project.status as 'planning' | 'in_progress' | 'completed' | 'on_hold',
      progress: project.progress,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditError('');
  };

  const handleSaveEdit = (project: ExtendedProject) => {
    if (!editingId) return;
    if (!editData.title.trim() || !editData.startDate || !editData.endDate) {
      setEditError('Titre, dates de début et fin sont requis');
      return;
    }
    const currentPartnerId = getCurrentPartnerId();
    if (!currentPartnerId) return;
    const clampedProgress = Math.max(0, Math.min(100, Number(editData.progress) || 0));
    const updated: ExtendedProject = {
      ...project,
      title: editData.title.trim(),
      description: editData.description,
      status: editData.status,
      progress: clampedProgress,
      startDate: editData.startDate,
      endDate: editData.endDate,
      budget: typeof editData.budget === 'number' ? editData.budget : undefined,
    };
    updateProject(currentPartnerId, updated);
    setProjects(prev => {
      const next = prev.map(p => (p.id === updated.id ? updated : p));
      recomputeStats(next);
      return next;
    });
    setEditingId(null);
  };

  const handleDeleteProject = (projectId: string) => {
    const currentPartnerId = getCurrentPartnerId();
    if (!currentPartnerId) return;
    if (!confirm('Confirmer la suppression de ce projet ?')) return;
    deleteProject(currentPartnerId, projectId);
    setProjects(prev => {
      const next = prev.filter(p => p.id !== projectId);
      recomputeStats(next);
      return next;
    });
  };

  // Recalculer les stats à partir d'une liste
  const recomputeStats = (list: ExtendedProject[]) => {
    const total = list.length;
    const inProgress = list.filter(p => p.status === 'in_progress').length;
    const completed = list.filter(p => p.status === 'completed').length;
    const planning = list.filter(p => p.status === 'planning').length;
    const onHold = list.filter(p => p.status === 'on_hold').length;
    const averageProgress = total > 0 ? Math.round(list.reduce((s, p) => s + p.progress, 0) / total) : 0;
    setStats({ total, inProgress, completed, planning, onHold, averageProgress });
  };

  // Obtenir la couleur selon le statut
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

  // Obtenir l'icône selon le statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'planning':
        return <Calendar className="w-4 h-4" />;
      case 'on_hold':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Obtenir le texte du statut
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'in_progress':
        return 'En cours';
      case 'planning':
        return 'Planification';
      case 'on_hold':
        return 'En pause';
      default:
        return 'Inconnu';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/espace-partenariat"
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour au tableau de bord</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <Briefcase className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Projets en cours
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Ajouter projet</span>
              </button>
              <div className="text-sm text-gray-500">{partnerName}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projets</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Cours</p>
                  <p className="text-3xl font-bold text-green-600">{stats.inProgress}</p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Terminés</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progression Moy.</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.averageProgress}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Projects List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300"
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{project.title}</h3>
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      <span>{getStatusText(project.status)}</span>
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progression</span>
                      <span className="text-sm font-bold text-blue-600">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inline Edit Form */}
              {editingId === project.id && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData(s => ({ ...s, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData(s => ({ ...s, status: e.target.value as 'planning' | 'in_progress' | 'completed' | 'on_hold' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="planning">Planification</option>
                        <option value="in_progress">En cours</option>
                        <option value="completed">Terminé</option>
                        <option value="on_hold">En pause</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Progression (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={editData.progress}
                        onChange={(e) => setEditData(s => ({ ...s, progress: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Budget (€)</label>
                      <input
                        type="number"
                        value={editData.budget ?? ''}
                        onChange={(e) => setEditData(s => ({ ...s, budget: e.target.value === '' ? undefined : Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
                      <input
                        type="date"
                        value={editData.startDate}
                        onChange={(e) => setEditData(s => ({ ...s, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                      <input
                        type="date"
                        value={editData.endDate}
                        onChange={(e) => setEditData(s => ({ ...s, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={editData.description}
                        onChange={(e) => setEditData(s => ({ ...s, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  </div>
                  {editError && <p className="text-sm text-red-600 mt-2">{editError}</p>}
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => handleSaveEdit(project)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">Enregistrer</button>
                    <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md">Annuler</button>
                  </div>
                </div>
              )}

              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Dates */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Début: {new Date(project.startDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Fin: {new Date(project.endDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                
                {/* Team */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Équipe ({project.participants.length} membres)</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {project.teamMembers?.slice(0, 2).map((member, idx) => (
                      <div key={idx}>{member}</div>
                    ))}
                    {project.teamMembers && project.teamMembers.length > 2 && (
                      <div>+{project.teamMembers.length - 2} autres...</div>
                    )}
                  </div>
                </div>
                
                {/* Budget */}
                {project.budget && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>Budget</span>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {project.budget.toLocaleString('fr-FR')} €
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setIsDetailsModalOpen(true);
                  }}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <Eye className="w-4 h-4" />
                  <span>Voir détails</span>
                </button>
                
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setIsEmailModalOpen(true);
                  }}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contacter l'équipe</span>
                </button>
                
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setIsDocumentsModalOpen(true);
                  }}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <FileText className="w-4 h-4" />
                  <span>Documents ({project.documents?.length || 0})</span>
                </button>

                <button
                  onClick={() => handleStartEdit(project)}
                  className="flex items-center space-x-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Modifier</span>
                </button>

                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="flex items-center space-x-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun projet trouvé
            </h3>
            <p className="text-gray-600">
              Vos projets en partenariat avec Siteen apparaîtront ici.
            </p>
          </motion.div>
        )}
      </div>

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedProject(null);
        }}
        partnerName={partnerName}
      />

      {/* Document Management Modal */}
      <DocumentManagementModal
        project={selectedProject}
        isOpen={isDocumentsModalOpen}
        onClose={() => {
          setIsDocumentsModalOpen(false);
          setSelectedProject(null);
        }}
        onDocumentsUpdate={(updatedProject) => {
          // Mettre à jour le projet dans la liste
          setProjects(prevProjects => 
            prevProjects.map(p => 
              p.id === updatedProject.id ? updatedProject : p
            )
          );
          // Sauvegarder dans localStorage
          const currentPartnerId = getCurrentPartnerId();
          if (currentPartnerId) {
            const updatedProjects = projects.map(p => 
              p.id === updatedProject.id ? updatedProject : p
            );
            saveProjects(currentPartnerId, updatedProjects);
          }
        }}
      />

      {/* Email Communication Modal */}
      <EmailCommunicationModal
        project={selectedProject}
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedProject(null);
        }}
        partnerName={partnerName}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(data: NewProjectInput) => {
          const currentPartnerId = getCurrentPartnerId();
          if (!currentPartnerId) {
            setIsCreateModalOpen(false);
            return;
          }
          const created = createProject(currentPartnerId, data);
          setProjects(prev => {
            const next = [created, ...prev];
            recomputeStats(next);
            return next;
          });
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
};

export default PartenaireProjectsPage;
