import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  Link,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Plus,
  ExternalLink,
  Download,
  Trash2,
  Bell,
  Eye,
} from "lucide-react";
import { Deliverable, ProjectStatus } from "../../types/freelancer";
import {
  getDeliverablesWithFallback,
  createDeliverable,
  updateDeliverable,
  deleteDeliverable,
  downloadDeliverableFile,
  isValidFileType,
  formatFileSize,
} from "../../services/freelancerDeliverablesService";
import { getProjectStatus } from "../../services/freelancerData";
import {
  getFreelancerDecisions,
  markDecisionAsRead,
  getDecisionStats,
  formatDecisionDate,
  FreelancerDecision,
} from "../../services/freelancerDecisionsService";

const DeliverablesTab: React.FC = () => {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [projects, setProjects] = useState<ProjectStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deliverableType, setDeliverableType] = useState<
    "design" | "code" | "documentation" | "prototype" | "file" | "link"
  >("file");
  const [submissionType, setSubmissionType] = useState<"file" | "link">("file");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null);
  
  // إضافة state للقرارات
  const [decisions, setDecisions] = useState<FreelancerDecision[]>([]);
  const [showDecisions, setShowDecisions] = useState(false);


  const activeProjects = projects.filter(
    (project) => project.status === "in_progress"
  );

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // تحميل الـ Livrables
        const deliverablesData = await getDeliverablesWithFallback();
        setDeliverables(deliverablesData);
        
        // تحميل المشاريع
        const projectsData = getProjectStatus();
        setProjects(projectsData);
        
        // تحميل القرارات
        loadDecisions();
        
        console.log('📦 تم تحميل البيانات:', deliverablesData.length, 'livrables');
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // دالة تحميل القرارات
  const loadDecisions = async () => {
    try {
      // الحصول على freelancerId من session أو localStorage
      const freelancerSession = localStorage.getItem('freelancerSession');
      if (freelancerSession) {
        const session = JSON.parse(freelancerSession);
        const freelancerId = session.freelancerId;
        
        const freelancerDecisions = await getFreelancerDecisions(freelancerId);
        setDecisions(freelancerDecisions);
        console.log(`📬 تم تحميل ${freelancerDecisions.length} قرار للفريلانسر ${freelancerId}`);
      }
    } catch (error) {
      console.error('خطأ في تحميل القرارات:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProject || !title.trim() || !description.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (submissionType === 'file' && !selectedFile) {
      alert('يرجى اختيار ملف للرفع');
      return;
    }

    if (submissionType === 'link' && !content.trim()) {
      alert('يرجى إدخال رابط صحيح');
      return;
    }

    try {
      setIsSubmitting(true);

      const deliverableData: Partial<Deliverable> = {
        title: title.trim(),
        description: description.trim(),
        projectId: selectedProject,
        type: deliverableType,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        fileUrl: submissionType === 'link' ? content.trim() : '',
        content: content.trim()
      };

      if (editingDeliverable) {
        // تحديث livrable موجود
        await updateDeliverable(
          editingDeliverable.id,
          deliverableData,
          submissionType === 'file' ? selectedFile || undefined : undefined
        );
      } else {
        // إنشاء livrable جديد
        await createDeliverable(
          deliverableData,
          submissionType === 'file' ? selectedFile || undefined : undefined
        );
      }

      // تحديث القائمة
      const updatedDeliverables = await getDeliverablesWithFallback();
      setDeliverables(updatedDeliverables);

      setShowSubmitModal(false);
      resetForm();
      
      alert(editingDeliverable ? 'تم تحديث الـ Livrable بنجاح!' : 'تم إنشاء الـ Livrable بنجاح!');
    } catch (error) {
      console.error('خطأ في حفظ الـ Livrable:', error);
      alert('حدث خطأ في حفظ الـ Livrable. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedProject("");
    setTitle("");
    setDescription("");
    setDeliverableType("file");
    setSubmissionType("file");
    setContent("");
    setSelectedFile(null);
    setEditingDeliverable(null);
  };

  // دالة لحذف livrable
  const handleDelete = async (deliverable: Deliverable) => {
    if (window.confirm(`هل أنت متأكد من حذف "${deliverable.title}"؟`)) {
      try {
        await deleteDeliverable(deliverable.id);
        
        // تحديث القائمة
        const updatedDeliverables = await getDeliverablesWithFallback();
        setDeliverables(updatedDeliverables);
        
        alert('تم حذف الـ Livrable بنجاح!');
      } catch (error) {
        console.error('خطأ في حذف الـ Livrable:', error);
        alert('حدث خطأ في حذف الـ Livrable.');
      }
    }
  };

  // دالة لتحميل ملف
  const handleDownload = async (deliverable: Deliverable) => {
    try {
      await downloadDeliverableFile(deliverable.id);
    } catch (error) {
      console.error('خطأ في تحميل الملف:', error);
      alert('حدث خطأ في تحميل الملف.');
    }
  };

  // دالة لفتح modal التعديل
  const handleEdit = (deliverable: Deliverable) => {
    setEditingDeliverable(deliverable);
    setSelectedProject(deliverable.projectId);
    setTitle(deliverable.title);
    setDescription(deliverable.description);
    setDeliverableType(deliverable.type);
    setSubmissionType(deliverable.fileUrl.startsWith('http') ? 'link' : 'file');
    setContent(deliverable.fileUrl.startsWith('http') ? deliverable.fileUrl : deliverable.content || '');
    setShowSubmitModal(true);
  };

  // دالة لمعالجة اختيار الملف
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!isValidFileType(file)) {
        alert('نوع الملف غير مدعوم. يرجى اختيار ملف صالح.');
        event.target.value = '';
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB
        alert('حجم الملف كبير جداً. الحد الأقصى 50MB.');
        event.target.value = '';
        return;
      }
      
      setSelectedFile(file);
      setContent(file.name);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-orange-600 bg-orange-100";
      case "approved":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "revision_needed":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "revision_needed":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "approved":
        return "Accepté";
      case "rejected":
        return "Refusé";
      case "revision_needed":
        return "Révision demandée";
      default:
        return "Inconnu";
    }
  };

  // عرض حالة التحميل
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل الـ Livrables...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Livrables</h2>
          <p className="text-gray-600">
            Soumettez vos fiches techniques et suivez leur statut
          </p>
        </div>

        <div className="flex gap-3">

          {/* زر القرارات */}
          <button
            onClick={() => setShowDecisions(!showDecisions)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
              showDecisions 
                ? "bg-blue-600 text-white" 
                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
            }`}
          >
            <Bell className="w-4 h-4" />
            Décisions
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Nouveau livrable
          </button>
        </div>
      </div>

      {/* قسم القرارات */}
      {showDecisions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Décisions de l'Admin
            </h3>
          </div>
          
          {decisions.length === 0 ? (
            <div className="text-center py-8 px-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-500 rounded-full p-3">
                    <Bell className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-blue-800 mb-2">
                  🎯 Décisions sur vos Livrables
                </h4>
                <p className="text-blue-600 mb-3">
                  Vos décisions finales d'acceptation ou de rejet de projet apparaîtront sur la page Notifications.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-blue-500">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Accepté</span>
                  <span className="mx-2">•</span>
                  <span className="inline-block w-2 h-2 bg-red-400 rounded-full"></span>
                  <span>Refusé</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {decisions.map((decision, index) => (
                <motion.div
                  key={decision._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    decision.decision === 'approved' 
                      ? 'border-l-green-500 bg-green-50' 
                      : 'border-l-red-500 bg-red-50'
                  } ${decision.status === 'sent' ? 'shadow-md' : 'opacity-75'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {decision.decision === 'approved' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <h4 className="font-semibold text-gray-800">
                          {decision.decision === 'approved' ? '✅ Livrable Accepté' : '❌ Livrable Refusé'}
                        </h4>
                        {decision.status === 'sent' && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">Livrable: {decision.deliverableTitle}</span>
                        </div>
                        <div className="mb-1">
                          <strong>Décision:</strong> {decision.decision === 'approved' ? 'Accepté ✅' : 'Refusé ❌'}
                        </div>
                        {decision.observation && (
                          <div className="bg-white p-2 rounded border mt-2">
                            <strong>Observation:</strong> {decision.observation}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>De: {decision.adminId}</span>
                        <span>{formatDecisionDate(decision.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {decision.status === 'sent' && (
                        <button
                          onClick={async () => {
                            const freelancerSession = localStorage.getItem('freelancerSession');
                            if (freelancerSession) {
                              const session = JSON.parse(freelancerSession);
                              await markDecisionAsRead(decision._id, session.freelancerId);
                              loadDecisions();
                            }
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Marquer comme lu"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Liste des livrables */}
      <div className="grid gap-4">
        {deliverables.map((deliverable, index) => (
          <motion.div
            key={deliverable.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-8 border-purple-500 mb-6 hover:shadow-2xl transition-shadow duration-200 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-purple-100 text-purple-600 rounded-full p-2 text-xl">📦</span>
              <h3 className="text-2xl font-extrabold text-purple-900 group-hover:text-purple-700 transition-colors">Livrable</h3>
            </div>
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              {/* Informations principales */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {deliverable.title}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {deliverable.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                        deliverable.status
                      )}`}
                    >
                      {getStatusIcon(deliverable.status)}
                      {getStatusText(deliverable.status)}
                    </span>
                  </div>
                </div>

                {/* Détails du livrable */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      Type: {deliverable.type === "file" ? "Fichier" : "Lien"}
                    </span>
                  </div>
                  {deliverable.type === 'design' || deliverable.type === 'code' || deliverable.type === 'documentation' || deliverable.type === 'prototype' ? (
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-xs text-gray-500">
                        Soumis le {new Date(deliverable.submittedDate).toLocaleDateString()}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Contenu */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Contenu :
                  </h4>
                  {deliverable.fileUrl ? (
                    <a
                      href={deliverable.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Link className="w-4 h-4" />
                      {deliverable.fileUrl}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Upload className="w-4 h-4" />
                      {deliverable.description}
                    </div>
                  )}
                </div>

                {/* Feedback */}
                {deliverable.feedback && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Feedback :
                    </h4>
                    <p className="text-sm text-gray-600">
                      {deliverable.feedback}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col justify-center gap-3 lg:w-48">
                {/* زر التعديل */}
                <button
                  onClick={() => handleEdit(deliverable)}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  <Upload className="w-4 h-4" />
                  {deliverable.status === "revision_needed" ? "Réviser" : "Modifier"}
                </button>

                {/* زر التحميل للملفات */}
                {deliverable.fileUrl && !deliverable.fileUrl.startsWith('http') && (
                  <button
                    onClick={() => handleDownload(deliverable)}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </button>
                )}

                {/* زر فتح الرابط */}
                {deliverable.fileUrl && deliverable.fileUrl.startsWith('http') && (
                  <button
                    onClick={() => window.open(deliverable.fileUrl, "_blank")}
                    className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ouvrir
                  </button>
                )}

                {/* زر الحذف */}
                <button
                  onClick={() => handleDelete(deliverable)}
                  className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal de soumission */}
      {showSubmitModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <Send className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold">
                {editingDeliverable ? 'Modifier le livrable' : 'Soumettre un livrable'}
              </h3>
            </div>

            <div className="space-y-4">
              {/* Sélection du projet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projet *
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Sélectionnez un projet</option>
                  {activeProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du livrable *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Fiche technique - Phase 1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre livrable..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              {/* Type de soumission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de soumission
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="file"
                      checked={submissionType === "file"}
                      onChange={(e) => {
                        setSubmissionType(e.target.value as "file");
                        setDeliverableType("file");
                      }}
                      className="mr-2"
                    />
                    <Upload className="w-4 h-4 mr-1" />
                    Fichier
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="link"
                      checked={submissionType === "link"}
                      onChange={(e) => {
                        setSubmissionType(e.target.value as "link");
                        setDeliverableType("link");
                      }}
                      className="mr-2"
                    />
                    <Link className="w-4 h-4 mr-1" />
                    Lien
                  </label>
                </div>
              </div>

              {/* Upload de fichier */}
              {submissionType === "file" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fichier *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="w-full"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.zip,.txt,.csv"
                    />
                    {selectedFile && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-700">
                          <strong>Fichier sélectionné:</strong> {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Taille: {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Types supportés: PDF, Word, Excel, PowerPoint, Images, ZIP, TXT, CSV (Max: 50MB)
                  </p>
                </div>
              )}

              {/* URL pour les liens */}
              {submissionType === "link" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL du document *
                  </label>
                  <input
                    type="url"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Ex: https://docs.google.com/document/d/..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !selectedProject ||
                  !title.trim() ||
                  !description.trim() ||
                  (submissionType === 'file' && !selectedFile && !editingDeliverable) ||
                  (submissionType === 'link' && !content.trim())
                }
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editingDeliverable ? 'Modification...' : 'Soumission...'}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {editingDeliverable ? 'Modifier' : 'Soumettre'}
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  resetForm();
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {deliverables.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Aucun livrable
          </h3>
          <p className="text-gray-500">
            Commencez par soumettre votre premier livrable
          </p>
        </div>
      )}
    </div>
  );
};

export default DeliverablesTab;
