import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Star,
  Award,
  FileText,
  Download,
  Mail,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  PlusCircle,
  UserPlus,
  FolderPlus,
  MessageSquarePlus,
  Edit,
  Trash2,
} from "lucide-react";
import {
  getFormationsCoAnimees,
  getFormationById,
  addFormation,
  updateFormation,
  deleteFormation,
  addParticipant,
  addResource,
  updateResource,
  deleteResource,
  addFeedback,
  updateFeedback,
  deleteFeedback,
  addEvent,
  updateEvent,
  deleteEvent,
  updateCertificateInfo,
  FormationCoAnimee,
  CertificateInfo,
  CertificateCategory,
  EventItem,
} from "../../services/partnershipFormationsCoAnimeesService";
import CreateFormationModal from "../../components/partnership/CreateFormationModal";

// Types pour les filtres
type FilterStatus = "all" | "with-participants" | "with-certificate" | "recent";
type SortBy = "date" | "participants" | "rating";

const PartenaireFormationsCoAnimeesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formations, setFormations] = useState<FormationCoAnimee[]>([]);
  const [filteredFormations, setFilteredFormations] = useState<
    FormationCoAnimee[]
  >([]);
  const [selectedFormation, setSelectedFormation] =
    useState<FormationCoAnimee | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [isAddFeedbackOpen, setIsAddFeedbackOpen] = useState(false);

  // Edition formation (inline)
  const [isEditingFormation, setIsEditingFormation] = useState(false);
  const [editFormationData, setEditFormationData] = useState<{
    title: string;
    date: string;
    trainersText: string;
  }>({ title: "", date: "", trainersText: "" });
  const [editFormationError, setEditFormationError] = useState<string>("");

  // Edit participant
  const [editingParticipantId, setEditingParticipantId] = useState<
    string | null
  >(null);
  const [editParticipantData, setEditParticipantData] = useState<{
    name: string;
    email: string;
  }>({ name: "", email: "" });
  const [editParticipantError, setEditParticipantError] = useState<string>("");

  // Edit resource
  const [editingResourceId, setEditingResourceId] = useState<string | null>(
    null
  );
  const [editResourceData, setEditResourceData] = useState<{
    name: string;
    url: string;
  }>({ name: "", url: "" });
  const [editResourceError, setEditResourceError] = useState<string>("");

  // Edit feedback
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(
    null
  );
  const [editFeedbackData, setEditFeedbackData] = useState<{
    author: string;
    rating: number;
    comment: string;
  }>({ author: "", rating: 5, comment: "" });
  const [editFeedbackError, setEditFeedbackError] = useState<string>("");

  // Inline form states
  const [newParticipant, setNewParticipant] = useState<{
    name: string;
    email: string;
  }>({ name: "", email: "" });
  const [participantError, setParticipantError] = useState<string>("");
  const [newResource, setNewResource] = useState<{ name: string; url: string }>(
    { name: "", url: "" }
  );
  const [resourceError, setResourceError] = useState<string>("");
  const [newFeedback, setNewFeedback] = useState<{
    author: string;
    rating: number;
    comment: string;
  }>({ author: "", rating: 5, comment: "" });
  const [feedbackError, setFeedbackError] = useState<string>("");
  const [isAddCertificateOpen, setIsAddCertificateOpen] = useState(false);
  const [newCertificate, setNewCertificate] = useState<CertificateInfo>({
    category: "certificate",
    type: "",
    issuer: "",
  });
  const [certificateError, setCertificateError] = useState<string>("");
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<EventItem, "id">>({
    title: "",
    date: "",
    location: "",
    description: "",
  });
  const [eventError, setEventError] = useState<string>("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventData, setEditEventData] = useState<Omit<EventItem, "id">>({
    title: "",
    date: "",
    location: "",
    description: "",
  });
  const [editEventError, setEditEventError] = useState<string>("");

  // Sync only Create modal with URL so browser back closes it
  useEffect(() => {
    const openCreate = searchParams.get("create") === "1";
    if (openCreate !== isCreateOpen) setIsCreateOpen(openCreate);
  }, [searchParams, isCreateOpen]);

  // Prefill certificate form when switching formation
  useEffect(() => {
    if (selectedFormation?.certificateInfo) {
      setNewCertificate(selectedFormation.certificateInfo);
    } else {
      setNewCertificate({ category: "certificate", type: "", issuer: "" });
    }
  }, [selectedFormation]);

  const setParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === undefined) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: false });
  };

  // Fonction de filtrage et tri
  const filterAndSortFormations = useCallback(() => {
    let filtered = [...formations];

    // Filtrage par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (formation) =>
          formation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formation.trainers.some((trainer) =>
            trainer.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filtrage par statut
    switch (filterStatus) {
      case "with-participants":
        filtered = filtered.filter(
          (formation) => formation.participants.length > 0
        );
        break;
      case "with-certificate":
        filtered = filtered.filter(
          (formation) => formation.certificateAvailable
        );
        break;
      case "recent": {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        filtered = filtered.filter(
          (formation) => new Date(formation.date) >= threeMonthsAgo
        );
        break;
      }
    }

    // Tri
    switch (sortBy) {
      case "date":
        filtered.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case "participants":
        filtered.sort((a, b) => b.participants.length - a.participants.length);
        break;
      case "rating":
        filtered.sort((a, b) => {
          const avgA =
            a.feedbacks.length > 0
              ? a.feedbacks.reduce((sum, f) => sum + f.rating, 0) /
                a.feedbacks.length
              : 0;
          const avgB =
            b.feedbacks.length > 0
              ? b.feedbacks.reduce((sum, f) => sum + f.rating, 0) /
                b.feedbacks.length
              : 0;
          return avgB - avgA;
        });
        break;
    }

    setFilteredFormations(filtered);
  }, [formations, searchTerm, filterStatus, sortBy]);

  useEffect(() => {
    // Charger les formations au montage du composant
    const loadFormations = () => {
      try {
        const formationsData = getFormationsCoAnimees();
        setFormations(formationsData);
      } catch (error) {
        console.error("Erreur lors du chargement des formations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFormations();
  }, []);

  // Effet pour filtrer et trier quand les données ou filtres changent
  useEffect(() => {
    filterAndSortFormations();
  }, [filterAndSortFormations]);

  const handleFormationClick = (formationId: string) => {
    const formation = getFormationById(formationId);
    if (formation) {
      setSelectedFormation(formation);
    }
  };

  const handleBackToList = () => {
    setSelectedFormation(null);
    setIsEditingFormation(false);
    setEditFormationError("");
  };

  const handleBackToEspace = () => {
    navigate("/espace-partenariat");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const getResourceIcon = (fileName: string) => {
    if (fileName.toLowerCase().includes(".pdf")) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (
      fileName.toLowerCase().includes(".pptx") ||
      fileName.toLowerCase().includes(".ppt")
    ) {
      return <FileText className="w-5 h-5 text-orange-500" />;
    }
    return <BookOpen className="w-5 h-5 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des formations...</p>
        </div>
      </div>
    );
  }

  // Vue détaillée d'une formation
  if (selectedFormation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header avec bouton retour */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={handleBackToList}
              className="flex items-center text-purple-600 hover:text-purple-800 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour à la liste
            </button>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedFormation.title}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{formatDate(selectedFormation.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-2" />
                    <span>
                      Formateurs: {selectedFormation.trainers.join(", ")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditingFormation && (
                    <>
                      <button
                        onClick={() => {
                          if (!selectedFormation) return;
                          setEditFormationData({
                            title: selectedFormation.title,
                            date: selectedFormation.date,
                            trainersText: selectedFormation.trainers.join(", "),
                          });
                          setEditFormationError("");
                          setIsEditingFormation(true);
                        }}
                        className="px-3 py-1.5 text-sm rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 inline-flex items-center gap-1 shadow-sm"
                      >
                        <Edit className="w-4 h-4" /> Modifier
                      </button>
                      <button
                        onClick={() => {
                          if (!selectedFormation) return;
                          const ok = window.confirm(
                            "Supprimer cette formation ?"
                          );
                          if (!ok) return;
                          deleteFormation(selectedFormation.id);
                          setFormations((prev) =>
                            prev.filter((f) => f.id !== selectedFormation.id)
                          );
                          setSelectedFormation(null);
                          setIsEditingFormation(false);
                        }}
                        className="px-3 py-1.5 text-sm rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 inline-flex items-center gap-1 shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" /> Supprimer
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isEditingFormation && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Titre de la formation"
                      value={editFormationData.title}
                      onChange={(e) =>
                        setEditFormationData((v) => ({
                          ...v,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      value={editFormationData.date}
                      onChange={(e) =>
                        setEditFormationData((v) => ({
                          ...v,
                          date: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Formateurs (séparés par des virgules)"
                      value={editFormationData.trainersText}
                      onChange={(e) =>
                        setEditFormationData((v) => ({
                          ...v,
                          trainersText: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  {editFormationError && (
                    <p className="text-sm text-red-600 mt-2">
                      {editFormationError}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        if (!selectedFormation) return;
                        if (
                          !editFormationData.title.trim() ||
                          !editFormationData.date.trim()
                        ) {
                          setEditFormationError("Titre et date sont requis");
                          return;
                        }
                        const trainers = editFormationData.trainersText
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean);
                        updateFormation(selectedFormation.id, {
                          title: editFormationData.title.trim(),
                          date: editFormationData.date,
                          trainers,
                        });
                        const updated = getFormationById(selectedFormation.id);
                        if (updated) {
                          setSelectedFormation(updated);
                          setFormations((prev) =>
                            prev.map((f) => (f.id === updated.id ? updated : f))
                          );
                        }
                        setIsEditingFormation(false);
                        setEditFormationError("");
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingFormation(false);
                        setEditFormationError("");
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Participants */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-blue-600" />
                  Participants ({selectedFormation.participants.length})
                </h2>
                <button
                  onClick={() => {
                    setIsAddParticipantOpen(true);
                  }}
                  className="text-sm inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-full shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>

              {isAddParticipantOpen && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nom et prénom"
                      value={newParticipant.name}
                      onChange={(e) =>
                        setNewParticipant((p) => ({
                          ...p,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newParticipant.email}
                      onChange={(e) =>
                        setNewParticipant((p) => ({
                          ...p,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  {participantError && (
                    <p className="text-sm text-red-600 mt-2">
                      {participantError}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        if (!selectedFormation) return;
                        if (
                          !newParticipant.name.trim() ||
                          !newParticipant.email.trim()
                        ) {
                          setParticipantError("Nom et email sont requis");
                          return;
                        }
                        setParticipantError("");
                        addParticipant(selectedFormation.id, {
                          id: `p-${Date.now()}`,
                          name: newParticipant.name.trim(),
                          email: newParticipant.email.trim(),
                        });
                        const updated = getFormationById(selectedFormation.id);
                        if (updated) {
                          setSelectedFormation(updated);
                          setFormations((prev) =>
                            prev.map((f: FormationCoAnimee) =>
                              f.id === updated.id ? updated : f
                            )
                          );
                        }
                        setNewParticipant({ name: "", email: "" });
                        setIsAddParticipantOpen(false);
                      }}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md shadow"
                    >
                      <UserPlus className="w-4 h-4" />
                      Ajouter le participant
                    </button>
                    <button
                      onClick={() => {
                        setIsAddParticipantOpen(false);
                        setNewParticipant({ name: "", email: "" });
                        setParticipantError("");
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {selectedFormation.participants.length > 0 ? (
                <div className="space-y-3">
                  {selectedFormation.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      {editingParticipantId === participant.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Nom et prénom"
                              value={editParticipantData.name}
                              onChange={(e) =>
                                setEditParticipantData((v) => ({
                                  ...v,
                                  name: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <input
                              type="email"
                              placeholder="Email"
                              value={editParticipantData.email}
                              onChange={(e) =>
                                setEditParticipantData((v) => ({
                                  ...v,
                                  email: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          {editParticipantError && (
                            <p className="text-sm text-red-600">
                              {editParticipantError}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (!selectedFormation) return;
                                if (
                                  !editParticipantData.name.trim() ||
                                  !editParticipantData.email.trim()
                                ) {
                                  setEditParticipantError(
                                    "Nom et email sont requis"
                                  );
                                  return;
                                }
                                setEditParticipantError("");
                                updateParticipant(
                                  selectedFormation.id,
                                  participant.id,
                                  {
                                    name: editParticipantData.name.trim(),
                                    email: editParticipantData.email.trim(),
                                  }
                                );
                                const updated = getFormationById(
                                  selectedFormation.id
                                );
                                if (updated) {
                                  setSelectedFormation(updated);
                                  setFormations((prev) =>
                                    prev.map((f: FormationCoAnimee) =>
                                      f.id === updated.id ? updated : f
                                    )
                                  );
                                }
                                setEditingParticipantId(null);
                              }}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md shadow"
                            >
                              <Edit className="w-4 h-4" /> Enregistrer
                            </button>
                            <button
                              onClick={() => {
                                setEditingParticipantId(null);
                                setEditParticipantError("");
                              }}
                              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="w-8 h-8 text-gray-400 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {participant.name}
                              </p>
                              <div className="flex items-center text-gray-600 text-sm">
                                <Mail className="w-4 h-4 mr-1" />
                                <a
                                  href={`mailto:${participant.email}`}
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  {participant.email}
                                </a>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingParticipantId(participant.id);
                                setEditParticipantData({
                                  name: participant.name,
                                  email: participant.email,
                                });
                              }}
                              className="px-3 py-1.5 text-sm rounded-full bg-white border hover:bg-gray-50 inline-flex items-center gap-1 shadow-sm"
                            >
                              <Edit className="w-4 h-4" /> Modifier
                            </button>
                            <button
                              onClick={() => {
                                if (!selectedFormation) return;
                                const ok = window.confirm(
                                  "Supprimer ce participant ?"
                                );
                                if (!ok) return;
                                deleteParticipant(
                                  selectedFormation.id,
                                  participant.id
                                );
                                const updated = getFormationById(
                                  selectedFormation.id
                                );
                                if (updated) {
                                  setSelectedFormation(updated);
                                  setFormations((prev) =>
                                    prev.map((f: FormationCoAnimee) =>
                                      f.id === updated.id ? updated : f
                                    )
                                  );
                                }
                              }}
                              className="px-3 py-1.5 text-sm rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 inline-flex items-center gap-1 shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" /> Supprimer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Aucun participant inscrit pour le moment
                </p>
              )}
            </motion.div>

            {/* Ressources pédagogiques */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BookOpen className="w-6 h-6 mr-2 text-green-600" />
                  Ressources pédagogiques ({selectedFormation.resources.length})
                </h2>
                <button
                  onClick={() => {
                    setIsAddResourceOpen(true);
                  }}
                  className="text-sm inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-full shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>

              {isAddResourceOpen && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nom de la ressource"
                      value={newResource.name}
                      onChange={(e) =>
                        setNewResource((r) => ({ ...r, name: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="url"
                      placeholder="URL"
                      value={newResource.url}
                      onChange={(e) =>
                        setNewResource((r) => ({ ...r, url: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  {resourceError && (
                    <p className="text-sm text-red-600 mt-2">{resourceError}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        if (!selectedFormation) return;
                        if (
                          !newResource.name.trim() ||
                          !newResource.url.trim()
                        ) {
                          setResourceError("Nom et URL sont requis");
                          return;
                        }
                        setResourceError("");
                        addResource(selectedFormation.id, {
                          name: newResource.name.trim(),
                          url: newResource.url.trim(),
                        });
                        const updated = getFormationById(selectedFormation.id);
                        if (updated) {
                          setSelectedFormation(updated);
                          setFormations((prev) =>
                            prev.map((f: FormationCoAnimee) =>
                              f.id === updated.id ? updated : f
                            )
                          );
                        }
                        setNewResource({ name: "", url: "" });
                        setIsAddResourceOpen(false);
                      }}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md shadow"
                    >
                      <FolderPlus className="w-4 h-4" />
                      Ajouter la ressource
                    </button>
                    <button
                      onClick={() => {
                        setIsAddResourceOpen(false);
                        setNewResource({ name: "", url: "" });
                        setResourceError("");
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {selectedFormation.resources.length > 0 ? (
                <div className="space-y-3">
                  {selectedFormation.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      {editingResourceId === resource.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Nom de la ressource"
                              value={editResourceData.name}
                              onChange={(e) =>
                                setEditResourceData((v) => ({
                                  ...v,
                                  name: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <input
                              type="url"
                              placeholder="URL"
                              value={editResourceData.url}
                              onChange={(e) =>
                                setEditResourceData((v) => ({
                                  ...v,
                                  url: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          {editResourceError && (
                            <p className="text-sm text-red-600">
                              {editResourceError}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (!selectedFormation) return;
                                if (
                                  !editResourceData.name.trim() ||
                                  !editResourceData.url.trim()
                                ) {
                                  setEditResourceError(
                                    "Nom et URL sont requis"
                                  );
                                  return;
                                }
                                setEditResourceError("");
                                updateResource(
                                  selectedFormation.id,
                                  resource.id,
                                  {
                                    name: editResourceData.name.trim(),
                                    url: editResourceData.url.trim(),
                                  }
                                );
                                const updated = getFormationById(
                                  selectedFormation.id
                                );
                                if (updated) {
                                  setSelectedFormation(updated);
                                  setFormations((prev) =>
                                    prev.map((f: FormationCoAnimee) =>
                                      f.id === updated.id ? updated : f
                                    )
                                  );
                                }
                                setEditingResourceId(null);
                              }}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md shadow"
                            >
                              <Edit className="w-4 h-4" /> Enregistrer
                            </button>
                            <button
                              onClick={() => {
                                setEditingResourceId(null);
                                setEditResourceError("");
                              }}
                              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3 min-w-0">
                          <div className="flex items-center min-w-0">
                            {getResourceIcon(resource.name)}
                            <span className="ml-3 font-medium text-gray-900 truncate max-w-[50vw] sm:max-w-md md:max-w-lg">
                              {resource.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-nowrap flex-shrink-0">
                            <button
                              onClick={() => {
                                setEditingResourceId(resource.id);
                                setEditResourceData({
                                  name: resource.name,
                                  url: resource.url,
                                });
                              }}
                              className="px-3 py-1.5 text-sm bg-white border rounded-md hover:bg-gray-50 inline-flex items-center gap-1"
                            >
                              <Edit className="w-4 h-4" /> Modifier
                            </button>
                            <button
                              onClick={() => {
                                if (!selectedFormation) return;
                                const ok = window.confirm(
                                  "Supprimer cette ressource ?"
                                );
                                if (!ok) return;
                                deleteResource(
                                  selectedFormation.id,
                                  resource.id
                                );
                                const updated = getFormationById(
                                  selectedFormation.id
                                );
                                if (updated) {
                                  setSelectedFormation(updated);
                                  setFormations((prev) =>
                                    prev.map((f: FormationCoAnimee) =>
                                      f.id === updated.id ? updated : f
                                    )
                                  );
                                }
                              }}
                              className="px-3 py-1.5 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" /> Supprimer
                            </button>
                            <button
                              onClick={() => {
                                // Simulation du téléchargement
                                alert(
                                  `Téléchargement de ${resource.name} en cours...`
                                );
                                console.log("Téléchargement:", resource.url);
                              }}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                            >
                              <Download className="w-4 h-4" /> Télécharger
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Aucune ressource disponible
                </p>
              )}
            </motion.div>

            {/* Feedbacks */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Star className="w-6 h-6 mr-2 text-yellow-600" />
                  Feedbacks ({selectedFormation.feedbacks.length})
                </h2>
                <button
                  onClick={() => {
                    setIsAddFeedbackOpen(true);
                  }}
                  className="text-sm inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-full shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>

              {isAddFeedbackOpen && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Auteur"
                      value={newFeedback.author}
                      onChange={(e) =>
                        setNewFeedback((fb) => ({
                          ...fb,
                          author: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      min={1}
                      max={5}
                      placeholder="Note (1-5)"
                      value={newFeedback.rating}
                      onChange={(e) =>
                        setNewFeedback((fb) => ({
                          ...fb,
                          rating: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Commentaire"
                      value={newFeedback.comment}
                      onChange={(e) =>
                        setNewFeedback((fb) => ({
                          ...fb,
                          comment: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  {feedbackError && (
                    <p className="text-sm text-red-600 mt-2">{feedbackError}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        if (!selectedFormation) return;
                        if (
                          !newFeedback.author.trim() ||
                          !newFeedback.comment.trim() ||
                          newFeedback.rating < 1 ||
                          newFeedback.rating > 5
                        ) {
                          setFeedbackError(
                            "Auteur, commentaire et note (1-5) sont requis"
                          );
                          return;
                        }
                        setFeedbackError("");
                        addFeedback(selectedFormation.id, {
                          author: newFeedback.author.trim(),
                          comment: newFeedback.comment.trim(),
                          rating: newFeedback.rating,
                        });
                        const updated = getFormationById(selectedFormation.id);
                        if (updated) {
                          setSelectedFormation(updated);
                          setFormations((prev) =>
                            prev.map((f: FormationCoAnimee) =>
                              f.id === updated.id ? updated : f
                            )
                          );
                        }
                        setNewFeedback({ author: "", rating: 5, comment: "" });
                        setIsAddFeedbackOpen(false);
                      }}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md shadow"
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                      Ajouter le feedback
                    </button>
                    <button
                      onClick={() => {
                        setIsAddFeedbackOpen(false);
                        setNewFeedback({ author: "", rating: 5, comment: "" });
                        setFeedbackError("");
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {selectedFormation.feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {selectedFormation.feedbacks.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      {editingFeedbackId === feedback.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                              type="text"
                              placeholder="Auteur"
                              value={editFeedbackData.author}
                              onChange={(e) =>
                                setEditFeedbackData((v) => ({
                                  ...v,
                                  author: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <input
                              type="number"
                              min={1}
                              max={5}
                              placeholder="Note (1-5)"
                              value={editFeedbackData.rating}
                              onChange={(e) =>
                                setEditFeedbackData((v) => ({
                                  ...v,
                                  rating: Number(e.target.value),
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <input
                              type="text"
                              placeholder="Commentaire"
                              value={editFeedbackData.comment}
                              onChange={(e) =>
                                setEditFeedbackData((v) => ({
                                  ...v,
                                  comment: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          {editFeedbackError && (
                            <p className="text-sm text-red-600">
                              {editFeedbackError}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (!selectedFormation) return;
                                if (
                                  !editFeedbackData.author.trim() ||
                                  !editFeedbackData.comment.trim() ||
                                  editFeedbackData.rating < 1 ||
                                  editFeedbackData.rating > 5
                                ) {
                                  setEditFeedbackError(
                                    "Auteur, commentaire et note (1-5) sont requis"
                                  );
                                  return;
                                }
                                setEditFeedbackError("");
                                updateFeedback(
                                  selectedFormation.id,
                                  feedback.id,
                                  {
                                    author: editFeedbackData.author.trim(),
                                    comment: editFeedbackData.comment.trim(),
                                    rating: editFeedbackData.rating,
                                  }
                                );
                                const updated = getFormationById(
                                  selectedFormation.id
                                );
                                if (updated) {
                                  setSelectedFormation(updated);
                                  setFormations((prev) =>
                                    prev.map((f: FormationCoAnimee) =>
                                      f.id === updated.id ? updated : f
                                    )
                                  );
                                }
                                setEditingFeedbackId(null);
                              }}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md shadow"
                            >
                              <Edit className="w-4 h-4" /> Enregistrer
                            </button>
                            <button
                              onClick={() => {
                                setEditingFeedbackId(null);
                                setEditFeedbackError("");
                              }}
                              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              {feedback.author}
                            </span>
                            <div className="flex items-center">
                              {renderStars(feedback.rating)}
                              <span className="ml-2 text-sm text-gray-600">
                                ({feedback.rating}/5)
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3">
                            {feedback.comment}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingFeedbackId(feedback.id);
                                setEditFeedbackData({
                                  author: feedback.author,
                                  rating: feedback.rating,
                                  comment: feedback.comment,
                                });
                              }}
                              className="px-3 py-1.5 text-sm bg-white border rounded-md hover:bg-gray-50 inline-flex items-center gap-1"
                            >
                              <Edit className="w-4 h-4" /> Modifier
                            </button>
                            <button
                              onClick={() => {
                                if (!selectedFormation) return;
                                const ok = window.confirm(
                                  "Supprimer ce feedback ?"
                                );
                                if (!ok) return;
                                deleteFeedback(
                                  selectedFormation.id,
                                  feedback.id
                                );
                                const updated = getFormationById(
                                  selectedFormation.id
                                );
                                if (updated) {
                                  setSelectedFormation(updated);
                                  setFormations((prev) =>
                                    prev.map((f: FormationCoAnimee) =>
                                      f.id === updated.id ? updated : f
                                    )
                                  );
                                }
                              }}
                              className="px-3 py-1.5 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" /> Supprimer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Aucun feedback disponible
                </p>
              )}
            </motion.div>

            {/* Événements & Séminaires */}
            {selectedFormation.events &&
              selectedFormation.events.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-white rounded-lg shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <Calendar className="w-6 h-6 mr-2 text-indigo-600" />
                      Événements & Séminaires (
                      {selectedFormation.events
                        ? selectedFormation.events.length
                        : 0}
                      )
                    </h2>
                    <button
                      onClick={() => setIsAddEventOpen((o) => !o)}
                      className="text-sm inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-full shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>{isAddEventOpen ? "Fermer" : "Ajouter"}</span>
                    </button>
                  </div>

                  {isAddEventOpen && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Titre de l'événement"
                          value={newEvent.title}
                          onChange={(e) =>
                            setNewEvent((v) => ({
                              ...v,
                              title: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <input
                          type="date"
                          placeholder="Date"
                          value={newEvent.date}
                          onChange={(e) =>
                            setNewEvent((v) => ({ ...v, date: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Lieu (optionnel)"
                          value={newEvent.location || ""}
                          onChange={(e) =>
                            setNewEvent((v) => ({
                              ...v,
                              location: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Description (optionnel)"
                          value={newEvent.description || ""}
                          onChange={(e) =>
                            setNewEvent((v) => ({
                              ...v,
                              description: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      {eventError && (
                        <p className="text-sm text-red-600 mt-2">
                          {eventError}
                        </p>
                      )}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => {
                            if (!selectedFormation) return;
                            if (
                              !newEvent.title.trim() ||
                              !newEvent.date.trim()
                            ) {
                              setEventError("Titre et date sont requis");
                              return;
                            }
                            setEventError("");
                            addEvent(selectedFormation.id, {
                              title: newEvent.title.trim(),
                              date: newEvent.date,
                              location: newEvent.location?.trim() || undefined,
                              description:
                                newEvent.description?.trim() || undefined,
                            });
                            const updated = getFormationById(
                              selectedFormation.id
                            );
                            if (updated) {
                              setSelectedFormation(updated);
                              setFormations((prev) =>
                                prev.map((f: FormationCoAnimee) =>
                                  f.id === updated.id ? updated : f
                                )
                              );
                            }
                            setIsAddEventOpen(false);
                            setNewEvent({
                              title: "",
                              date: "",
                              location: "",
                              description: "",
                            });
                          }}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md shadow"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Ajouter l'événement
                        </button>
                        <button
                          onClick={() => {
                            setIsAddEventOpen(false);
                            setEventError("");
                            setNewEvent({
                              title: "",
                              date: "",
                              location: "",
                              description: "",
                            });
                          }}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedFormation.events &&
                  selectedFormation.events.length > 0 ? (
                    <div className="space-y-3">
                      {selectedFormation.events.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-3 bg-gray-50 rounded-lg border"
                        >
                          {editingEventId === ev.id ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  placeholder="Titre de l'événement"
                                  value={editEventData.title}
                                  onChange={(e) =>
                                    setEditEventData((v) => ({
                                      ...v,
                                      title: e.target.value,
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <input
                                  type="date"
                                  value={editEventData.date}
                                  onChange={(e) =>
                                    setEditEventData((v) => ({
                                      ...v,
                                      date: e.target.value,
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <input
                                  type="text"
                                  placeholder="Lieu (optionnel)"
                                  value={editEventData.location || ""}
                                  onChange={(e) =>
                                    setEditEventData((v) => ({
                                      ...v,
                                      location: e.target.value,
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <input
                                  type="text"
                                  placeholder="Description (optionnel)"
                                  value={editEventData.description || ""}
                                  onChange={(e) =>
                                    setEditEventData((v) => ({
                                      ...v,
                                      description: e.target.value,
                                    }))
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                              </div>
                              {editEventError && (
                                <p className="text-sm text-red-600">
                                  {editEventError}
                                </p>
                              )}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (!selectedFormation) return;
                                    if (
                                      !editEventData.title.trim() ||
                                      !editEventData.date.trim()
                                    ) {
                                      setEditEventError(
                                        "Titre et date sont requis"
                                      );
                                      return;
                                    }
                                    setEditEventError("");
                                    updateEvent(selectedFormation.id, ev.id, {
                                      title: editEventData.title.trim(),
                                      date: editEventData.date,
                                      location:
                                        editEventData.location?.trim() ||
                                        undefined,
                                      description:
                                        editEventData.description?.trim() ||
                                        undefined,
                                    });
                                    const updated = getFormationById(
                                      selectedFormation.id
                                    );
                                    if (updated) {
                                      setSelectedFormation(updated);
                                      setFormations((prev) =>
                                        prev.map((f: FormationCoAnimee) =>
                                          f.id === updated.id ? updated : f
                                        )
                                      );
                                    }
                                    setEditingEventId(null);
                                  }}
                                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md shadow"
                                >
                                  <Edit className="w-4 h-4" />
                                  Enregistrer
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingEventId(null);
                                    setEditEventError("");
                                  }}
                                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {ev.title}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {formatDate(ev.date)}
                                    {ev.location ? ` • ${ev.location}` : ""}
                                  </p>
                                  {ev.description && (
                                    <p className="text-sm text-gray-700 mt-1">
                                      {ev.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingEventId(ev.id);
                                    setEditEventData({
                                      title: ev.title,
                                      date: ev.date,
                                      location: ev.location || "",
                                      description: ev.description || "",
                                    });
                                  }}
                                  className="px-3 py-1.5 text-sm rounded-full bg-white border hover:bg-gray-50 inline-flex items-center gap-1 shadow-sm"
                                >
                                  <Edit className="w-4 h-4" /> Modifier
                                </button>
                                <button
                                  onClick={() => {
                                    if (!selectedFormation) return;
                                    const ok = window.confirm(
                                      "Supprimer cet événement ?"
                                    );
                                    if (!ok) return;
                                    deleteEvent(selectedFormation.id, ev.id);
                                    const updated = getFormationById(
                                      selectedFormation.id
                                    );
                                    if (updated) {
                                      setSelectedFormation(updated);
                                      setFormations((prev) =>
                                        prev.map((f: FormationCoAnimee) =>
                                          f.id === updated.id ? updated : f
                                        )
                                      );
                                    }
                                  }}
                                  className="px-3 py-1.5 text-sm rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 inline-flex items-center gap-1 shadow-sm"
                                >
                                  <Trash2 className="w-4 h-4" /> Supprimer
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Aucun événement pour le moment
                    </p>
                  )}
                </motion.div>
              )}

            {/* Certificat */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Award className="w-6 h-6 mr-2 text-purple-600" />
                  Certificat
                </h2>
                <button
                  onClick={() => setIsAddCertificateOpen((o) => !o)}
                  className="text-sm inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-full shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    {isAddCertificateOpen
                      ? "Fermer"
                      : selectedFormation.certificateAvailable
                      ? "Modifier"
                      : "Ajouter"}
                  </span>
                </button>
              </div>

              {isAddCertificateOpen && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                      value={newCertificate.category}
                      onChange={(e) =>
                        setNewCertificate((c) => ({
                          ...c,
                          category: e.target.value as CertificateCategory,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="certificate">Certificat</option>
                      <option value="diploma">Diplôme</option>
                      <option value="attestation">Attestation</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Type (ex: de formation / de participation / de réussite)"
                      value={newCertificate.type}
                      onChange={(e) =>
                        setNewCertificate((c) => ({
                          ...c,
                          type: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Organisme émetteur du certificat"
                      value={newCertificate.issuer}
                      onChange={(e) =>
                        setNewCertificate((c) => ({
                          ...c,
                          issuer: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  {certificateError && (
                    <p className="text-sm text-red-600 mt-2">
                      {certificateError}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        if (!selectedFormation) return;
                        if (
                          !newCertificate.type.trim() ||
                          !newCertificate.issuer.trim()
                        ) {
                          setCertificateError(
                            "Type et l'organisme émetteur sont requis"
                          );
                          return;
                        }
                        setCertificateError("");
                        const updated = updateCertificateInfo(
                          selectedFormation.id,
                          {
                            category: newCertificate.category,
                            type: newCertificate.type.trim(),
                            issuer: newCertificate.issuer.trim(),
                          }
                        );
                        if (updated) {
                          setSelectedFormation(updated);
                          setFormations((prev) =>
                            prev.map((f: FormationCoAnimee) =>
                              f.id === updated.id ? updated : f
                            )
                          );
                        }
                        setIsAddCertificateOpen(false);
                      }}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md shadow"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Enregistrer
                    </button>
                    <button
                      onClick={() => {
                        setIsAddCertificateOpen(false);
                        setCertificateError("");
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              <div className="py-4">
                {selectedFormation.certificateAvailable ? (
                  <div className="space-y-3 text-gray-800">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Certificat disponible</span>
                    </div>
                    {selectedFormation.certificateInfo && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg border">
                        <div>
                          <p className="text-xs text-gray-500">Catégorie</p>
                          <p className="font-medium capitalize">
                            {selectedFormation.certificateInfo.category ===
                            "certificate"
                              ? "Certificat"
                              : selectedFormation.certificateInfo.category ===
                                "diploma"
                              ? "Diplôme"
                              : "Attestation"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Type</p>
                          <p className="font-medium">
                            {selectedFormation.certificateInfo.type}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            Organisme émetteur du certificat
                          </p>
                          <p className="font-medium">
                            {selectedFormation.certificateInfo.issuer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Certificat non disponible</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Vue liste des formations
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={handleBackToEspace}
            className="flex items-center text-purple-600 hover:text-purple-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour à l'Espace Partenariat
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Formations Co-animées
          </h1>
          <p className="text-gray-600">
            Gérez vos formations en collaboration avec d'autres formateurs
          </p>
        </motion.div>

        {/* Actions */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => {
              setIsCreateOpen(true);
              setParam("create", "1");
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-full shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ajouter formation</span>
          </button>
        </div>

        {/* Statistiques rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Formations
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formations.length}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Participants
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formations.reduce(
                    (sum, f) => sum + f.participants.length,
                    0
                  )}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Certificats</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formations.filter((f) => f.certificateAvailable).length}
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Note Moyenne
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(() => {
                    const allRatings = formations.flatMap((f) =>
                      f.feedbacks.map((fb) => fb.rating)
                    );
                    return allRatings.length > 0
                      ? (
                          allRatings.reduce((sum, rating) => sum + rating, 0) /
                          allRatings.length
                        ).toFixed(1)
                      : "0.0";
                  })()}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </motion.div>

        {/* Barre de recherche et filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Barre de recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par titre ou formateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtres</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10"
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Statut
                        </label>
                        <select
                          value={filterStatus}
                          onChange={(e) =>
                            setFilterStatus(e.target.value as FilterStatus)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="all">Toutes les formations</option>
                          <option value="with-participants">
                            Avec participants
                          </option>
                          <option value="with-certificate">
                            Avec certificat
                          </option>
                          <option value="recent">Récentes (3 mois)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trier par
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as SortBy)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="date">Date (plus récent)</option>
                          <option value="participants">
                            Nombre de participants
                          </option>
                          <option value="rating">Note moyenne</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="text-sm text-gray-600">
                {filteredFormations.length} formation
                {filteredFormations.length > 1 ? "s" : ""} trouvée
                {filteredFormations.length > 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Liste des formations */}
        {filteredFormations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFormations.map((formation, index) => (
              <motion.div
                key={formation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleFormationClick(formation.id)}
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {formation.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {formatDate(formation.date)}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {formation.trainers.join(", ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{formation.participants.length} participants</span>
                      <span>{formation.resources.length} ressources</span>
                    </div>

                    {formation.certificateAvailable && (
                      <Award className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
                  <button className="text-purple-600 hover:text-purple-800 font-medium text-sm transition-colors">
                    Voir les détails →
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFormation(formation);
                        setEditFormationData({
                          title: formation.title,
                          date: formation.date,
                          trainersText: formation.trainers.join(", "),
                        });
                        setIsEditingFormation(true);
                        setEditFormationError("");
                      }}
                      className="px-3 py-1.5 text-xs bg-white border rounded-md hover:bg-gray-50 inline-flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Modifier
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const ok = window.confirm(
                          "Supprimer cette formation ?"
                        );
                        if (!ok) return;
                        deleteFormation(formation.id);
                        setFormations((prev) =>
                          prev.filter((f) => f.id !== formation.id)
                        );
                        if (selectedFormation?.id === formation.id) {
                          setSelectedFormation(null);
                        }
                      }}
                      className="px-3 py-1.5 text-xs bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Aucune formation disponible
            </h3>
            <p className="text-gray-500">
              Les formations co-animées apparaîtront ici une fois créées.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setIsCreateOpen(true);
                  setParam("create", "1");
                }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-full shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Ajouter formation</span>
              </button>
            </div>
          </motion.div>
        )}
        {/* Create Formation Modal */}
        <CreateFormationModal
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            setParam("create");
          }}
          onCreate={(payload) => {
            const created = addFormation(payload);
            setFormations((prev) => [created, ...prev]);
            setIsCreateOpen(false);
            setParam("create");
          }}
        />
        {/* Inline forms replace modals for add actions */}
      </div>
    </div>
  );
};

export default PartenaireFormationsCoAnimeesPage;
