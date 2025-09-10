import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Participant,
  Formation,
  Project,
  CoachingResource,
  Session,
  Notification,
  FormationLink,
  Course,
} from "../../types/participant";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  BookOpenIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { trainingPrograms } from "../../data/trainingPrograms";

interface ParticipantFormEnhancedProps {
  onSubmit: (data: Partial<Participant>) => void;
  onCancel: () => void;
  initialData?: Participant | null;
}

type FormData = Partial<Omit<Participant, "id" | "createdAt" | "updatedAt">>;

const ParticipantFormEnhanced: React.FC<ParticipantFormEnhancedProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [activeTab, setActiveTab] = useState<
    "personal" | "academic" | "resources"
  >("personal");
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [newFormation, setNewFormation] = useState("");
  const [formations, setFormations] = useState<Formation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectDetails, setNewProjectDetails] = useState<Partial<Project>>({
    title: "",
    description: "",
    formationId: "",
    formationTitle: "",
    dueDate: "",
    feedback: "",
    note: "",
    isVisible: true,
    grade: undefined,
    status: "not_started",
  });
  const [newResource, setNewResource] = useState({
    title: "",
    url: "",
    icon: "",
  });
  const [coachingResources, setCoachingResources] = useState<
    CoachingResource[]
  >([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [formationCourses, setFormationCourses] = useState<{
    [key: string]: string[];
  }>({});

  // e-Training catalog selection
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  // UI: open details for a formation
  const [openFormationIndex, setOpenFormationIndex] = useState<number | null>(
    null
  );

  // Session management state
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [newSession, setNewSession] = useState("");
  const [courseSessions, setCourseSessions] = useState<{
    [key: string]: Session[];
  }>({});

  // Session links management
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
  const [currentFormationIndex, setCurrentFormationIndex] = useState<
    number | null
  >(null);
  const [newLink, setNewLink] = useState<{
    url: string;
    type: FormationLink["type"] | "";
  }>({ url: "", type: "" });
  const [showLinkForm, setShowLinkForm] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotification, setNewNotification] = useState<Partial<Notification>>(
    {
      message: "",
      type: "job",
      company: "",
      jobTitle: "",
      salary: "",
      contractType: "",
      contact: "",
      description: "",
      uploadLink: "",
      title: "",
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName,
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        phone: initialData.phone || "",
        avatar: initialData.avatar || "",
        status: initialData.status,
        address: initialData.address || "",
        notes: initialData.notes || "",
        enrollmentDate: initialData.enrollmentDate,
        lastActivity: initialData.lastActivity,
        formations: initialData.formations,
        projects: initialData.projects,
        coachingResources: initialData.coachingResources || [],
        notifications: initialData.notifications || [],
      });
      setFormations(initialData.formations || []);
      setProjects(initialData.projects || []);
      setCoachingResources(initialData.coachingResources || []);
      setNotifications(initialData.notifications || []);
    }
  }, [initialData]);

  // Auto-split full name into first and last name
  useEffect(() => {
    if (formData.fullName && !initialData) {
      const nameParts = formData.fullName.trim().split(" ");
      if (nameParts.length >= 2) {
        setFormData((prev) => ({
          ...prev,
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(" "),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          firstName: nameParts[0] || "",
          lastName: "",
        }));
      }
    }
  }, [formData.fullName, initialData]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const rest = { ...prev };
        delete rest[field as string];
        return rest;
      });
    }
  };

  const addProject = () => {
    if (newProjectDetails.title?.trim()) {
      const selectedFormation = formations.find(
        (f) => f.id === newProjectDetails.formationId
      );

      const newProjectObject: Project = {
        id: `proj-${Date.now()}`,
        title: newProjectDetails.title.trim(),
        description: newProjectDetails.description || "",
        formationId: newProjectDetails.formationId || "",
        formationTitle: selectedFormation?.title || "Non spécifiée",
        status: "not_started",
        feedback: newProjectDetails.feedback || "",
        note: newProjectDetails.note || "",
        isVisible: newProjectDetails.isVisible ?? true,
        grade:
          typeof newProjectDetails.grade === "number"
            ? newProjectDetails.grade
            : newProjectDetails.grade
            ? Number(newProjectDetails.grade)
            : undefined,
        files: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: newProjectDetails.dueDate
          ? new Date(newProjectDetails.dueDate).toISOString()
          : "",
      };
      setProjects((prev) => [...prev, newProjectObject]);
      setShowProjectModal(false);
      setNewProjectDetails({
        title: "",
        description: "",
        formationId: "",
        dueDate: "",
        feedback: "",
        note: "",
        isVisible: true,
        grade: undefined,
      });
    }
  };

  const removeProject = (index: number) => {
    setProjects((prev) => prev.filter((_, i) => i !== index));
  };

  const addResource = () => {
    if (newResource.title.trim() && newResource.url.trim()) {
      const newResourceObject: CoachingResource = {
        id: `res-${Date.now()}`,
        title: newResource.title.trim(),
        description: "",
        icon: newResource.icon?.trim() || undefined,
        category: "Ressources",
        type: "Guide",
        assignedDate: new Date().toISOString(),
        isCompleted: false,
        dataLinks: [
          {
            id: `link-${Date.now()}`,
            title: "Lien principal",
            url: newResource.url.trim(),
            type: "external",
          },
        ],
      };
      setCoachingResources((prev) => [...prev, newResourceObject]);
      setNewResource({ title: "", url: "", icon: "" });
    }
  };

  const removeResource = (index: number) => {
    setCoachingResources((prev) => prev.filter((_, i) => i !== index));
  };

  // Copy ID utility
  const copyIdToClipboard = (id: string) => {
    try {
      if (!id) return;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(id).then(() => {
          window.alert("ID copié dans le presse-papiers");
        });
      } else {
        const ta = document.createElement("textarea");
        ta.value = id;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        window.alert("ID copié dans le presse-papiers");
      }
    } catch (err) {
      console.warn("Impossible de copier l'ID:", err);
    }
  };

  const addNotification = () => {
    let notificationToAdd: Notification | null = null;

    if (
      newNotification.type === "job" &&
      newNotification.company &&
      newNotification.jobTitle
    ) {
      const message = `Nouvelle offre - ${newNotification.jobTitle}: ${newNotification.company} recherche un(e) ${newNotification.jobTitle}. Contrat: ${newNotification.contractType}, Salaire: ${newNotification.salary}. Contact: ${newNotification.contact}`;
      notificationToAdd = {
        id: `notif-${Date.now()}`,
        title: `Offre d'emploi: ${newNotification.jobTitle}`,
        message,
        type: "job",
        date: new Date().toISOString(),
        isRead: false,
        company: newNotification.company,
        jobTitle: newNotification.jobTitle,
        salary: newNotification.salary,
        contractType: newNotification.contractType,
        contact: newNotification.contact,
      };
    } else if (
      newNotification.type === "info" &&
      newNotification.title &&
      newNotification.description
    ) {
      notificationToAdd = {
        id: `notif-${Date.now()}`,
        title: newNotification.title,
        message: newNotification.description,
        type: "info",
        date: new Date().toISOString(),
        isRead: false,
        description: newNotification.description,
        uploadLink: newNotification.uploadLink,
      };
    }

    if (notificationToAdd) {
      setNotifications((prev) => [...prev, notificationToAdd as Notification]);
      setNewNotification({
        message: "",
        type: "job",
        company: "",
        jobTitle: "",
        salary: "",
        contractType: "",
        contact: "",
        description: "",
        uploadLink: "",
        title: "",
      });
    }
  };

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  // Add formation from e-training program
  const addFormationFromProgram = () => {
    if (!selectedProgramId) return;
    const program = trainingPrograms.find((p) => p.id === selectedProgramId);
    if (!program) return;

    // Prevent duplicates (by title or program id stored in links)
    const dup = formations.some((f) => f.title === program.title);
    if (dup) return;

    const nowIso = new Date().toISOString();
    const courses = (program.modules || []).map(
      (title) =>
        ({
          id: `course-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title,
          description: "",
          progress: 0,
          isCompleted: false,
          duration: "0",
          modules: [],
          // sessions filled via courseSessions modal later
        } as unknown as Course)
    );

    const links = [
      {
        id: `link-${Date.now()}`,
        title: "Suivre sur e-Training",
        url: "", // admin will fill URL
        type: "programme" as const,
      },
      // create session placeholders with empty URLs so admin can put links
      ...(program.sessions || []).map((s) => ({
        id: `link-${Date.now()}-${s.id}`,
        title: `Session: ${s.date}`,
        url: "",
        type: "session" as const,
      })),
    ];

    const newFormation = {
      id: `form-${Date.now()}`,
      title: program.title,
      description: program.description,
      domain: program.category,
      level: (program.level as any) || "Débutant",
      duration: program.duration,
      status: "not_started",
      progress: 0,
      enrollmentDate: nowIso,
      completionDate: undefined,
      courses,
      links,
      thumbnail: "",
    } as unknown as Formation;

    setFormations((prev) => [...prev, newFormation]);
    // Track course titles list to allow sessions modal to work seamlessly
    setFormationCourses((prev) => ({
      ...prev,
      [newFormation.title]: program.modules || [],
    }));
    setSelectedProgramId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: { [k: string]: string } = {};
    if (!formData.fullName || !formData.fullName.trim()) {
      newErrors.fullName = "Le nom complet est requis";
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Merge courses and sessions into formations following mock structure
    const mergedFormations: Formation[] = formations.map((f) => {
      const courseTitles = formationCourses[f.title] || [];
      const courses: Course[] = courseTitles.map((title) => {
        const courseKey = `${f.title}-${title}`;
        const sessionsForCourse: Session[] = courseSessions[courseKey] || [];
        return {
          id: `course-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title,
          description: "",
          progress: 0,
          isCompleted: false,
          duration: "0",
          modules: [],
          sessions: sessionsForCourse,
        } as unknown as Course; // accommodate optional sessions in type
      });

      return {
        ...f,
        courses: f.courses && f.courses.length > 0 ? f.courses : courses,
        links: f.links || [],
      };
    });

    const dataToSubmit: Partial<Participant> = {
      ...formData,
      formations: mergedFormations,
      projects,
      coachingResources,
      notifications,
    };

    onSubmit(dataToSubmit);
  };

  // Formation management functions
  const addFormation = () => {
    if (newFormation.trim()) {
      const newFormationObject: Formation = {
        id: `form-${Date.now()}`,
        title: newFormation.trim(),
        description: "",
        domain: "Général",
        level: "Débutant",
        duration: "0 heures",
        status: "not_started",
        progress: 0,
        enrollmentDate: new Date().toISOString(),
        courses: [],
        links: [],
      };
      setFormations((prev) => [...prev, newFormationObject]);
      setSelectedFormation(newFormationObject.title);
      setNewFormation("");
      setShowCourseModal(true);
    }
  };

  const openCourseModal = (formationTitle: string) => {
    setSelectedFormation(formationTitle);
    setShowCourseModal(true);
  };

  const removeFormation = (index: number) => {
    const formationToRemove = formations[index];
    setFormations((prev) => prev.filter((_, i) => i !== index));
    // Remove courses for this formation
    if (formationToRemove) {
      setFormationCourses((prev) => {
        const newCourses = { ...prev };
        delete newCourses[formationToRemove.title];
        return newCourses;
      });
    }
  };

  // Course management functions
  const addCourse = () => {
    if (newCourse.trim() && selectedFormation) {
      setFormationCourses((prev) => ({
        ...prev,
        [selectedFormation]: [
          ...(prev[selectedFormation] || []),
          newCourse.trim(),
        ],
      }));
      setNewCourse("");
    }
  };

  const removeCourse = (courseIndex: number) => {
    if (selectedFormation) {
      setFormationCourses((prev) => ({
        ...prev,
        [selectedFormation]: (prev[selectedFormation] || []).filter(
          (_, i) => i !== courseIndex
        ),
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
      const newSessionObject: Session = {
        id: `session-${Date.now()}`,
        title: newSession.trim(),
        description: "",
        duration: "0",
        isCompleted: false,
        order: (courseSessions[courseKey]?.length || 0) + 1,
        links: [],
      };
      setCourseSessions((prev) => ({
        ...prev,
        [courseKey]: [...(prev[courseKey] || []), newSessionObject],
      }));
      setNewSession("");
    }
  };

  const removeSession = (sessionIndex: number) => {
    if (selectedCourse) {
      const courseKey = `${selectedFormation}-${selectedCourse}`;
      setCourseSessions((prev) => ({
        ...prev,
        [courseKey]: (prev[courseKey] || []).filter(
          (_, i) => i !== sessionIndex
        ),
      }));
    }
  };

  const closeSessionModal = () => {
    setShowSessionModal(false);
    setSelectedCourse("");
    setNewSession("");
  };

  // Session links management functions
  const openLinksModal = (index: number) => {
    setCurrentFormationIndex(index);
    setIsLinksModalOpen(true);
    setShowLinkForm(false);
    setNewLink({ url: "", type: "" });
  };

  const handleAddLinkClick = (type: FormationLink["type"]) => {
    setNewLink({ url: "", type });
    setShowLinkForm(true);
  };

  const saveLinkToFormation = () => {
    if (currentFormationIndex === null || !newLink.url.trim() || !newLink.type)
      return;

    const updatedFormations = [...formations];
    const formation = updatedFormations[currentFormationIndex];

    const linkToAdd: FormationLink = {
      id: `link-${Date.now()}`,
      title: newLink.type,
      url: newLink.url,
      type: newLink.type,
    };

    if (!formation.links) {
      formation.links = [];
    }
    formation.links.push(linkToAdd);

    setFormations(updatedFormations);
    setShowLinkForm(false);
    setNewLink({ url: "", type: "" });
  };

  const removeLinkFromFormation = (linkIndex: number) => {
    if (currentFormationIndex === null) return;

    const updatedFormations = [...formations];
    const formation = updatedFormations[currentFormationIndex];

    if (formation.links) {
      formation.links.splice(linkIndex, 1);
      setFormations(updatedFormations);
    }
  };

  const closeLinksModal = () => {
    setIsLinksModalOpen(false);
    setCurrentFormationIndex(null);
    setShowLinkForm(false);
    setNewLink({ url: "", type: "" });
  };

  // Update a field on a specific formation
  const updateFormationField = (
    index: number,
    field: keyof Formation,
    value: any
  ) => {
    const updated = [...formations];
    // @ts-expect-error dynamic assign into Formation fields present in admin shape
    updated[index][field] = value;
    setFormations(updated);
  };

  const tabs = [
    { id: "personal", label: "Informations personnelles", icon: UserIcon },
    { id: "academic", label: "Formations & Projets", icon: AcademicCapIcon },
    {
      id: "resources",
      label: "Ressources & Notifications",
      icon: BookOpenIcon,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id as "personal" | "academic" | "resources")
                }
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <form onSubmit={handleSubmit}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "personal" && (
            <div className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  {formData.avatar ? (
                    <img
                      className="h-20 w-20 rounded-full object-cover border-4 border-gray-200"
                      src={formData.avatar}
                      alt="Avatar"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                      <PhotoIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo de profil
                  </label>
                  <input
                    type="url"
                    placeholder="URL de l'image..."
                    value={formData.avatar}
                    onChange={(e) =>
                      handleInputChange("avatar", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Participant ID - visible in edit mode; info in add mode */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                {initialData?.id ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">
                        ID du participant
                      </div>
                      <div className="font-mono text-sm text-gray-900">
                        {initialData.id}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyIdToClipboard(initialData.id as string)
                      }
                      className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-200 rounded"
                      title="Copier l'ID"
                    >
                      Copier
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-gray-600">
                    L'ID sera généré automatiquement lors de l'enregistrement.
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserIcon className="w-4 h-4 inline mr-1" />
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Prénom Nom"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <PhoneIcon className="w-4 h-4 inline mr-1" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+216 XX XXX XXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address || ""}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Adresse complète"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.status || "active"}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="graduated">Diplômé</option>
                    <option value="suspended">Suspendu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'inscription
                  </label>
                  <input
                    type="date"
                    value={
                      formData.enrollmentDate
                        ? new Date(formData.enrollmentDate)
                            .toISOString()
                            .slice(0, 10)
                        : ""
                    }
                    onChange={(e) => {
                      const iso = e.target.value
                        ? new Date(e.target.value).toISOString()
                        : "";
                      handleInputChange("enrollmentDate", iso);
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dernière activité
                  </label>
                  <input
                    type="date"
                    value={
                      formData.lastActivity
                        ? new Date(formData.lastActivity)
                            .toISOString()
                            .slice(0, 10)
                        : ""
                    }
                    onChange={(e) => {
                      const iso = e.target.value
                        ? new Date(e.target.value).toISOString()
                        : "";
                      handleInputChange("lastActivity", iso);
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Remarques administratives..."
                />
              </div>
            </div>
          )}

          {activeTab === "academic" && (
            <div className="space-y-6">
              {/* Import from e-Training Catalog */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ajouter depuis e-Training
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedProgramId}
                    onChange={(e) => setSelectedProgramId(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  >
                    <option value="">Sélectionner un programme…</option>
                    {trainingPrograms.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} — {p.category} — {p.level}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addFormationFromProgram}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <PlusIcon className="w-4 h-4" /> Ajouter
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Les champs seront remplis automatiquement. Vous pourrez saisir
                  les URLs des boutons (liens) manuellement.
                </p>
              </div>
              {/* Formations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Formations assignées
                </h3>

                <div className="mb-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newFormation}
                      onChange={(e) => setNewFormation(e.target.value)}
                      placeholder="Nom de la formation..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addFormation())
                      }
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

                <div className="space-y-2">
                  {formations.map((formation, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center justify-between bg-blue-50 p-3 rounded-t-lg">
                        <div className="flex-1">
                          <span className="text-gray-900 font-medium">
                            {formation.title}
                          </span>
                          {formationCourses[formation.title] &&
                            formationCourses[formation.title].length > 0 && (
                              <div className="text-xs text-blue-600 mt-1">
                                {formationCourses[formation.title].length} cours
                                ajouté(s)
                              </div>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => openCourseModal(formation.title)}
                            className="text-blue-500 hover:text-blue-700 text-sm"
                            title="Gérer les cours"
                          >
                            Cours
                          </button>
                          <button
                            type="button"
                            onClick={() => openLinksModal(index)}
                            className="text-green-500 hover:text-green-700 text-sm"
                            title="Gérer les liens"
                          >
                            Liens
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenFormationIndex(
                                openFormationIndex === index ? null : index
                              )
                            }
                            className="text-gray-600 hover:text-gray-800 text-sm"
                            title="Détails"
                          >
                            {openFormationIndex === index
                              ? "Masquer"
                              : "Détails"}
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

                      {openFormationIndex === index && (
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description courte
                              </label>
                              <textarea
                                rows={3}
                                value={formation.description || ""}
                                onChange={(e) =>
                                  updateFormationField(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Résumé de la formation…"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Image (URL)
                              </label>
                              <input
                                type="url"
                                value={formation.thumbnail || ""}
                                onChange={(e) =>
                                  updateFormationField(
                                    index,
                                    "thumbnail",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://…"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Domaine
                                </label>
                                <input
                                  type="text"
                                  value={formation.domain || ""}
                                  onChange={(e) =>
                                    updateFormationField(
                                      index,
                                      "domain",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Ex: Développement Web"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Niveau
                                </label>
                                <select
                                  value={formation.level || "Débutant"}
                                  onChange={(e) =>
                                    updateFormationField(
                                      index,
                                      "level",
                                      e.target.value as any
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option>Débutant</option>
                                  <option>Intermédiaire</option>
                                  <option>Avancé</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Durée
                                </label>
                                <input
                                  type="text"
                                  value={formation.duration || ""}
                                  onChange={(e) =>
                                    updateFormationField(
                                      index,
                                      "duration",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Ex: 120h"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Aperçu */}
                          <div>
                            <div className="rounded-lg border overflow-hidden shadow-sm">
                              <div className="relative h-28 bg-gray-200">
                                {formation.thumbnail ? (
                                  <img
                                    src={formation.thumbnail}
                                    alt="thumb"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                    Aperçu image
                                  </div>
                                )}
                                <span className="absolute top-2 right-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                                  {formation.level || "Débutant"}
                                </span>
                              </div>
                              <div className="p-3">
                                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                  {formation.domain && (
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                      {formation.domain}
                                    </span>
                                  )}
                                  {formation.duration && (
                                    <span className="text-gray-500">
                                      {formation.duration}
                                    </span>
                                  )}
                                </div>
                                <div className="font-semibold text-gray-900 mb-1">
                                  {formation.title}
                                </div>
                                {formation.description && (
                                  <div className="text-sm text-gray-600 line-clamp-2">
                                    {formation.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BriefcaseIcon className="w-4 h-4 inline mr-1" />
                  Projets assignés
                </label>
                <button
                  type="button"
                  onClick={() => setShowProjectModal(true)}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Ajouter un projet
                </button>
                {projects.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {projects.map((project, index) => (
                      <div
                        key={project.id}
                        className="bg-gray-50 p-3 rounded-lg border"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-800">
                            {project.title}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeProject(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {project.description}
                        </p>
                        <div className="text-xs text-gray-500 mt-2 space-y-1">
                          <p>
                            <span className="font-medium">Formation:</span>{" "}
                            {project.formationTitle}
                          </p>
                          <p>
                            <span className="font-medium">Échéance:</span>{" "}
                            {project.dueDate
                              ? new Date(project.dueDate).toLocaleDateString()
                              : "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Statut:</span>{" "}
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                project.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {project.status}
                            </span>
                          </p>
                          {project.feedback && (
                            <p>
                              <span className="font-medium">Commentaires:</span>{" "}
                              {project.feedback}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Coaching Resources */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpenIcon className="w-5 h-5 mr-2 text-purple-500" />
                  Ressources de coaching
                </h3>

                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      type="text"
                      value={newResource.title}
                      onChange={(e) =>
                        setNewResource((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Nom de la ressource..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={newResource.icon}
                      onChange={(e) =>
                        setNewResource((prev) => ({
                          ...prev,
                          icon: e.target.value,
                        }))
                      }
                      placeholder="Icône (nom ou URL)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="url"
                      value={newResource.url}
                      onChange={(e) =>
                        setNewResource((prev) => ({
                          ...prev,
                          url: e.target.value,
                        }))
                      }
                      placeholder="URL de la ressource..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addResource())
                      }
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

                <div className="space-y-2">
                  {coachingResources.map((resource, index) => (
                    <div
                      key={index}
                      className="bg-purple-50 p-3 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 font-medium">
                          {resource.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeResource(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                      {resource.dataLinks && resource.dataLinks[0] && (
                        <a
                          href={resource.dataLinks[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-600 hover:underline mt-1 block truncate"
                        >
                          {resource.dataLinks[0].url}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Information Note removed per request */}
            </div>
          )}

          {activeTab === "resources" && (
            <div className="space-y-6">
              {/* Duplicate 'Ressources de coaching' section removed */}

              {/* Notifications Section */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <BellIcon className="w-6 h-6 mr-2 text-yellow-500" />
                  Notifications
                </h3>

                <div className="mb-4 space-y-4">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type de notification
                      </label>
                      <select
                        value={newNotification.type}
                        onChange={(e) =>
                          setNewNotification({
                            ...newNotification,
                            type: e.target.value as Notification["type"],
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="job">Emploi</option>
                        <option value="info">Info</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={addNotification}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center space-x-1 self-end"
                    >
                      <PlusIcon className="w-4 h-4" />
                      <span>Ajouter Notification</span>
                    </button>
                  </div>

                  {newNotification.type === "job" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                      <input
                        type="text"
                        value={newNotification.jobTitle}
                        onChange={(e) =>
                          setNewNotification({
                            ...newNotification,
                            jobTitle: e.target.value,
                          })
                        }
                        placeholder="Poste"
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={newNotification.company}
                        onChange={(e) =>
                          setNewNotification({
                            ...newNotification,
                            company: e.target.value,
                          })
                        }
                        placeholder="Entreprise"
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={newNotification.salary}
                        onChange={(e) =>
                          setNewNotification({
                            ...newNotification,
                            salary: e.target.value,
                          })
                        }
                        placeholder="Salaire"
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={newNotification.contractType}
                        onChange={(e) =>
                          setNewNotification({
                            ...newNotification,
                            contractType: e.target.value,
                          })
                        }
                        placeholder="Contrat"
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={newNotification.contact}
                          onChange={(e) =>
                            setNewNotification({
                              ...newNotification,
                              contact: e.target.value,
                            })
                          }
                          placeholder="Contact"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                      <input
                        type="text"
                        value={newNotification.title}
                        onChange={(e) =>
                          setNewNotification({
                            ...newNotification,
                            title: e.target.value,
                          })
                        }
                        placeholder="Titre"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <textarea
                        value={newNotification.description}
                        onChange={(e) =>
                          setNewNotification({
                            ...newNotification,
                            description: e.target.value,
                          })
                        }
                        placeholder="Description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={3}
                      />
                      <input
                        type="text"
                        value={newNotification.uploadLink}
                        onChange={(e) =>
                          setNewNotification({
                            ...newNotification,
                            uploadLink: e.target.value,
                          })
                        }
                        placeholder="Lien de téléchargement"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {notifications.map((notification, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border`}
                    >
                      <div className="flex items-center">
                        <p className="text-sm text-gray-600">
                          {notification.message}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNotification(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {initialData ? "Mettre à jour" : "Créer le participant"}
          </button>
        </div>
      </form>

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ajouter un nouveau projet
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Titre du projet
                </label>
                <input
                  type="text"
                  value={newProjectDetails.title}
                  onChange={(e) =>
                    setNewProjectDetails((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newProjectDetails.description}
                  onChange={(e) =>
                    setNewProjectDetails((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Formation associée
                </label>
                <select
                  value={newProjectDetails.formationId}
                  onChange={(e) =>
                    setNewProjectDetails((prev) => ({
                      ...prev,
                      formationId: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionner une formation</option>
                  {formations.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Échéance
                </label>
                <input
                  type="date"
                  value={newProjectDetails.dueDate}
                  onChange={(e) =>
                    setNewProjectDetails((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Note obtenue (sur 20)
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={1}
                  placeholder="18"
                  value={newProjectDetails.grade ?? ""}
                  onChange={(e) =>
                    setNewProjectDetails((prev) => ({
                      ...prev,
                      grade:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    }))
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Commentaires du formateur
                </label>
                <textarea
                  value={newProjectDetails.feedback}
                  onChange={(e) =>
                    setNewProjectDetails((prev) => ({
                      ...prev,
                      feedback: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="project-visible"
                  type="checkbox"
                  checked={newProjectDetails.isVisible ?? true}
                  onChange={(e) =>
                    setNewProjectDetails((prev) => ({
                      ...prev,
                      isVisible: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="project-visible"
                  className="text-sm text-gray-700 select-none"
                >
                  Afficher ce projet au participant
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={addProject}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Management Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Gérer les cours - {selectedFormation}
            </h3>

            {/* Add Course Input */}
            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  placeholder="Nom du cours..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addCourse())
                  }
                />
                <button
                  type="button"
                  onClick={addCourse}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Ajouter
                </button>
              </div>
            </div>

            {/* Course List */}
            <div className="mb-4 max-h-48 overflow-y-auto">
              {selectedFormation &&
              formationCourses[selectedFormation] &&
              formationCourses[selectedFormation].length > 0 ? (
                <div className="space-y-2">
                  {formationCourses[selectedFormation].map((course, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded border"
                    >
                      <div className="flex-1">
                        <span className="text-gray-900">{course}</span>
                        {courseSessions[`${selectedFormation}-${course}`]
                          ?.length > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            {
                              courseSessions[`${selectedFormation}-${course}`]
                                .length
                            }{" "}
                            session(s) ajoutée(s)
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => openSessionModal(course)}
                          className="text-green-500 hover:text-green-700 text-xs px-2 py-1 border border-green-300 rounded"
                          title="Gérer les sessions"
                        >
                          Sessions
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCourse(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Aucun cours ajouté</p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeCourseModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Fermer
              </button>
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
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addSession())
                  }
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
                {courseSessions[`${selectedFormation}-${selectedCourse}`]?.map(
                  (session, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 px-3 py-2 rounded-lg mb-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="text-sm text-gray-700">
                            {session.title}
                          </span>
                          {session.links.length > 0 && (
                            <div className="text-xs text-blue-600 mt-1">
                              {session.links.length} lien(s) ajouté(s)
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const idx = formations.findIndex(
                                (f) => f.title === selectedFormation
                              );
                              if (idx >= 0) openLinksModal(idx);
                            }}
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
                  )
                )}
                {(!courseSessions[`${selectedFormation}-${selectedCourse}`] ||
                  courseSessions[`${selectedFormation}-${selectedCourse}`]
                    .length === 0) && (
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
      {isLinksModalOpen && currentFormationIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {(() => {
                  const formation =
                    currentFormationIndex !== null
                      ? formations[currentFormationIndex]
                      : undefined;
                  return `Liens pour: ${formation?.title ?? ""}`;
                })()}
              </h3>
              <button
                onClick={closeLinksModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleAddLinkClick("Résumé")}
                  className="p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  + Résumé
                </button>
                <button
                  type="button"
                  onClick={() => handleAddLinkClick("Support")}
                  className="p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  + Support
                </button>
                <button
                  type="button"
                  onClick={() => handleAddLinkClick("Vidéo")}
                  className="p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  + Vidéo
                </button>
                <button
                  type="button"
                  onClick={() => handleAddLinkClick("Exercice")}
                  className="p-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                >
                  + Exercice
                </button>
              </div>

              {showLinkForm && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold mb-2">
                    Ajouter un lien pour "{newLink.type}"
                  </h4>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={newLink.url}
                      onChange={(e) =>
                        setNewLink({ ...newLink, url: e.target.value })
                      }
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button
                      onClick={saveLinkToFormation}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4">
                {(() => {
                  const formation =
                    currentFormationIndex !== null
                      ? formations[currentFormationIndex]
                      : undefined;
                  return formation?.links && formation.links.length > 0;
                })() ? (
                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {(() => {
                      const formation =
                        currentFormationIndex !== null
                          ? formations[currentFormationIndex]
                          : undefined;
                      return formation?.links ?? [];
                    })().map((link, index) => (
                      <li
                        key={link.id}
                        className="text-gray-700 bg-gray-50 p-2 rounded-md flex justify-between items-center"
                      >
                        <span>
                          {link.title}:{" "}
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline truncate"
                          >
                            {link.url}
                          </a>
                        </span>
                        <button
                          onClick={() => removeLinkFromFormation(index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  !showLinkForm && (
                    <p className="text-center text-gray-500 mt-4">
                      Aucun lien ajouté pour cette formation
                    </p>
                  )
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

export default ParticipantFormEnhanced;
