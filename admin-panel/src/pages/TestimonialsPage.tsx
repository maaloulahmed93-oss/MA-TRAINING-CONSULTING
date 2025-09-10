import React, { useState, useMemo } from "react";
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
} from "@heroicons/react/24/outline";
import { Testimonial } from "../types";

const TestimonialsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data - Updated with new structure
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: "1",
      name: "Youssef Amrani",
      position: "UI/UX Designer",
      skills: "Figma, Design Thinking",
      category: "Conception UI/UX",
      level: "Avancé",
      progress: 75,
      content:
        "J'ai appris à créer des interfaces modernes et ergonomiques qui améliorent l'expérience utilisateur...",
      badge: "TOP des participants",
      isPublished: true,
      createdAt: new Date("2023-10-26"),
      updatedAt: new Date("2023-10-26"),
      rating: 5,
    },
    {
      id: "2",
      name: "Imane Khoury",
      position: "Cloud Engineer",
      skills: "AWS, Kubernetes",
      category: "Architecture Cloud",
      level: "Expert",
      progress: 100,
      content:
        "Grâce aux projets pratiques, j'ai pu obtenir ma certification AWS Solutions Architect...",
      isPublished: true,
      createdAt: new Date("2023-09-15"),
      updatedAt: new Date("2023-09-15"),
      rating: 5,
    },
    {
      id: "3",
      name: "Hichem Mansouri",
      position: "Marketing Digital",
      skills: "SEO, SEA",
      category: "Stratégie marketing",
      level: "Intermédiaire",
      progress: 50,
      content:
        "J'ai pu mettre en place des campagnes performantes qui ont doublé le trafic qualifié...",
      isPublished: false,
      createdAt: new Date("2023-08-01"),
      updatedAt: new Date("2023-08-01"),
      rating: 4,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<Testimonial | null>(null);

  const handleOpenModal = (testimonial: Testimonial | null) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTestimonial(null);
    setIsModalOpen(false);
  };

  const handleSaveTestimonial = (testimonialToSave: Testimonial) => {
    if (selectedTestimonial) {
      setTestimonials(
        testimonials.map((t) =>
          t.id === testimonialToSave.id ? testimonialToSave : t
        )
      );
    } else {
      setTestimonials([testimonialToSave, ...testimonials]);
    }
    handleCloseModal();
  };

  const handleDeleteTestimonial = (testimonialId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) {
      setTestimonials(testimonials.filter((t) => t.id !== testimonialId));
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
            Gestion des Partenaires
          </h1>
          <p className="text-gray-500 mt-1">
            Gérez les partenaires de votre entreprise
          </p>
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          className="btn-primary inline-flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouveau Partenaire
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
            Aucun partenaire trouvé
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Essayez de modifier vos filtres ou d'ajouter un nouveau partenaire.
          </p>
        </div>
      )}
    </div>
  );
};

export default TestimonialsPage;
