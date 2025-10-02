import { useState, useEffect } from 'react';
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
import { FreelancerStats, Project } from '../../types/freelancer';
import { mockFreelancerStats, getProjects } from '../../services/freelancerData';

const ProjectsTab: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats] = useState<FreelancerStats>(mockFreelancerStats);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed' | 'cancelled'>('all');

  // تحديث المشاريع عند تحميل المكون
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { getFreelancerSession } = await import('../../services/freelancerAuth');
        const session = getFreelancerSession();
        const freelancerId = session?.freelancerId;
        
        const allProjects = await getProjects(freelancerId);
        setProjects(allProjects);
        console.log(`📊 تم تحميل ${allProjects.length} مشاريع`);
      } catch (error) {
        console.error('خطأ في تحميل المشاريع:', error);
      }
    };
    
    loadProjects();
    
    // تحديث كل 10 ثوانٍ للحصول على المشاريع الجديدة
    const interval = setInterval(loadProjects, 10000);
    
    return () => clearInterval(interval);
  }, []);

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

  // تحديث تقدم المشروع
  const updateProjectProgress = async (projectId: string, newProgress: number) => {
    try {
      // التأكد من أن النسبة بين 0 و 100
      const clampedProgress = Math.max(0, Math.min(100, newProgress));
      
      // تحديث فوري في الواجهة
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === projectId 
            ? { ...project, progress: clampedProgress }
            : project
        )
      );

      // حفظ التحديث في localStorage
      const updatedProjects = projects.map(project => 
        project.id === projectId 
          ? { ...project, progress: clampedProgress }
          : project
      );
      
      try {
        localStorage.setItem('freelancerProjects', JSON.stringify(updatedProjects));
        console.log(`📊 Progression du projet ${projectId} mise à jour: ${clampedProgress}%`);
      } catch (error) {
        console.error('خطأ في حفظ تقدم المشروع:', error);
      }

      // TODO: إضافة API call لحفظ التحديث في قاعدة البيانات
      console.log(`📡 API call: Update project ${projectId} progress to ${clampedProgress}%`);
      
    } catch (error) {
      console.error('خطأ في تحديث تقدم المشروع:', error);
    }
  };

  // تحديث حالة المشروع أو حذفه
  const updateProjectStatus = async (projectId: string, newStatus: 'in_progress' | 'completed' | 'cancelled') => {
    try {
      if (newStatus === 'cancelled') {
        // تأكيد الحذف
        const projectToDelete = projects.find(p => p.id === projectId);
        const confirmDelete = window.confirm(
          `Êtes-vous sûr de vouloir supprimer définitivement le projet "${projectToDelete?.title}" ?\n\nCette action ne peut pas être annulée.`
        );
        
        if (!confirmDelete) {
          return; // إلغاء الحذف
        }

        // إذا كان الستاتوس "Annulés" - احذف المشروع نهائياً
        setProjects(prevProjects => 
          prevProjects.filter(project => project.id !== projectId)
        );

        // حذف من localStorage أيضاً
        const updatedProjects = projects.filter(project => project.id !== projectId);
        
        try {
          localStorage.setItem('freelancerProjects', JSON.stringify(updatedProjects));
          console.log(`🗑️ Projet "${projectToDelete?.title}" supprimé définitivement`);
        } catch (error) {
          console.error('خطأ في حذف المشروع من localStorage:', error);
        }

        // TODO: إضافة API call لحذف المشروع من قاعدة البيانات
        console.log(`📡 API call: Delete project ${projectId} permanently`);
        
      } else {
        // للحالات الأخرى - تحديث الحالة فقط
        setProjects(prevProjects => 
          prevProjects.map(project => 
            project.id === projectId 
              ? { ...project, status: newStatus }
              : project
          )
        );

        // حفظ التحديث في localStorage
        const updatedProjects = projects.map(project => 
          project.id === projectId 
            ? { ...project, status: newStatus }
            : project
        );
        
        try {
          localStorage.setItem('freelancerProjects', JSON.stringify(updatedProjects));
          console.log(`✅ Statut du projet ${projectId} mis à jour: ${newStatus}`);
        } catch (error) {
          console.error('خطأ في حفظ حالة المشروع:', error);
        }

        // TODO: إضافة API call لحفظ التحديث في قاعدة البيانات
        console.log(`📡 API call: Update project ${projectId} status to ${newStatus}`);
      }
      
    } catch (error) {
      console.error('خطأ في تحديث/حذف المشروع:', error);
    }
  };

  return (
    <div className="space-y-6">

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

                {/* Barre de progression avec contrôles */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progression</span>
                    <div className="flex items-center gap-3">
                      {/* Boutons de contrôle */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateProjectProgress(project.id, project.progress - 5)}
                          disabled={project.progress <= 0}
                          className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold transition-colors"
                          title="Diminuer de 5%"
                        >
                          −
                        </button>
                        <span className="text-sm font-bold text-gray-900 min-w-[3rem] text-center">
                          {project.progress}%
                        </span>
                        <button
                          onClick={() => updateProjectProgress(project.id, project.progress + 5)}
                          disabled={project.progress >= 100}
                          className="w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold transition-colors"
                          title="Augmenter de 5%"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`h-3 rounded-full ${getProgressColor(project.progress)} transition-all duration-300`}
                    />
                    {/* Marqueurs de progression */}
                    <div className="absolute top-0 left-0 w-full h-3 flex items-center">
                      {[25, 50, 75].map(mark => (
                        <div
                          key={mark}
                          className="absolute w-0.5 h-3 bg-white opacity-50"
                          style={{ left: `${mark}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Boutons de progression rapide */}
                  <div className="flex gap-1 mt-2">
                    {[0, 25, 50, 75, 100].map(percentage => (
                      <button
                        key={percentage}
                        onClick={() => updateProjectProgress(project.id, percentage)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          project.progress === percentage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={`Définir à ${percentage}%`}
                      >
                        {percentage}%
                      </button>
                    ))}
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
                  <div className="p-3 bg-gray-50 rounded-lg mb-4">
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

                {/* Boutons de changement de statut */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => updateProjectStatus(project.id, 'in_progress')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      project.status === 'in_progress'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    En cours
                  </button>
                  <button
                    onClick={() => updateProjectStatus(project.id, 'completed')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      project.status === 'completed'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    Terminés
                  </button>
                  <button
                    onClick={() => updateProjectStatus(project.id, 'cancelled')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      project.status === 'cancelled'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    Annulés
                  </button>
                </div>
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
