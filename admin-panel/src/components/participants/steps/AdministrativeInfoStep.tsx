import React, { useState } from "react";
import {
  DocumentTextIcon,
  CalendarIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface AdministrativeInfo {
  status: "excellent" | "stable" | "expert" | "avancé";
  enrollmentDate: string;
  notes: string;
  formations: string[];
  projects: string[];
  coachingResources: string[];
  specialNeeds: string;
  medicalConditions: string;
}

interface AdministrativeInfoStepProps {
  administrativeInfo: AdministrativeInfo;
  setAdministrativeInfo: React.Dispatch<React.SetStateAction<AdministrativeInfo>>;
}

const AdministrativeInfoStep: React.FC<AdministrativeInfoStepProps> = ({
  administrativeInfo,
  setAdministrativeInfo,
}) => {
  const [newFormation, setNewFormation] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newResource, setNewResource] = useState("");
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [formationCourses, setFormationCourses] = useState<{[key: string]: string[]}>({});
  
  // Session management state
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [newSession, setNewSession] = useState("");
  const [courseSessions, setCourseSessions] = useState<{[key: string]: {title: string, links: {type: string, title: string, url: string}[]}[]}>({});
  
  // Session links management
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState("");
  const [sessionLinks, setSessionLinks] = useState<{type: string, title: string, url: string}[]>([]);

  const handleChange = (field: keyof AdministrativeInfo, value: string | string[]) => {
    setAdministrativeInfo((prev) => ({ ...prev, [field]: value }));
  };

  const addFormation = () => {
    if (newFormation.trim()) {
      const formationName = newFormation.trim();
      setAdministrativeInfo((prev) => ({
        ...prev,
        formations: [...prev.formations, formationName],
      }));
      setSelectedFormation(formationName);
      setNewFormation("");
      setShowCourseModal(true);
    }
  };

  const removeFormation = (index: number) => {
    setAdministrativeInfo((prev) => ({
      ...prev,
      formations: prev.formations.filter((_, i) => i !== index),
    }));
  };

  const addProject = () => {
    if (newProject.trim()) {
      setAdministrativeInfo((prev) => ({
        ...prev,
        projects: [...prev.projects, newProject.trim()],
      }));
      setNewProject("");
    }
  };

  const removeProject = (index: number) => {
    setAdministrativeInfo((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const addResource = () => {
    if (newResource.trim()) {
      setAdministrativeInfo((prev) => ({
        ...prev,
        coachingResources: [...prev.coachingResources, newResource.trim()],
      }));
      setNewResource("");
    }
  };

  const removeResource = (index: number) => {
    setAdministrativeInfo((prev) => ({
      ...prev,
      coachingResources: prev.coachingResources.filter((_, i) => i !== index),
    }));
  };

  const addCourse = () => {
    if (newCourse.trim() && selectedFormation) {
      setFormationCourses((prev) => ({
        ...prev,
        [selectedFormation]: [...(prev[selectedFormation] || []), newCourse.trim()],
      }));
      setNewCourse("");
    }
  };

  const removeCourse = (courseIndex: number) => {
    if (selectedFormation) {
      setFormationCourses((prev) => ({
        ...prev,
        [selectedFormation]: (prev[selectedFormation] || []).filter((_, i) => i !== courseIndex),
      }));
    }
  };

  const closeCourseModal = () => {
    setShowCourseModal(false);
    setSelectedFormation("");
    setNewCourse("");
  };

  // Session management functions
  const openSessionModal = (course: string) => {
    setSelectedCourse(course);
    setShowSessionModal(true);
  };

  const addSession = () => {
    if (newSession.trim() && selectedCourse) {
      const courseKey = `${selectedFormation}-${selectedCourse}`;
      setCourseSessions((prev) => ({
        ...prev,
        [courseKey]: [...(prev[courseKey] || []), {
          title: newSession.trim(),
          links: []
        }],
      }));
      setNewSession("");
    }
  };

  const removeSession = (sessionIndex: number) => {
    if (selectedCourse) {
      const courseKey = `${selectedFormation}-${selectedCourse}`;
      setCourseSessions((prev) => ({
        ...prev,
        [courseKey]: (prev[courseKey] || []).filter((_, i) => i !== sessionIndex),
      }));
    }
  };

  const closeSessionModal = () => {
    setShowSessionModal(false);
    setSelectedCourse("");
    setNewSession("");
  };

  // Session links management functions
  const openLinksModal = (sessionTitle: string) => {
    setSelectedSession(sessionTitle);
    const courseKey = `${selectedFormation}-${selectedCourse}`;
    const session = courseSessions[courseKey]?.find(s => s.title === sessionTitle);
    setSessionLinks(session?.links || []);
    setShowLinksModal(true);
  };

  const addSessionLink = (type: string) => {
    const title = prompt(`Entrez le titre pour ${type}:`);
    const url = prompt(`Entrez l'URL pour ${type}:`);
    
    if (title && url) {
      const newLink = { type, title, url };
      setSessionLinks(prev => [...prev, newLink]);
      
      // Update the session in courseSessions
      const courseKey = `${selectedFormation}-${selectedCourse}`;
      setCourseSessions(prev => ({
        ...prev,
        [courseKey]: prev[courseKey]?.map(session => 
          session.title === selectedSession 
            ? { ...session, links: [...session.links, newLink] }
            : session
        ) || []
      }));
    }
  };

  const removeSessionLink = (linkIndex: number) => {
    setSessionLinks(prev => prev.filter((_, i) => i !== linkIndex));
    
    // Update the session in courseSessions
    const courseKey = `${selectedFormation}-${selectedCourse}`;
    setCourseSessions(prev => ({
      ...prev,
      [courseKey]: prev[courseKey]?.map(session => 
        session.title === selectedSession 
          ? { ...session, links: session.links.filter((_, i) => i !== linkIndex) }
          : session
      ) || []
    }));
  };

  const closeLinksModal = () => {
    setShowLinksModal(false);
    setSelectedSession("");
    setSessionLinks([]);
  };

  const statusOptions = [
    { value: "excellent", label: "Excellent", color: "green" },
    { value: "stable", label: "Stable", color: "blue" },
    { value: "expert", label: "Expert", color: "purple" },
    { value: "avancé", label: "Avancé", color: "indigo" },
  ];

  const commonFormations = [
    "Développement Web Full Stack",
    "Marketing Digital",
    "Gestion de Projet",
    "Design Graphique",
    "Data Science",
    "Cybersécurité",
    "Intelligence Artificielle",
    "E-commerce",
    "Entrepreneuriat",
    "Communication Digitale"
  ];

  const commonProjects = [
    "Site Web Personnel",
    "Application Mobile",
    "Campagne Marketing",
    "Analyse de Données",
    "Projet E-commerce",
    "Portfolio Professionnel",
    "Étude de Marché",
    "Plan d'Affaires",
    "Projet Collaboratif",
    "Présentation Finale"
  ];

  const commonResources = [
    "Guide de Démarrage",
    "Ressources Techniques",
    "Outils de Développement",
    "Templates et Modèles",
    "Vidéos Tutoriels",
    "Documentation API",
    "Exercices Pratiques",
    "Projets d'Exemple",
    "Communauté d'Entraide",
    "Support Technique"
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <DocumentTextIcon className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900">Informations administratives</h4>
            <p className="text-sm text-gray-700 mt-1">
              Finalisation du dossier avec les informations de gestion et d'attribution des ressources.
            </p>
          </div>
        </div>
      </div>

      {/* Status and Enrollment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CheckCircleIcon className="w-4 h-4 inline mr-1" />
            Statut du participant
          </label>
          <select
            value={administrativeInfo.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CalendarIcon className="w-4 h-4 inline mr-1" />
            Date d'inscription
          </label>
          <input
            type="date"
            value={administrativeInfo.enrollmentDate}
            onChange={(e) => handleChange("enrollmentDate", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Formations */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-500" />
          Formations assignées
        </h4>
        
        <div className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newFormation}
              onChange={(e) => setNewFormation(e.target.value)}
              placeholder="Nom de la formation..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFormation())}
            />
            <button
              type="button"
              onClick={addFormation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>

        {/* Quick Add Common Formations */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Formations courantes :</p>
          <div className="flex flex-wrap gap-2">
            {commonFormations.map((formation) => (
              <button
                key={formation}
                type="button"
                onClick={() => {
                  if (!administrativeInfo.formations.includes(formation)) {
                    setAdministrativeInfo((prev) => ({
                      ...prev,
                      formations: [...prev.formations, formation],
                    }));
                    setSelectedFormation(formation);
                    setShowCourseModal(true);
                  }
                }}
                disabled={administrativeInfo.formations.includes(formation)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  administrativeInfo.formations.includes(formation)
                    ? "bg-blue-100 text-blue-800 border-blue-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {formation}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {administrativeInfo.formations.map((formation, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200"
            >
              <div className="flex-1">
                <span className="text-gray-900">{formation}</span>
                {formationCourses[formation] && formationCourses[formation].length > 0 && (
                  <div className="text-xs text-blue-600 mt-1">
                    {formationCourses[formation].length} cours ajouté(s)
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFormation(formation);
                    setShowCourseModal(true);
                  }}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                  title="Gérer les cours"
                >
                  Cours
                </button>
                <button
                  type="button"
                  onClick={() => removeFormation(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BriefcaseIcon className="w-5 h-5 mr-2 text-green-500" />
          Projets assignés
        </h4>
        
        <div className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              placeholder="Nom du projet..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addProject())}
            />
            <button
              type="button"
              onClick={addProject}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-1"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>

        {/* Quick Add Common Projects */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Projets courrants :</p>
          <div className="flex flex-wrap gap-2">
            {commonProjects.map((project) => (
              <button
                key={project}
                type="button"
                onClick={() => {
                  if (!administrativeInfo.projects.includes(project)) {
                    setAdministrativeInfo((prev) => ({
                      ...prev,
                      projects: [...prev.projects, project],
                    }));
                  }
                }}
                disabled={administrativeInfo.projects.includes(project)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  administrativeInfo.projects.includes(project)
                    ? "bg-green-100 text-green-800 border-green-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {project}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {administrativeInfo.projects.map((project, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200"
            >
              <span className="text-gray-900">{project}</span>
              <button
                type="button"
                onClick={() => removeProject(index)}
                className="text-red-500 hover:text-red-700"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Coaching Resources */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BookOpenIcon className="w-5 h-5 mr-2 text-purple-500" />
          Ressources de coaching
        </h4>
        
        <div className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newResource}
              onChange={(e) => setNewResource(e.target.value)}
              placeholder="Nom de la ressource..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addResource())}
            />
            <button
              type="button"
              onClick={addResource}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-1"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>

        {/* Quick Add Common Resources */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Ressources courantes :</p>
          <div className="flex flex-wrap gap-2">
            {commonResources.map((resource) => (
              <button
                key={resource}
                type="button"
                onClick={() => {
                  if (!administrativeInfo.coachingResources.includes(resource)) {
                    setAdministrativeInfo((prev) => ({
                      ...prev,
                      coachingResources: [...prev.coachingResources, resource],
                    }));
                  }
                }}
                disabled={administrativeInfo.coachingResources.includes(resource)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  administrativeInfo.coachingResources.includes(resource)
                    ? "bg-purple-100 text-purple-800 border-purple-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {resource}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {administrativeInfo.coachingResources.map((resource, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-purple-50 p-3 rounded-lg border border-purple-200"
            >
              <span className="text-gray-900">{resource}</span>
              <button
                type="button"
                onClick={() => removeResource(index)}
                className="text-red-500 hover:text-red-700"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Special Needs and Medical Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <HeartIcon className="w-4 h-4 inline mr-1" />
            Besoins spéciaux
          </label>
          <textarea
            rows={3}
            value={administrativeInfo.specialNeeds}
            onChange={(e) => handleChange("specialNeeds", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Accessibilité, équipements spéciaux, aménagements nécessaires..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
            Conditions médicales
          </label>
          <textarea
            rows={3}
            value={administrativeInfo.medicalConditions}
            onChange={(e) => handleChange("medicalConditions", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Allergies, conditions médicales importantes à connaître..."
          />
        </div>
      </div>

      {/* Administrative Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <DocumentTextIcon className="w-4 h-4 inline mr-1" />
          Notes administratives
        </label>
        <textarea
          rows={4}
          value={administrativeInfo.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Notes internes, observations, commentaires particuliers..."
        />
      </div>

      {/* Administrative Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Résumé administratif :</h4>
        <div className="space-y-1 text-gray-700">
          <p><strong>Statut :</strong> {statusOptions.find(s => s.value === administrativeInfo.status)?.label}</p>
          <p><strong>Date d'inscription :</strong> {administrativeInfo.enrollmentDate}</p>
          <p><strong>Formations assignées :</strong> {administrativeInfo.formations.length} formation(s)</p>
          <p><strong>Projets assignés :</strong> {administrativeInfo.projects.length} projet(s)</p>
          <p><strong>Ressources de coaching :</strong> {administrativeInfo.coachingResources.length} ressource(s)</p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900">Prêt pour la finalisation</h4>
            <p className="text-sm text-green-700 mt-1">
              Toutes les informations ont été collectées. Vous pouvez maintenant finaliser la création du dossier participant.
            </p>
          </div>
        </div>
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Ajouter des cours pour: {selectedFormation}
              </h3>
              <button
                onClick={closeCourseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Add Course Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="Nom du cours..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCourse())}
                />
                <button
                  type="button"
                  onClick={addCourse}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>

              {/* Course List */}
              <div className="max-h-60 overflow-y-auto">
                {formationCourses[selectedFormation]?.map((course, index) => {
                  const courseKey = `${selectedFormation}-${course}`;
                  const sessionCount = courseSessions[courseKey]?.length || 0;
                  return (
                    <div
                      key={index}
                      className="bg-gray-50 px-3 py-2 rounded-lg mb-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="text-sm text-gray-700">{course}</span>
                          {sessionCount > 0 && (
                            <div className="text-xs text-green-600 mt-1">
                              {sessionCount} session(s) ajoutée(s)
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openSessionModal(course)}
                            className="text-green-500 hover:text-green-700 text-xs px-2 py-1 border border-green-300 rounded"
                            title="Gérer les sessions"
                          >
                            Sessions
                          </button>
                          <button
                            onClick={() => removeCourse(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(!formationCourses[selectedFormation] || formationCourses[selectedFormation].length === 0) && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Aucun cours ajouté pour cette formation
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  onClick={closeCourseModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Terminer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Management Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Sessions pour: {selectedCourse}
              </h3>
              <button
                onClick={closeSessionModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Add Session Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSession}
                  onChange={(e) => setNewSession(e.target.value)}
                  placeholder="Titre de la session..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSession())}
                />
                <button
                  type="button"
                  onClick={addSession}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-1"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>

              {/* Session List */}
              <div className="max-h-60 overflow-y-auto">
                {courseSessions[`${selectedFormation}-${selectedCourse}`]?.map((session, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 px-3 py-2 rounded-lg mb-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="text-sm text-gray-700">{session.title}</span>
                        {session.links.length > 0 && (
                          <div className="text-xs text-blue-600 mt-1">
                            {session.links.length} lien(s) ajouté(s)
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openLinksModal(session.title)}
                          className="text-blue-500 hover:text-blue-700 text-xs px-2 py-1 border border-blue-300 rounded"
                          title="Gérer les liens"
                        >
                          Liens
                        </button>
                        <button
                          onClick={() => removeSession(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!courseSessions[`${selectedFormation}-${selectedCourse}`] || courseSessions[`${selectedFormation}-${selectedCourse}`].length === 0) && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Aucune session ajoutée pour ce cours
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  onClick={closeSessionModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Terminer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Links Management Modal */}
      {showLinksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Liens pour: {selectedSession}
              </h3>
              <button
                onClick={closeLinksModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Add Link Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addSessionLink('resume')}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                >
                  + Résumé
                </button>
                <button
                  onClick={() => addSessionLink('download')}
                  className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                >
                  + Télécharger
                </button>
                <button
                  onClick={() => addSessionLink('video')}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                >
                  + Vidéo
                </button>
                <button
                  onClick={() => addSessionLink('additional')}
                  className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm"
                >
                  + Autre
                </button>
              </div>

              {/* Links List */}
              <div className="max-h-48 overflow-y-auto">
                {sessionLinks.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg mb-2"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700">{link.title}</div>
                      <div className="text-xs text-gray-500">
                        {link.type} - {link.url}
                      </div>
                    </div>
                    <button
                      onClick={() => removeSessionLink(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {sessionLinks.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Aucun lien ajouté pour cette session
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  onClick={closeLinksModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Terminer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdministrativeInfoStep;
