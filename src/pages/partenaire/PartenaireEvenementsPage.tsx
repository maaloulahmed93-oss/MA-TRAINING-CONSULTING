import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  FileText,
  Download,
  Mail,
  Plus,
  BarChart3,
  Clock,
  Star,
  TrendingUp,
  Video,
  BookOpen,
  Presentation,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  getEvenements,
  getEvenementById,
  getEvenementsStats,
  addEvenement,
  addParticipant,
  addResource,
  updateEvenement,
  deleteEvenement,
  removeParticipant,
  removeResource,
  EvenementPartenariat,
} from "../../services/partnershipEvenementsService";
import { getEnterpriseEvents } from "../../services/enterpriseApiService";
import { getCurrentPartnerId } from "../../services/partnershipAuth";

const PartenaireEvenementsPage: React.FC = () => {
  const navigate = useNavigate();
  const [evenements, setEvenements] = useState<EvenementPartenariat[]>([]);
  const [selectedEvenement, setSelectedEvenement] =
    useState<EvenementPartenariat | null>(null);
  const [currentView, setCurrentView] = useState<"list" | "details">("list");
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    dateLocal: "",
    type: "Séminaire" as "Séminaire" | "Webinaire" | "Atelier",
    location: "",
    description: "",
    duration: 2, // Durée en heures
    maxParticipants: 50
  });
  const [addError, setAddError] = useState<string>("");
  const [showAddResource, setShowAddResource] = useState(false);
  const [newResource, setNewResource] = useState({ name: "", url: "" });
  const [resourceError, setResourceError] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    dateLocal: "",
    type: "Séminaire" as "Séminaire" | "Webinaire" | "Atelier",
    location: "",
    description: "",
  });
  // Inline edit states for participants/resources
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null);
  const [participantDraft, setParticipantDraft] = useState<{ name: string; email: string }>({ name: "", email: "" });
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [resourceDraft, setResourceDraft] = useState<{ name: string; url: string }>({ name: "", url: "" });

  useEffect(() => {
    // Charger les événements au montage du composant
    const loadEvenements = async () => {
      const currentPartnerId = getCurrentPartnerId();
      if (!currentPartnerId) {
        navigate('/espace-partenariat');
        return;
      }

      try {
        console.log("🚀 Chargement des événements depuis Enterprise API...");
        
        // Charger depuis Enterprise API d'abord
        const enterpriseEvents = await getEnterpriseEvents(currentPartnerId);
        console.log(`📅 ${enterpriseEvents.length} événements chargés depuis Enterprise API`);
        setEvenements(enterpriseEvents);
        
      } catch (error) {
        console.error("❌ Erreur Enterprise API, fallback vers localStorage:", error);
        
        // Fallback vers localStorage si Enterprise API échoue
        try {
          const evenementsData = getEvenements();
          console.log("📅 Événements chargés depuis localStorage:", evenementsData);
          setEvenements(evenementsData);
        } catch (fallbackError) {
          console.error("❌ Erreur localStorage aussi:", fallbackError);
          setEvenements([]);
        }
      } finally {
        setLoading(false);
        console.log("✅ Chargement terminé");
      }
    };

    loadEvenements();
  }, [navigate]);

  const handleEvenementClick = (evenementId: string) => {
    const evenement = getEvenementById(evenementId);
    if (evenement) {
      setSelectedEvenement(evenement);
      setCurrentView("details");
    }
  };

  const handleBackToList = () => {
    setSelectedEvenement(null);
    setCurrentView("list");
    setIsEditing(false);
  };

  const handleAddParticipant = () => {
    if (!selectedEvenement || !newParticipant.name || !newParticipant.email)
      return;

    try {
      const updatedEvenement = addParticipant(
        selectedEvenement.id,
        newParticipant
      );
      if (updatedEvenement) {
        setEvenements((prev) =>
          prev.map((e) => (e.id === updatedEvenement.id ? updatedEvenement : e))
        );
        setSelectedEvenement(updatedEvenement);
        setNewParticipant({ name: "", email: "" });
        setShowAddParticipantModal(false);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du participant:", error);
    }
  };

  // Calendrier supprimé: helpers retirés

  const getEventIcon = (type: string) => {
    switch (type) {
      case "Séminaire":
        return <Presentation className="w-6 h-6 text-blue-600" />;
      case "Webinaire":
        return <Video className="w-6 h-6 text-green-600" />;
      case "Atelier":
        return <BookOpen className="w-6 h-6 text-purple-600" />;
      default:
        return <Calendar className="w-6 h-6 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = getEvenementsStats();

  const beginEditSelected = () => {
    if (!selectedEvenement) return;
    setEditData({
      title: selectedEvenement.title,
      dateLocal: new Date(selectedEvenement.date)
        .toISOString()
        .slice(0, 16),
      type: selectedEvenement.type,
      location: selectedEvenement.location,
      description: selectedEvenement.description,
    });
    setIsEditing(true);
  };

  const saveEditSelected = () => {
    if (!selectedEvenement) return;
    if (!editData.title.trim() || !editData.dateLocal.trim() || !editData.location.trim()) return;
    const isoDate = new Date(editData.dateLocal).toISOString();
    const updated = updateEvenement(selectedEvenement.id, {
      title: editData.title.trim(),
      date: isoDate,
      type: editData.type,
      location: editData.location.trim(),
      description: editData.description.trim(),
    });
    if (updated) {
      setSelectedEvenement(updated);
      setEvenements((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setIsEditing(false);
    }
  };

  const removeSelected = () => {
    if (!selectedEvenement) return;
    const ok = window.confirm("Supprimer cet événement ?");
    if (!ok) return;
    const removed = deleteEvenement(selectedEvenement.id);
    if (removed) {
      setEvenements((prev) => prev.filter((e) => e.id !== selectedEvenement.id));
      handleBackToList();
    }
  };

  const handleAddEvenement = async () => {
    if (
      !newEvent.title.trim() ||
      !newEvent.dateLocal.trim() ||
      !newEvent.location.trim()
    ) {
      setAddError("Titre, date et lieu sont requis");
      return;
    }
    
    const currentPartnerId = getCurrentPartnerId();
    if (!currentPartnerId) {
      setAddError("Partenaire non identifié");
      return;
    }

    try {
      console.log("🔄 Création d'événement via Enterprise API...");
      const isoDate = new Date(newEvent.dateLocal).toISOString();
      
      // Mapper les types français vers les types anglais du model
      const typeMapping = {
        'Séminaire': 'seminar',
        'Webinaire': 'workshop', 
        'Atelier': 'workshop'
      };

      // Extraire l'heure de la date
      const eventDate = new Date(newEvent.dateLocal);
      const timeString = eventDate.toTimeString().substring(0, 5); // HH:MM format

      const eventData = {
        eventId: `EVT-${Date.now()}`, // ID unique
        title: newEvent.title.trim(),
        description: newEvent.description.trim() || 'Événement organisé en partenariat',
        date: isoDate,
        time: timeString,
        duration: newEvent.duration || 2, // Durée depuis le formulaire
        type: typeMapping[newEvent.type] || 'seminar',
        location: newEvent.location.trim(),
        maxParticipants: newEvent.maxParticipants || 50,
        organizers: [currentPartnerId],
        agenda: [],
        documents: []
      };

      // Créer via Enterprise API
      const response = await fetch(`https://matc-backend.onrender.com/api/enterprise/${currentPartnerId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Événement créé avec succès:", result.data);
        
        // Recharger tous les événements depuis Enterprise API
        const updatedEvents = await getEnterpriseEvents(currentPartnerId);
        setEvenements(updatedEvents);
        
        setShowAddForm(false);
        setNewEvent({
          title: "",
          dateLocal: "",
          type: "Séminaire",
          location: "",
          description: "",
          duration: 2,
          maxParticipants: 50
        });
        setAddError("");
        
        alert("Événement créé avec succès!");
      } else {
        const error = await response.json();
        console.error("❌ Erreur création:", error.message);
        setAddError("Erreur lors de la création: " + error.message);
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      
      // Fallback vers localStorage si Enterprise API échoue
      try {
        const isoDate = new Date(newEvent.dateLocal).toISOString();
        const created = addEvenement({
          title: newEvent.title.trim(),
          date: isoDate,
          type: newEvent.type,
          location: newEvent.location.trim(),
          description: newEvent.description.trim(),
          participants: [],
          resources: [],
        });
        setEvenements((prev) => [created, ...prev]);
        setShowAddForm(false);
        setNewEvent({
          title: "",
          dateLocal: "",
          type: "Séminaire",
          location: "",
          description: "",
          duration: 2,
          maxParticipants: 50
        });
        setAddError("");
        console.log("✅ Événement créé via localStorage (fallback)");
      } catch (fallbackError) {
        console.error("❌ Erreur fallback:", fallbackError);
        setAddError("Erreur lors de l'ajout de l'événement");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  // Vue détails d'un événement
  if (currentView === "details" && selectedEvenement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header avec navigation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToList}
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour à la liste</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <button
                onClick={() => navigate("/espace-partenariat")}
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                Espace Partenariat
              </button>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <>
                  <button
                    onClick={beginEditSelected}
                    className="px-3 py-1.5 text-sm rounded-full bg-white border hover:bg-gray-50 inline-flex items-center gap-1.5 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                    aria-label="Éditer l'événement"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Éditer</span>
                  </button>
                  <button
                    onClick={removeSelected}
                    className="px-3 py-1.5 text-sm rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 inline-flex items-center gap-1.5 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    aria-label="Supprimer l'événement"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {/* Informations principales de l'événement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-8"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                {getEventIcon(selectedEvenement.type)}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedEvenement.title}
                  </h1>
                  <div className="flex items-center space-x-6 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>{formatDate(selectedEvenement.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>{selectedEvenement.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>
                        {selectedEvenement.participants?.length || selectedEvenement.registeredParticipants?.length || 0} participants
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedEvenement.type === "Séminaire"
                    ? "bg-blue-100 text-blue-800"
                    : selectedEvenement.type === "Webinaire"
                    ? "bg-green-100 text-green-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {selectedEvenement.type}
              </span>
            </div>
            {isEditing ? (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData((v) => ({ ...v, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure</label>
                    <input
                      type="datetime-local"
                      value={editData.dateLocal}
                      onChange={(e) => setEditData((v) => ({ ...v, dateLocal: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={editData.type}
                      onChange={(e) => {
                        const val = e.target.value as "Séminaire" | "Webinaire" | "Atelier";
                        setEditData((v) => ({ ...v, type: val }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="Séminaire">Séminaire</option>
                      <option value="Webinaire">Webinaire</option>
                      <option value="Atelier">Atelier</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => setEditData((v) => ({ ...v, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData((v) => ({ ...v, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={4}
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={saveEditSelected}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {selectedEvenement.description}
                </p>
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section Participants */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-blue-600" />
                  Participants ({selectedEvenement.participants?.length || selectedEvenement.registeredParticipants?.length || 0})
                </h2>
                <button
                  onClick={() => setShowAddParticipantModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>

              {(selectedEvenement.participants?.length || selectedEvenement.registeredParticipants?.length || 0) > 0 ? (
                <div className="space-y-3">
                  {(selectedEvenement.participants || selectedEvenement.registeredParticipants || []).map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      {editingParticipantId === participant.id ? (
                        <div className="w-full">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={participantDraft.name}
                              onChange={(e) => setParticipantDraft((v) => ({ ...v, name: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Nom complet"
                            />
                            <input
                              type="email"
                              value={participantDraft.email}
                              onChange={(e) => setParticipantDraft((v) => ({ ...v, email: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="email@example.com"
                            />
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => {
                                if (!selectedEvenement) return;
                                const updatedParticipants = selectedEvenement.participants.map((p) =>
                                  p.id === participant.id ? { ...p, name: participantDraft.name.trim(), email: participantDraft.email.trim() } : p
                                );
                                const updated = updateEvenement(selectedEvenement.id, { participants: updatedParticipants });
                                if (updated) {
                                  setSelectedEvenement(updated);
                                  setEvenements((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
                                  setEditingParticipantId(null);
                                }
                              }}
                              className="px-3 py-1.5 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Enregistrer
                            </button>
                            <button
                              onClick={() => setEditingParticipantId(null)}
                              className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="font-medium text-gray-900">{participant.name}</p>
                            <div className="flex items-center text-gray-600 text-sm">
                              <Mail className="w-4 h-4 mr-1" />
                              <a href={`mailto:${participant.email}`} className="hover:text-blue-600 transition-colors">
                                {participant.email}
                              </a>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingParticipantId(participant.id);
                                setParticipantDraft({ name: participant.name, email: participant.email });
                              }}
                              className="px-2.5 py-1 text-xs rounded-full bg-white border hover:bg-gray-50 inline-flex items-center gap-1.5 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                              aria-label={`Éditer ${participant.name}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Éditer</span>
                            </button>
                            <button
                              onClick={() => {
                                if (!selectedEvenement) return;
                                const ok = window.confirm("Supprimer ce participant ?");
                                if (!ok) return;
                                const removed = removeParticipant(selectedEvenement.id, participant.id);
                                if (removed) {
                                  const refreshed = getEvenementById(selectedEvenement.id);
                                  if (refreshed) {
                                    setSelectedEvenement(refreshed);
                                    setEvenements((prev) => prev.map((e) => (e.id === refreshed.id ? refreshed : e)));
                                  }
                                }
                              }}
                              className="px-2.5 py-1 text-xs rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 inline-flex items-center gap-1.5 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                              aria-label={`Supprimer ${participant.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucun participant inscrit</p>
                </div>
              )}
            </motion.div>

            {/* Section Ressources */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-green-600" />
                  Ressources ({selectedEvenement.resources?.length || (selectedEvenement as any).documents?.length || 0})
                </h2>
                <button
                  onClick={() => setShowAddResource((v) => !v)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>

              {showAddResource && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de la ressource
                      </label>
                      <input
                        type="text"
                        value={newResource.name}
                        onChange={(e) =>
                          setNewResource((v) => ({
                            ...v,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ex: Présentation.pdf"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL
                      </label>
                      <input
                        type="text"
                        value={newResource.url}
                        onChange={(e) =>
                          setNewResource((v) => ({ ...v, url: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  {resourceError && (
                    <p className="text-sm text-red-600 mt-2">{resourceError}</p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        if (!selectedEvenement) return;
                        if (
                          !newResource.name.trim() ||
                          !newResource.url.trim()
                        ) {
                          setResourceError("Nom et URL sont requis");
                          return;
                        }
                        setResourceError("");
                        const ok = addResource(selectedEvenement.id, {
                          name: newResource.name.trim(),
                          url: newResource.url.trim(),
                        });
                        if (ok) {
                          const refreshed = getEvenementById(
                            selectedEvenement.id
                          );
                          if (refreshed) {
                            setSelectedEvenement(refreshed);
                            setEvenements((prev) =>
                              prev.map((e) =>
                                e.id === refreshed.id ? refreshed : e
                              )
                            );
                          }
                          setNewResource({ name: "", url: "" });
                          setShowAddResource(false);
                        } else {
                          setResourceError("Impossible d'ajouter la ressource");
                        }
                      }}
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                    >
                      <Plus className="w-4 h-4" /> Enregistrer
                    </button>
                    <button
                      onClick={() => {
                        setShowAddResource(false);
                        setResourceError("");
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {(selectedEvenement.resources?.length || (selectedEvenement as any).documents?.length || 0) > 0 ? (
                <div className="space-y-3">
                  {(selectedEvenement.resources || (selectedEvenement as any).documents || []).map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      {editingResourceId === resource.id ? (
                        <div className="w-full">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={resourceDraft.name}
                              onChange={(e) => setResourceDraft((v) => ({ ...v, name: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Nom de la ressource"
                            />
                            <input
                              type="text"
                              value={resourceDraft.url}
                              onChange={(e) => setResourceDraft((v) => ({ ...v, url: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="https://..."
                            />
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => {
                                if (!selectedEvenement) return;
                                const updatedResources = selectedEvenement.resources.map((r) =>
                                  r.id === resource.id ? { ...r, name: resourceDraft.name.trim(), url: resourceDraft.url.trim() } : r
                                );
                                const updated = updateEvenement(selectedEvenement.id, { resources: updatedResources });
                                if (updated) {
                                  setSelectedEvenement(updated);
                                  setEvenements((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
                                  setEditingResourceId(null);
                                }
                              }}
                              className="px-3 py-1.5 text-sm rounded-md bg-green-600 hover:bg-green-700 text-white"
                            >
                              Enregistrer
                            </button>
                            <button
                              onClick={() => setEditingResourceId(null)}
                              className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <span className="font-medium text-gray-900">{resource.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingResourceId(resource.id);
                                setResourceDraft({ name: resource.name, url: resource.url });
                              }}
                              className="px-2.5 py-1 text-xs rounded-full bg-white border hover:bg-gray-50 inline-flex items-center gap-1.5 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                              aria-label={`Éditer ${resource.name}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Éditer</span>
                            </button>
                            <button
                              onClick={() => {
                                if (!selectedEvenement) return;
                                const ok = window.confirm("Supprimer cette ressource ?");
                                if (!ok) return;
                                const removed = removeResource(selectedEvenement.id, resource.id);
                                if (removed) {
                                  const refreshed = getEvenementById(selectedEvenement.id);
                                  if (refreshed) {
                                    setSelectedEvenement(refreshed);
                                    setEvenements((prev) => prev.map((e) => (e.id === refreshed.id ? refreshed : e)));
                                  }
                                }
                              }}
                              className="px-2.5 py-1 text-xs rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 inline-flex items-center gap-1.5 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                              aria-label={`Supprimer ${resource.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Supprimer</span>
                            </button>
                            <button
                              onClick={() => {
                                console.log("Téléchargement simulé:", resource.name);
                                alert(`Téléchargement de ${resource.name} simulé !`);
                              }}
                              className="flex items-center space-x-2 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              <span>Télécharger</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune ressource disponible</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Rapport post-événement */}
          {selectedEvenement.postEventReport && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 mt-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-purple-600" />
                Rapport Post-Événement
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">
                        Taux de Participation
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {selectedEvenement.postEventReport.attendanceRate}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">
                        Taux de Satisfaction
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {selectedEvenement.postEventReport.satisfactionRate}%
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              {selectedEvenement.postEventReport.comments.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Commentaires des participants
                  </h3>
                  <div className="space-y-3">
                    {selectedEvenement.postEventReport.comments.map(
                      (comment, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 italic">"{comment}"</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Modal d'ajout de participant */}
        {showAddParticipantModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ajouter un participant
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={newParticipant.name}
                    onChange={(e) =>
                      setNewParticipant({
                        ...newParticipant,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newParticipant.email}
                    onChange={(e) =>
                      setNewParticipant({
                        ...newParticipant,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="jean.dupont@email.com"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddParticipantModal(false);
                    setNewParticipant({ name: "", email: "" });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddParticipant}
                  disabled={!newParticipant.name || !newParticipant.email}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // Vue calendrier supprimée

  // Vue liste des événements (par défaut)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header avec navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/espace-partenariat")}
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Espace Partenariat</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">
              Événements & Séminaires
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>
        </motion.div>

        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ajouter un événement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent((v) => ({ ...v, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Séminaire Transformation Digitale"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date et heure
                </label>
                <input
                  type="datetime-local"
                  value={newEvent.dateLocal}
                  onChange={(e) =>
                    setNewEvent((v) => ({ ...v, dateLocal: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => {
                    const val = e.target.value as
                      | "Séminaire"
                      | "Webinaire"
                      | "Atelier";
                    setNewEvent((v) => ({ ...v, type: val }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Séminaire">Séminaire</option>
                  <option value="Webinaire">Webinaire</option>
                  <option value="Atelier">Atelier</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent((v) => ({ ...v, location: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Centre de Conférences Paris ou En ligne (Zoom)"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent((v) => ({ ...v, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Détaillez le contenu de l'événement"
                />
              </div>
            </div>
            {addError && (
              <p className="text-sm text-red-600 mt-3">{addError}</p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAddEvenement}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md shadow"
              >
                <Plus className="w-4 h-4" /> Enregistrer
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setAddError("");
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        )}

        {/* Statistiques rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Événements
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalEvenements}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Participants
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalParticipants}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">À venir</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.evenementsAVenir}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Satisfaction
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.satisfactionMoyenne}%
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </motion.div>

        {/* Liste des événements */}
        {currentView === "list" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {evenements.map((evenement, index) => (
                <motion.div
                  key={evenement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => handleEvenementClick(evenement.id)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getEventIcon(evenement.type)}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            evenement.type === "Séminaire"
                              ? "bg-blue-100 text-blue-800"
                              : evenement.type === "Webinaire"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {evenement.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const toEdit = getEvenementById(evenement.id);
                            if (!toEdit) return;
                            setSelectedEvenement(toEdit);
                            setCurrentView("details");
                            setTimeout(() => beginEditSelected(), 0);
                          }}
                          className="px-2.5 py-1 text-xs rounded-full bg-white border hover:bg-gray-50 inline-flex items-center gap-1.5 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                          aria-label={`Éditer ${evenement.title}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Éditer</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const ok = window.confirm("Supprimer cet événement ?");
                            if (!ok) return;
                            const removed = deleteEvenement(evenement.id);
                            if (removed) {
                              setEvenements((prev) => prev.filter((ev) => ev.id !== evenement.id));
                            }
                          }}
                          className="px-2.5 py-1 text-xs rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 inline-flex items-center gap-1.5 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                          aria-label={`Supprimer ${evenement.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                      {evenement.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(evenement.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="truncate">{evenement.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Users className="w-4 h-4 mr-2" />
                        <span>
                          {evenement.participants?.length || evenement.registeredParticipants?.length || 0} participants
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {evenement.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {evenement.resources?.length || (evenement as any).documents?.length || 0} ressources
                        </span>
                      </div>

                      {evenement.postEventReport && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">
                            {evenement.postEventReport.satisfactionRate}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        
      </div>
    </div>
  );
};

export default PartenaireEvenementsPage;
