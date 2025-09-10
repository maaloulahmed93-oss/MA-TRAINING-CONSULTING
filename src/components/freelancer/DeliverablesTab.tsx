import { useState } from "react";
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
} from "lucide-react";
import { Deliverable, ProjectStatus, DeliverableType } from "../../types/freelancer";
import {
  getDeliverables,
  submitDeliverable,
  getProjectStatus,
} from "../../services/freelancerData";

const DeliverablesTab: React.FC = () => {
  const [deliverables, setDeliverables] = useState<Deliverable[]>(
    getDeliverables()
  );
  const [projects, setProjects] = useState<ProjectStatus[]>(getProjectStatus());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deliverableType, setDeliverableType] = useState<
    "design" | "code" | "documentation" | "prototype" | "file" | "link"
  >("design");
  const [submissionType, setSubmissionType] = useState<"file" | "link">("file");
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState<
    "all" | "pending" | "accepted" | "refused"
  >("all");

  const filteredDeliverables = deliverables.filter(
    (deliverable) => filter === "all" || deliverable.status === filter
  );

  const activeProjects = projects.filter(
    (project) => project.status === "in_progress"
  );

  const handleSubmit = () => {
    if (
      selectedProject &&
      title.trim() &&
      description.trim() &&
      content.trim()
    ) {
      if (submissionType === "file") {
        submitDeliverable(
          selectedProject,
          title,
          description,
          deliverableType,
          content
        );
      } else {
        submitDeliverable(
          selectedProject,
          title,
          description,
          deliverableType,
          undefined,
          content
        );
      }
      setDeliverables(getDeliverables());
      setProjects(getProjectStatus());
      setShowSubmitModal(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedProject("");
    setTitle("");
    setDescription("");
    setDeliverableType("design");
    setSubmissionType("file");
    setContent("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-orange-600 bg-orange-100";
      case "accepted":
        return "text-green-600 bg-green-100";
      case "refused":
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
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "refused":
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
      case "accepted":
        return "Accepté";
      case "refused":
        return "Refusé";
      case "revision_needed":
        return "Révision demandée";
      default:
        return "Inconnu";
    }
  };

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
          <div className="flex gap-2">
            {(["all", "pending", "accepted", "refused"] as const).map(
              (filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterType
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {filterType === "all"
                    ? "Tous"
                    : filterType === "pending"
                    ? "En attente"
                    : filterType === "accepted"
                    ? "Acceptés"
                    : "Refusés"}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Nouveau livrable
          </button>
        </div>
      </div>

      {/* Liste des livrables */}
      <div className="grid gap-4">
        {filteredDeliverables.map((deliverable, index) => (
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
                {deliverable.status === "revision_needed" && (
                  <button
                    onClick={() => {
                      setSelectedProject(deliverable.projectId);
                      setTitle(deliverable.title);
                      setDescription(deliverable.description);
                      setDeliverableType(
                        (['design','code','documentation','prototype','file','link'].includes(deliverable.type as string)
                          ? (deliverable.type as DeliverableType)
                          : 'design')
                      );
                      setContent(deliverable.content ?? '');
                      setShowSubmitModal(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Réviser
                  </button>
                )}

                {deliverable.type === "link" && (
                  <button
                    onClick={() => window.open(deliverable.content, "_blank")}
                    className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ouvrir
                  </button>
                )}
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
              <h3 className="text-xl font-bold">Soumettre un livrable</h3>
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

              {/* Type de livrable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de livrable
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="file"
                      checked={deliverableType === "file"}
                      onChange={(e) =>
                        setDeliverableType(e.target.value as "file")
                      }
                      className="mr-2"
                    />
                    <Upload className="w-4 h-4 mr-1" />
                    Fichier
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="link"
                      checked={deliverableType === "link"}
                      onChange={(e) =>
                        setDeliverableType(e.target.value as "link")
                      }
                      className="mr-2"
                    />
                    <Link className="w-4 h-4 mr-1" />
                    Lien
                  </label>
                </div>
              </div>

              {/* Contenu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {deliverableType === "file"
                    ? "Nom du fichier *"
                    : "URL du document *"}
                </label>
                <input
                  type={deliverableType === "link" ? "url" : "text"}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    deliverableType === "file"
                      ? "Ex: rapport_audit_iso9001.pdf"
                      : "Ex: https://docs.google.com/document/d/..."
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                {deliverableType === "file" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Note: En production, un système d'upload de fichiers serait
                    intégré ici
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={
                  !selectedProject ||
                  !title.trim() ||
                  !description.trim() ||
                  !content.trim()
                }
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Soumettre
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

      {filteredDeliverables.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Aucun livrable{" "}
            {filter !== "all"
              ? filter === "pending"
                ? "en attente"
                : filter === "accepted"
                ? "accepté"
                : "refusé"
              : ""}
          </h3>
          <p className="text-gray-500">
            {filter === "all"
              ? "Commencez par soumettre votre premier livrable"
              : "Changez de filtre pour voir d'autres livrables"}
          </p>
        </div>
      )}
    </div>
  );
};

export default DeliverablesTab;
