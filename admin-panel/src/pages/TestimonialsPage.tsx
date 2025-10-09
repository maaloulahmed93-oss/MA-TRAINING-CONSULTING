import React, { useState, useMemo, useEffect } from "react";
import TestimonialFormModal from "../components/testimonials/TestimonialFormModal";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CommandLineIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Testimonial } from "../types";
import { testimonialsApiService } from "../services/testimonialsApiService";

const TestimonialsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<Testimonial | null>(null);

  // Charger les témoignages au démarrage
  useEffect(() => {
    loadTestimonials();
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    const connected = await testimonialsApiService.checkConnection();
    setApiConnected(connected);
    console.log(connected ? '🟢 API Backend connecté' : '🔴 API Backend déconnecté');
  };

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des témoignages...');
      
      const data = await testimonialsApiService.getAllTestimonials({
        status: filterStatus,
        search: searchTerm
      });
      
      setTestimonials(data);
      console.log(`✅ ${data.length} témoignages chargés`);
    } catch (error) {
      console.error('❌ Erreur lors du chargement:', error);
      setError('Erreur lors du chargement des témoignages');
    } finally {
      setLoading(false);
    }
  };

  // Recharger quand les filtres changent
  useEffect(() => {
    if (!loading) {
      loadTestimonials();
    }
  }, [filterStatus, searchTerm]);

  const handleOpenModal = (testimonial: Testimonial | null) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTestimonial(null);
    setIsModalOpen(false);
  };

  const handleSaveTestimonial = async (testimonialToSave: Testimonial) => {
    try {
      setLoading(true);
      
      if (selectedTestimonial) {
        // Mise à jour
        console.log('🔄 Mise à jour du témoignage...');
        await testimonialsApiService.updateTestimonial(testimonialToSave.id, testimonialToSave);
      } else {
        // Création
        console.log('➕ Création d\'un nouveau témoignage...');
        await testimonialsApiService.createTestimonial(testimonialToSave);
      }
      
      // Recharger la liste
      await loadTestimonials();
      handleCloseModal();
      
      console.log('✅ Témoignage sauvegardé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      setError('Erreur lors de la sauvegarde du témoignage');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce témoignage ?")) {
      try {
        setLoading(true);
        console.log(`🗑️ Suppression du témoignage ${testimonialId}...`);
        
        await testimonialsApiService.deleteTestimonial(testimonialId);
        
        // Recharger la liste
        await loadTestimonials();
        
        console.log('✅ Témoignage supprimé avec succès');
      } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        setError('Erreur lors de la suppression du témoignage');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTogglePublish = async (testimonialId: string) => {
    try {
      setLoading(true);
      console.log(`📢 Basculement du statut de publication pour ${testimonialId}...`);
      
      await testimonialsApiService.togglePublishStatus(testimonialId);
      
      // Recharger la liste
      await loadTestimonials();
      
      console.log('✅ Statut de publication mis à jour');
    } catch (error) {
      console.error('❌ Erreur lors du changement de statut:', error);
      setError('Erreur lors du changement de statut');
    } finally {
      setLoading(false);
    }
  };

  const filteredTestimonials = useMemo(() => {
    return testimonials
      .filter((testimonial) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          testimonial.name.toLowerCase().includes(searchLower) ||
          testimonial.position.toLowerCase().includes(searchLower) ||
          testimonial.skills.toLowerCase().includes(searchLower) ||
          testimonial.category.toLowerCase().includes(searchLower) ||
          testimonial.content.toLowerCase().includes(searchLower)
        );
      })
      .filter((testimonial) => {
        if (filterStatus === "all") return true;
        if (filterStatus === "published") return testimonial.isPublished;
        if (filterStatus === "unpublished") return !testimonial.isPublished;
        return true;
      });
  }, [testimonials, searchTerm, filterStatus]);

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getLevelColor = (level: "Intermédiaire" | "Avancé" | "Expert") => {
    switch (level) {
      case "Intermédiaire":
        return "bg-blue-500";
      case "Avancé":
        return "bg-green-500";
      case "Expert":
        return "bg-purple-600";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Témoignages Participants
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez les témoignages des participants aux programmes de formation
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              {apiConnected ? (
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
              ) : (
                <XCircleIcon className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-xs ${apiConnected ? 'text-green-600' : 'text-red-600'}`}>
                {apiConnected ? 'API Connectée' : 'Mode Local'}
              </span>
            </div>
            {loading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-xs text-blue-600">Chargement...</span>
              </div>
            )}
          </div>
          {error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          className="btn-primary inline-flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouveau Témoignage
        </button>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
        <div className="relative flex-grow">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, poste, compétences..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="unpublished">Non publiés</option>
          </select>
        </div>
      </div>

      <TestimonialFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTestimonial}
        testimonial={selectedTestimonial}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTestimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group relative border border-gray-200"
          >
            <div className="p-6">
              <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <button
                  onClick={() => handleOpenModal(testimonial)}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600"
                  aria-label="Modifier"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleTogglePublish(testimonial.id)}
                  className={`p-2 rounded-full ${
                    testimonial.isPublished 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                  }`}
                  aria-label={testimonial.isPublished ? "Dépublier" : "Publier"}
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteTestimonial(testimonial.id)}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
                  aria-label="Supprimer"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>

              {testimonial.badge && (
                <div className="absolute top-4 left-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-r-full flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-1" /> {testimonial.badge}
                </div>
              )}

              <div className="flex items-center space-x-4 mt-8">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-2xl flex-shrink-0">
                  {getInitials(testimonial.name)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <BriefcaseIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                    {testimonial.position}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <p className="text-gray-600 flex items-center">
                  <CommandLineIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                  <strong>Compétences:</strong>
                  <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {testimonial.skills}
                  </span>
                </p>
                <p className="text-gray-600 flex items-center">
                  <AcademicCapIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                  <strong>Catégorie:</strong>
                  <span className="ml-2">{testimonial.category}</span>
                </p>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-sm font-bold ${getLevelColor(
                      testimonial.level
                    ).replace("bg-", "text-")}`}
                  >
                    {testimonial.level}
                  </span>
                  <span className="text-sm font-bold text-gray-600">
                    {testimonial.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`${getLevelColor(
                      testimonial.level
                    )} h-2.5 rounded-full`}
                    style={{ width: `${testimonial.progress}%` }}
                  ></div>
                </div>
              </div>

              <blockquote className="mt-4 text-gray-600 italic border-l-4 border-gray-200 pl-4 py-2 bg-gray-50 rounded-r-md">
                "{testimonial.content}"
              </blockquote>

              <div className="mt-4 flex justify-between items-center">
                <p className="text-xs text-gray-400">
                  Créé le:{" "}
                  {new Date(testimonial.createdAt).toLocaleDateString("fr-FR")}
                </p>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    testimonial.isPublished
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {testimonial.isPublished ? "Publié" : "Non publié"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTestimonials.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <EyeIcon className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Aucun témoignage trouvé
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Essayez de modifier vos filtres ou d'ajouter un nouveau témoignage.
          </p>
        </div>
      )}
    </div>
  );
};

export default TestimonialsPage;
