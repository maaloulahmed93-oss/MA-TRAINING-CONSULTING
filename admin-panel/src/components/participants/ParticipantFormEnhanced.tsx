import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Participant,
  Formation,
  Project,
  CoachingResource,
  Session,
  Notification,
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
  TrashIcon,
} from "@heroicons/react/24/outline";
// import { trainingPrograms } from "../../data/trainingPrograms"; // Remplacé par API

// Interface pour les programmes depuis l'API
interface ApiProgram {
  _id: string;
  title: string;
  description: string;
  category: string | { _id: string; name: string };
  level: string;
  price: number;
  duration: string;
  maxParticipants: number;
  sessionsPerYear: number;
  modules: { title: string }[];
  sessions: { title: string; date: string }[];
  isActive?: boolean;
}

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
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatar: "",
    status: "active",
    address: "",
    notes: "",
    enrollmentDate: "",
    lastActivity: "",
    formations: [],
    projects: [],
    coachingResources: [],
    notifications: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [newFormation, setNewFormation] = useState("");
  const [formations, setFormations] = useState<Formation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null);
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
    projectUrl: "",
  });
  const [newResource, setNewResource] = useState({
    title: "",
    url: "",
    icon: "",
    type: "Guide",
    category: "Ressources",
  });
  const [coachingResources, setCoachingResources] = useState<
    CoachingResource[]
  >([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState("");
  const [newCourse, setNewCourse] = useState("");

  // e-Training catalog selection
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  // UI: open details for a formation
  const [openFormationIndex, setOpenFormationIndex] = useState<number | null>(
    null
  );

  // API Programs state
  const [apiPrograms, setApiPrograms] = useState<ApiProgram[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  
  // Notification editing state
  const [editingNotificationIndex, setEditingNotificationIndex] = useState<number | null>(null);

  // Add ref to prevent multiple calls
  const fetchingRef = useRef(false);

  // Fonction pour charger les programmes depuis l'API
  const fetchProgramsFromAPI = async () => {
    // Prevent multiple simultaneous calls using ref
    if (fetchingRef.current || loadingPrograms) {
      console.log('⚠️ Programs fetch already in progress, skipping...');
      return;
    }
    
    // Check if we already have programs
    if (apiPrograms.length > 0) {
      console.log('✅ Programs already loaded, skipping fetch');
      return;
    }
    
    fetchingRef.current = true;
    setLoadingPrograms(true);
    
    try {
      console.log('🔄 Chargement des programmes depuis l\'API...');
      
      const response = await fetch('/api/programs');
      
      // Handle non-200 responses
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response received:', text);
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setApiPrograms(data.data);
        console.log(`✅ ${data.data.length} programmes chargés depuis l'API`);
      } else {
        console.warn('⚠️ Aucun programme trouvé dans l\'API');
        setApiPrograms([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des programmes:', error);
      setApiPrograms([]);
    } finally {
      setLoadingPrograms(false);
      fetchingRef.current = false;
    }
  };

  // Session management state
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [newSession, setNewSession] = useState("");
  const [courseSessions, setCourseSessions] = useState<{
    [key: string]: Session[];
  }>({});

  // Formation links management (REMOVED - using Session Links instead)
  
  // Session Links Management
  const [isSessionLinksModalOpen, setIsSessionLinksModalOpen] = useState(false);
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number | null>(null);
  const [currentCourseKey, setCurrentCourseKey] = useState<string>("");
  const [newSessionLink, setNewSessionLink] = useState<{
    url: string;
    type: "Résumé" | "Support" | "Vidéo" | "Exercice" | "";
    title: string;
  }>({ url: "", type: "", title: "" });
  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotification, setNewNotification] = useState<Partial<Notification>>(
    {
      message: "",
      type: "info",
      title: "",
      description: "",
      uploadLink: "",
      link: "",
      phone: "",
      email: "",
      company: "",
      jobTitle: "",
      salary: "",
      contractType: "",
      contact: "",
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
      });
      
      setFormations(initialData.formations || []);
      
      // Try to restore project URLs from localStorage backup
      const backupProjects = localStorage.getItem('matc_projects_backup');
      let restoredProjects = initialData.projects || [];
      
      if (backupProjects) {
        try {
          const backup = JSON.parse(backupProjects);
          console.log('🔄 Attempting to restore project URLs from backup');
          
          // Merge URLs from backup with server data
          restoredProjects = (initialData.projects || []).map(serverProject => {
            const backupProject = backup.find((bp: any) => 
              bp.title === serverProject.title && bp.description === serverProject.description
            );
            
            if (backupProject && backupProject.projectUrl && !serverProject.projectUrl) {
              console.log(`🔗 Restored URL for project "${serverProject.title}": ${backupProject.projectUrl}`);
              return { ...serverProject, projectUrl: backupProject.projectUrl };
            }
            
            return serverProject;
          });
        } catch (error) {
          console.error('❌ Error restoring projects from backup:', error);
        }
      }
      
      setProjects(restoredProjects);
      
      // Try to restore coaching resources from localStorage backup
      const backupResources = localStorage.getItem('matc_coaching_resources_backup');
      let restoredResources = initialData.coachingResources || [];
      
      if (backupResources) {
        try {
          const backup = JSON.parse(backupResources);
          console.log('🔄 Attempting to restore coaching resources from backup');
          
          // Merge backup resources with server data
          const serverResourceIds = new Set((initialData.coachingResources || []).map(r => r.id));
          const backupOnlyResources = backup.filter((br: any) => !serverResourceIds.has(br.id));
          
          if (backupOnlyResources.length > 0) {
            console.log(`🔗 Restored ${backupOnlyResources.length} resources from backup`);
            restoredResources = [...(initialData.coachingResources || []), ...backupOnlyResources];
          }
        } catch (error) {
          console.error('❌ Error restoring coaching resources from backup:', error);
        }
      }
      
      // Only update coachingResources if we don't have any current resources
      // This prevents overriding newly added resources
      setCoachingResources(prevResources => {
        if (prevResources.length === 0) {
          // No current resources, load from initialData/backup
          return restoredResources;
        } else {
          // We have current resources, keep them and merge with any new ones from initialData
          const existingIds = new Set(prevResources.map(r => r.id));
          const newResources = restoredResources.filter(r => !existingIds.has(r.id));
          return [...prevResources, ...newResources];
        }
      });
      
      // Try to restore notifications from localStorage backup
      const backupNotifications = localStorage.getItem('matc_notifications_backup');
      let restoredNotifications = initialData.notifications || [];
      
      if (backupNotifications) {
        try {
          const backup = JSON.parse(backupNotifications);
          console.log('🔄 Attempting to restore notifications from backup');
          
          // Use server data as primary source, only restore from backup if no server data
          if ((initialData.notifications || []).length === 0 && backup.length > 0) {
            console.log(`🔗 No server notifications, restoring ${backup.length} from backup`);
            restoredNotifications = backup;
          } else {
            console.log(`📊 Using ${(initialData.notifications || []).length} server notifications`);
            restoredNotifications = initialData.notifications || [];
          }
        } catch (error) {
          console.error('❌ Error restoring notifications from backup:', error);
        }
      }
      
      // Only restore notifications on initial load when participant data is loaded
      if (restoredNotifications.length > 0) {
        console.log('📥 Initial notifications load:', restoredNotifications.length);
        setNotifications(restoredNotifications);
      }
    }
  }, [initialData]);

  // Charger les programmes depuis l'API au montage du composant
  useEffect(() => {
    // Only fetch if we don't have programs already
    if (apiPrograms.length === 0 && !loadingPrograms) {
      fetchProgramsFromAPI();
    }
  }, []);

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
      console.log('🔄 Saving project with details:', newProjectDetails);
      console.log('🔗 Project URL in details:', newProjectDetails.projectUrl);
      
      const selectedFormation = formations.find(
        (f) => f.id === newProjectDetails.formationId
      );

      if (editingProjectIndex !== null) {
        // Mode édition - mettre à jour le projet existant
        console.log('✏️ Editing existing project at index:', editingProjectIndex);
        console.log('📋 Original project:', projects[editingProjectIndex]);
        
        const updatedProject: Project = {
          ...projects[editingProjectIndex],
          title: newProjectDetails.title.trim(),
          description: newProjectDetails.description || "",
          formationId: newProjectDetails.formationId || "",
          formationTitle: selectedFormation?.title || "Non spécifiée",
          feedback: newProjectDetails.feedback || "",
          note: newProjectDetails.note || "",
          isVisible: newProjectDetails.isVisible ?? true,
          grade:
            typeof newProjectDetails.grade === "number"
              ? newProjectDetails.grade
              : newProjectDetails.grade
              ? Number(newProjectDetails.grade)
              : undefined,
          dueDate: newProjectDetails.dueDate
            ? new Date(newProjectDetails.dueDate).toISOString()
            : "",
          projectUrl: newProjectDetails.projectUrl || "",
          updatedAt: new Date().toISOString(),
        };
        
        console.log('💾 Updated project object:', updatedProject);
        console.log('🔗 Updated project URL:', updatedProject.projectUrl);
        
        setProjects((prev) => 
          prev.map((project, index) => 
            index === editingProjectIndex ? updatedProject : project
          )
        );
      } else {
        // Mode ajout - créer un nouveau projet
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
          projectUrl: newProjectDetails.projectUrl || "",
        };
        setProjects((prev) => [...prev, newProjectObject]);
      }
      
      setShowProjectModal(false);
      setEditingProjectIndex(null);
      setNewProjectDetails({
        title: "",
        description: "",
        formationId: "",
        dueDate: "",
        feedback: "",
        note: "",
        isVisible: true,
        grade: undefined,
        projectUrl: "",
      });
    }
  };

  const removeProject = (index: number) => {
    setProjects((prev) => prev.filter((_, i) => i !== index));
  };

  const editProject = (index: number) => {
    const project = projects[index];
    console.log('✏️ Opening edit for project:', project);
    console.log('🔗 Original project URL:', project.projectUrl);
    
    setEditingProjectIndex(index);
    const projectDetails = {
      title: project.title,
      description: project.description,
      formationId: project.formationId,
      formationTitle: project.formationTitle,
      dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : "",
      feedback: project.feedback || "",
      note: project.note || "",
      isVisible: project.isVisible ?? true,
      grade: project.grade,
      status: project.status,
      projectUrl: project.projectUrl || "",
    };
    
    console.log('📝 Setting project details:', projectDetails);
    console.log('🔗 Project URL being set:', projectDetails.projectUrl);
    
    setNewProjectDetails(projectDetails);
    setShowProjectModal(true);
  };

  const cancelProjectModal = () => {
    setShowProjectModal(false);
    setEditingProjectIndex(null);
    setNewProjectDetails({
      title: "",
      description: "",
      formationId: "",
      dueDate: "",
      feedback: "",
      note: "",
      isVisible: true,
      grade: undefined,
      projectUrl: "",
    });
  };

  const addResource = () => {
    if (newResource.title.trim() && newResource.url.trim()) {
      // Validate URL - reject console logs and invalid URLs
      const urlToAdd = newResource.url.trim();
      
      // Check for invalid URLs (console logs, participant IDs, etc.)
      const invalidPatterns = [
        'chunk-',
        'Download the React DevTools',
        'ParticipantFormEnhanced.tsx',
        'PART-',
        'console.log',
        'ProgramManager.tsx',
        'CategoryManager.tsx'
      ];
      
      const isInvalidUrl = invalidPatterns.some(pattern => 
        urlToAdd.includes(pattern)
      );
      
      if (isInvalidUrl) {
        alert('⚠️ URL invalide détecté! Veuillez entrer un lien web valide (ex: https://example.com)');
        return;
      }
      
      // Ensure URL starts with http:// or https://
      let validUrl = urlToAdd;
      if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
        validUrl = 'https://' + validUrl;
      }
      
      const newResourceObject: CoachingResource = {
        id: `res-${Date.now()}`,
        title: newResource.title.trim(),
        description: "",
        icon: newResource.icon?.trim() || "📄",
        category: (newResource.category as any) || "Ressources",
        type: (newResource.type as any) || "Guide",
        assignedDate: new Date().toISOString(),
        isCompleted: false,
        dataLinks: [
          {
            id: `link-${Date.now()}`,
            title: "Lien principal",
            url: validUrl,
            type: "external",
          },
        ],
      };
      setCoachingResources((prev) => [...prev, newResourceObject]);
      setNewResource({ title: "", url: "", icon: "", type: "Guide", category: "Ressources" });
    }
  };

  const removeResource = (index: number) => {
    setCoachingResources((prev) => prev.filter((_, i) => i !== index));
  };

  // Copy ID utility
  const copyIdToClipboard = (id: string) => {
    try {
      if (!id) return;
      
      // Always use fallback method to avoid permission issues
      fallbackCopy(id);
    } catch (error) {
      console.error("Copy failed:", error);
      fallbackCopy(id);
    }
  };

  const fallbackCopy = (id: string) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = id;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      window.alert("ID copié dans le presse-papiers");
    } catch (error) {
      console.error("Fallback copy failed:", error);
      // Show the ID in a prompt as last resort
      window.prompt("Copier cet ID:", id);
    }
  };

  const addNotification = () => {
    console.log('🔍 Adding notification with data:', {
      type: newNotification.type,
      title: newNotification.title,
      description: newNotification.description,
      link: newNotification.link,
      editingIndex: editingNotificationIndex
    });
    
    if (!newNotification.title?.trim() || !newNotification.description?.trim()) {
      console.log('❌ Title and description are required');
      return;
    }

    const notificationToAdd: Notification = {
      id: editingNotificationIndex !== null ? notifications[editingNotificationIndex].id : `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newNotification.title.trim(),
      message: newNotification.description.trim(),
      type: "information",
      date: editingNotificationIndex !== null ? notifications[editingNotificationIndex].date : new Date().toISOString(),
      isRead: editingNotificationIndex !== null ? notifications[editingNotificationIndex].isRead : false,
      description: newNotification.description.trim(),
      contact: newNotification.contact?.trim() || '',
    };
    
    console.log(`✅ ${editingNotificationIndex !== null ? 'Updating' : 'Creating'} notification:`, {
      id: notificationToAdd.id,
      title: notificationToAdd.title,
      description: notificationToAdd.description,
      contact: notificationToAdd.contact
    });

    setNotifications((prev) => {
      if (editingNotificationIndex !== null) {
        // Update existing notification
        const updated = [...prev];
        updated[editingNotificationIndex] = notificationToAdd;
        console.log('📝 Updated notification at index', editingNotificationIndex);
        return updated;
      } else {
        // Add new notification - no duplicate check needed with proper ID generation
        console.log('➕ Adding new notification');
        return [...prev, notificationToAdd];
      }
    });
    
    // Reset form
    setNewNotification({
      message: "", type: "information", company: "", jobTitle: "", salary: "",
      contractType: "", contact: "", description: "", uploadLink: "",
      phone: "", email: "", title: ""
    });
    setEditingNotificationIndex(null);
  };

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
    setEditingNotificationIndex(null); // إعادة تعيين حالة التحديث
  };

  // دالة تنظيف المكررات
  const cleanDuplicateNotifications = () => {
    setNotifications(prev => {
      const cleaned = prev.filter((notif, index, arr) => 
        arr.findIndex(n => n.id === notif.id) === index
      );
      
      if (cleaned.length !== prev.length) {
        console.log(`🧹 Cleaned ${prev.length - cleaned.length} duplicate notifications`);
      }
      
      return cleaned;
    });
  };

  // دالة لبدء تحديث إشعار موجود
  const editNotification = (index: number) => {
    const notification = notifications[index];
    console.log(`🔄 Started editing notification at index ${index}:`, {
      originalNotification: notification,
      totalNotifications: notifications.length
    });
    
    console.log('🔄 Setting editingNotificationIndex to:', index);
    
    setNewNotification({
      title: notification.title || "",
      description: notification.description || "",
      contact: notification.contact || "",
      message: notification.message || "",
      type: "information",
      company: "",
      jobTitle: "",
      salary: "",
      contractType: "",
      uploadLink: "",
      phone: "",
      email: "",
    });
    setEditingNotificationIndex(index);
    
    console.log('✅ editingNotificationIndex set to:', index);
    console.log('📝 Form data loaded:', {
      title: notification.title || "",
      description: notification.description || "",
      link: notification.link || "",
      contact: notification.contact || ""
    });
  };

  // Add formation from e-training program
  const addFormationFromProgram = () => {
    if (!selectedProgramId) return;
    const program = apiPrograms.find((p) => p._id === selectedProgramId);
    if (!program) return;

    // Prevent duplicates (by title or program id stored in links)
    const dup = formations.some((f) => f.title === program.title);
    if (dup) return;

    const nowIso = new Date().toISOString();
    const courses = (program.modules || []).map(
      (module) =>
        ({
          id: `course-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: module.title,
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
        id: `link-${Date.now()}-${s.title}`,
        title: `Session: ${s.date}`,
        url: "",
        type: "session" as const,
      })),
    ];

    const newFormation = {
      id: `form-${Date.now()}`,
      title: program.title,
      description: program.description,
      domain: typeof program.category === 'object' ? program.category.name : program.category,
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
    setSelectedProgramId("");
  };

  // Add state to prevent double submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) {
      console.log('⚠️ Submission already in progress, ignoring...');
      return;
    }

    setIsSubmitting(true);

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
      setIsSubmitting(false);
      return;
    }

    console.log('🚀 Starting participant submission...');

    // Use formations as they are - they already contain the courses with sessions
    const mergedFormations: Formation[] = formations.map((f) => {
      // Merge sessions from courseSessions state into formation courses
      const updatedCourses = (f.courses || []).map(course => {
        const courseKey = `${f.title}-${course.title}`;
        const sessionsForCourse: Session[] = courseSessions[courseKey] || course.sessions || [];
        return {
          ...course,
          sessions: sessionsForCourse,
        };
      });

      return {
        ...f,
        courses: updatedCourses,
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

    console.log('📊 Data to submit:', {
      fullName: dataToSubmit.fullName,
      formations: dataToSubmit.formations?.length || 0,
      projects: dataToSubmit.projects?.length || 0,
      coachingResources: dataToSubmit.coachingResources?.length || 0
    });
    
    console.log('📋 Projects being submitted:', projects);
    projects.forEach((project, index) => {
      console.log(`📝 Project ${index}:`, {
        title: project.title,
        projectUrl: project.projectUrl,
        hasUrl: !!project.projectUrl
      });
    });

    // Save projects with URLs to localStorage as backup
    localStorage.setItem('matc_projects_backup', JSON.stringify(projects));
    console.log('💾 Projects saved to localStorage as backup');
    
    // Save coaching resources to localStorage as backup
    localStorage.setItem('matc_coaching_resources_backup', JSON.stringify(coachingResources));
    console.log('💾 Coaching resources saved to localStorage as backup');
    
    // تنظيف المكررات قبل الحفظ
    const uniqueNotifications = notifications.filter((notif, index, arr) => 
      arr.findIndex(n => n.id === notif.id) === index
    );
    
    if (uniqueNotifications.length !== notifications.length) {
      console.log(`🧹 Cleaned ${notifications.length - uniqueNotifications.length} duplicates before saving`);
    }
    
    // Save notifications to localStorage as backup
    localStorage.setItem('matc_notifications_backup', JSON.stringify(uniqueNotifications));
    console.log('💾 Notifications saved to localStorage as backup');

    // Call parent onSubmit
    onSubmit(dataToSubmit);
    
    // Reset submission flag after successful save
    setTimeout(() => {
      console.log('✅ Participant saved successfully');
      
      // Reset submission flag without triggering re-render
      setIsSubmitting(false);
      
      console.log('✅ Form ready for next action');
    }, 1000);
  };

  // Formation field update function
  const updateFormationField = (index: number, field: string, value: string) => {
    setFormations(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          [field]: value
        };
      }
      return updated;
    });
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
    console.log('🔍 Opening course modal for formation:', formationTitle);
    setSelectedFormation(formationTitle);
    
    // Find formation for logging
    const formation = formations.find(f => f.title === formationTitle);
    console.log('📚 Found formation:', formation);
    
    if (formation && formation.courses) {
      const courseNames = formation.courses.map(course => course.title);
      console.log('📖 Existing courses:', courseNames);
    } else {
      console.log('⚠️ No courses found for this formation');
    }
    
    setShowCourseModal(true);
  };

  const removeFormation = (index: number) => {
    setFormations((prev) => prev.filter((_, i) => i !== index));
  };

  // Course management functions
  const addCourse = () => {
    if (newCourse.trim() && selectedFormation) {
      console.log('🔄 Adding course:', newCourse.trim(), 'to formation:', selectedFormation);
      
      // Update the formations array to persist the course
      setFormations(prev => {
        const updated = prev.map(formation => {
          if (formation.title === selectedFormation) {
            const newCourseObj = {
              id: `course-${Date.now()}`,
              title: newCourse.trim(),
              description: "",
              progress: 0,
              isCompleted: false,
              duration: "0",
              modules: [],
              sessions: []
            };
            const updatedFormation = {
              ...formation,
              courses: [...(formation.courses || []), newCourseObj]
            };
            console.log('📚 Updated formation:', updatedFormation);
            return updatedFormation;
          }
          return formation;
        });
        console.log('🎯 All formations:', updated);
        return updated;
      });

      setNewCourse("");
    }
  };

  const removeCourse = (courseIndex: number) => {
    if (selectedFormation) {
      // Update the formations array to persist the removal
      setFormations(prev => {
        const updated = prev.map(formation => {
          if (formation.title === selectedFormation) {
            return {
              ...formation,
              courses: (formation.courses || []).filter((_, i) => i !== courseIndex)
            };
          }
          return formation;
        });
        return updated;
      });
    }
  };

  const closeCourseModal = () => {
    setShowCourseModal(false);
    setSelectedFormation("");
    setNewCourse("");
  };

  // Session management functions
  const openSessionModal = (course: string) => {
    console.log('🔍 Opening session modal for course:', course, 'in formation:', selectedFormation);
    setSelectedCourse(course);
    
    // Sync courseSessions with formations.courses[].sessions for UI display
    const formation = formations.find(f => f.title === selectedFormation);
    if (formation) {
      const courseObj = formation.courses.find(c => c.title === course);
      if (courseObj && courseObj.sessions) {
        const courseKey = `${selectedFormation}-${course}`;
        console.log('📚 Found existing sessions:', courseObj.sessions);
        setCourseSessions(prev => ({
          ...prev,
          [courseKey]: courseObj.sessions
        }));
      } else {
        console.log('⚠️ No sessions found for this course');
      }
    }
    
    setShowSessionModal(true);
  };

  const addSession = () => {
    if (newSession.trim() && selectedCourse) {
      console.log('🔄 Adding session:', newSession.trim(), 'to course:', selectedCourse);
      
      const courseKey = `${selectedFormation}-${selectedCourse}`;
      const newSessionObject: Session = {
        id: `session-${Date.now()}`,
        title: newSession.trim(),
        description: "",
        duration: "0",
        isCompleted: false,
        order: (courseSessions[courseKey]?.length || 0) + 1,
        links: [], // Initialize with empty links array
      };

      // Update courseSessions for UI display
      setCourseSessions((prev) => {
        const updated = {
          ...prev,
          [courseKey]: [...(prev[courseKey] || []), newSessionObject],
        };
        console.log('📊 Updated courseSessions:', updated);
        return updated;
      });

      // Also update the formations array to persist the session
      setFormations(prev => {
        const updated = prev.map(formation => {
          if (formation.title === selectedFormation) {
            const updatedCourses = formation.courses.map(course => {
              if (course.title === selectedCourse) {
                const updatedCourse = {
                  ...course,
                  sessions: [...(course.sessions || []), newSessionObject]
                };
                console.log('📚 Updated course with session:', updatedCourse);
                return updatedCourse;
              }
              return course;
            });
            return { ...formation, courses: updatedCourses };
          }
          return formation;
        });
        console.log('🎯 All formations with sessions:', updated);
        return updated;
      });

      setNewSession("");
    }
  };

  const removeSession = (sessionIndex: number) => {
    if (selectedCourse) {
      const courseKey = `${selectedFormation}-${selectedCourse}`;
      
      // Update courseSessions for UI display
      setCourseSessions((prev) => ({
        ...prev,
        [courseKey]: (prev[courseKey] || []).filter(
          (_, i) => i !== sessionIndex
        ),
      }));

      // Also update the formations array to persist the removal
      setFormations(prev => {
        const updated = prev.map(formation => {
          if (formation.title === selectedFormation) {
            const updatedCourses = formation.courses.map(course => {
              if (course.title === selectedCourse) {
                return {
                  ...course,
                  sessions: (course.sessions || []).filter((_, i) => i !== sessionIndex)
                };
              }
              return course;
            });
            return { ...formation, courses: updatedCourses };
          }
          return formation;
        });
        return updated;
      });
    }
  };

  const closeSessionModal = () => {
    setShowSessionModal(false);
    setSelectedCourse("");
    setNewSession("");
  };

  // Formation Links functions REMOVED - using Session Links instead

  // Session Links Management Functions
  const openSessionLinksModal = (courseKey: string, sessionIndex: number) => {
    console.log('🔗 Opening session links modal for:', { courseKey, sessionIndex });
    
    setCurrentCourseKey(courseKey);
    setCurrentSessionIndex(sessionIndex);
    
    // Sync links from formations array to courseSessions for accurate display
    const formation = formations.find(f => {
      return f.courses.some(c => `${f.title}-${c.title}` === courseKey);
    });
    
    if (formation) {
      const course = formation.courses.find(c => `${formation.title}-${c.title}` === courseKey);
      if (course && course.sessions && course.sessions[sessionIndex]) {
        const session = course.sessions[sessionIndex];
        console.log('📚 Syncing links from formations to courseSessions:', session.links || []);
        
        // Update courseSessions with the authoritative data from formations
        setCourseSessions(prev => {
          const updated = { ...prev };
          if (updated[courseKey] && updated[courseKey][sessionIndex]) {
            // Replace links completely with authoritative data from formations
            updated[courseKey][sessionIndex] = {
              ...updated[courseKey][sessionIndex],
              links: [...(session.links || [])] // Create new array to avoid reference issues
            };
            console.log('🔄 Replaced courseSessions links with formations data:', updated[courseKey][sessionIndex].links);
          }
          return updated;
        });
      }
    }
    
    setIsSessionLinksModalOpen(true);
  };

  const closeSessionLinksModal = () => {
    setIsSessionLinksModalOpen(false);
    setCurrentCourseKey("");
    setCurrentSessionIndex(null);
    setNewSessionLink({ url: "", type: "", title: "" });
  };

  // Add ref to prevent multiple calls
  const addingLinkRef = useRef(false);
  
  // Generate unique ID for session links
  const generateUniqueSessionLinkId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 11);
    const courseId = currentCourseKey.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const sessionId = currentSessionIndex?.toString() || '0';
    return `session-link-${timestamp}-${random}-${courseId}-${sessionId}`;
  };

  const addSessionLink = () => {
    // Prevent multiple simultaneous calls
    if (addingLinkRef.current) {
      console.log('⚠️ Link addition already in progress, skipping...');
      return;
    }

    if (!newSessionLink.url.trim() || !newSessionLink.type || !currentCourseKey || currentSessionIndex === null) {
      console.log('⚠️ Missing required fields for adding session link');
      return;
    }

    // Set the ref immediately to prevent double calls
    addingLinkRef.current = true;
    console.log('🔒 Setting addingLinkRef to true to prevent duplicates');

    const urlToAdd = newSessionLink.url.trim();
    const titleToAdd = newSessionLink.title.trim() || newSessionLink.type;

    console.log('🔗 Starting to add session link:', { urlToAdd, titleToAdd, type: newSessionLink.type });

    // Use formations array as the single source of truth for duplicate checking
    const formation = formations.find(f => {
      return f.courses.some(c => `${f.title}-${c.title}` === currentCourseKey);
    });
    const course = formation?.courses.find(c => `${formation.title}-${c.title}` === currentCourseKey);
    const session = course?.sessions[currentSessionIndex];
    const existingLinks = session?.links || [];

    console.log('📋 Existing links from formations (authoritative source):', existingLinks);
    
    // Also check courseSessions for immediate UI state
    const currentUILinks = courseSessions[currentCourseKey]?.[currentSessionIndex]?.links || [];
    console.log('📋 Current UI links from courseSessions:', currentUILinks);
    
    // Check for duplicates in both sources
    const isDuplicateUrl = existingLinks.some(link => link.url === urlToAdd) || 
                          currentUILinks.some(link => link.url === urlToAdd);
    
    if (isDuplicateUrl) {
      alert('⚠️ Ce lien existe déjà pour cette session!');
      addingLinkRef.current = false;
      return;
    }

    // Check for duplicate titles with same type in both sources
    const isDuplicateTitle = existingLinks.some(link => 
      link.title === titleToAdd && link.type === newSessionLink.type
    ) || currentUILinks.some(link => 
      link.title === titleToAdd && link.type === newSessionLink.type
    );
    
    if (isDuplicateTitle) {
      alert(`⚠️ Un lien "${titleToAdd}" de type "${newSessionLink.type}" existe déjà!`);
      addingLinkRef.current = false;
      return;
    }

    const newLinkObject = {
      id: generateUniqueSessionLinkId(),
      title: titleToAdd,
      url: urlToAdd,
      type: newSessionLink.type as "Résumé" | "Support" | "Vidéo" | "Exercice"
    };

    console.log('✅ Adding new session link:', newLinkObject);

    // Update formations array first (authoritative source)
    let updatedFormations: Formation[];
    setFormations(prev => {
      updatedFormations = prev.map((formation: Formation) => {
        const updatedCourses = formation.courses.map(course => {
          const courseKey = `${formation.title}-${course.title}`;
          if (courseKey === currentCourseKey) {
            const updatedSessions = course.sessions.map((session, index) => {
              if (index === currentSessionIndex) {
                return {
                  ...session,
                  links: [...(session.links || []), newLinkObject]
                };
              }
              return session;
            });
            return { ...course, sessions: updatedSessions };
          }
          return course;
        });
        return { ...formation, courses: updatedCourses };
      });
      console.log('🎯 Updated formations with new link');
      return updatedFormations;
    });

    // Update courseSessions to match formations (single source of truth)
    setCourseSessions(prev => {
      const updated = { ...prev };
      if (updated[currentCourseKey] && updated[currentCourseKey][currentSessionIndex]) {
        // Get the updated links from formations
        const formation = updatedFormations?.find((f: Formation) => 
          f.courses.some((c: Course) => `${f.title}-${c.title}` === currentCourseKey)
        );
        const course = formation?.courses.find((c: Course) => `${formation.title}-${c.title}` === currentCourseKey);
        const session = course?.sessions[currentSessionIndex];
        
        if (session) {
          updated[currentCourseKey][currentSessionIndex].links = [...(session.links || [])];
          console.log('📚 Synced courseSessions with formations:', updated[currentCourseKey][currentSessionIndex].links);
        }
      }
      return updated;
    });

    setNewSessionLink({ url: "", type: "", title: "" });
    
    // Reset the ref after a shorter delay
    setTimeout(() => {
      addingLinkRef.current = false;
      console.log('🔓 Reset addingLinkRef to false');
    }, 500);
  };

  const removeSessionLink = (linkIndex: number) => {
    if (!currentCourseKey || currentSessionIndex === null) return;

    console.log('🗑️ Removing session link at index:', linkIndex);

    // Update courseSessions for immediate UI display
    setCourseSessions(prev => {
      const updated = { ...prev };
      if (updated[currentCourseKey] && updated[currentCourseKey][currentSessionIndex]) {
        updated[currentCourseKey][currentSessionIndex].links =
          updated[currentCourseKey][currentSessionIndex].links.filter((_, i) => i !== linkIndex);
        console.log('📚 Updated session links after removal:', updated[currentCourseKey][currentSessionIndex].links);
      }
      return updated;
    });

    // Also update the formations array to persist the removal
    setFormations(prev => {
      const updated = prev.map(formation => {
        const updatedCourses = formation.courses.map(course => {
          const courseKey = `${formation.title}-${course.title}`;
          if (courseKey === currentCourseKey) {
            const updatedSessions = course.sessions.map((session, index) => {
              if (index === currentSessionIndex) {
                return {
                  ...session,
                  links: (session.links || []).filter((_, i) => i !== linkIndex)
                };
              }
              return session;
            });
            return { ...course, sessions: updatedSessions };
          }
          return course;
        });
        return { ...formation, courses: updatedCourses };
      });
      console.log('🎯 Updated formations after link removal');
      return updated;
    });
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
                    value={formData.avatar || ""}
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
                    value={formData.fullName || ""}
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
                    value={formData.email || ""}
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
                    value={formData.phone || ""}
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
                    <option key="active" value="active">Actif</option>
                    <option key="inactive" value="inactive">Inactif</option>
                    <option key="graduated" value="graduated">Diplômé</option>
                    <option key="suspended" value="suspended">Suspendu</option>
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
                    disabled={loadingPrograms}
                  >
                    <option key="empty" value="">
                      {loadingPrograms ? "Chargement des programmes..." : "Sélectionner un programme…"}
                    </option>
                    {apiPrograms.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title} — {typeof p.category === 'object' ? p.category.name : p.category} — {p.level}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={fetchProgramsFromAPI}
                    disabled={loadingPrograms}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                    title="Recharger les programmes"
                  >
                    🔄
                  </button>
                  <button
                    type="button"
                    onClick={addFormationFromProgram}
                    disabled={!selectedProgramId || loadingPrograms}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <PlusIcon className="w-4 h-4" /> Ajouter
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Les champs seront remplis automatiquement. Vous pourrez saisir
                  les URLs des boutons (liens) manuellement.
                  {apiPrograms.length > 0 && (
                    <span className="ml-2 text-green-600 font-medium">
                      ({apiPrograms.length} programmes disponibles)
                    </span>
                  )}
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
                      key={formation.id || `formation-${index}`}
                      className="bg-white rounded-lg border border-blue-200"
                    >
                      <div className="flex items-center justify-between bg-blue-50 p-3 rounded-t-lg">
                        <div className="flex-1">
                          <span className="text-gray-900 font-medium">
                            {formation.title}
                          </span>
                          {formation.courses && formation.courses.length > 0 && (
                              <div className="text-xs text-blue-600 mt-1">
                                {formation.courses.length} cours ajouté(s)
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
                          {/* Formation Links button REMOVED - using Session Links instead */}
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
                                  <option key="debutant" value="Débutant">Débutant</option>
                                  <option key="intermediaire" value="Intermédiaire">Intermédiaire</option>
                                  <option key="avance" value="Avancé">Avancé</option>
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
                    {projects.map((project, index) => {
                      console.log(`📋 Rendering project ${index}:`, project);
                      console.log(`🔗 Project ${index} URL:`, project.projectUrl);
                      return (
                        <div
                          key={project.id || `project-${index}`}
                          className="bg-gray-50 p-3 rounded-lg border"
                        >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-800">
                            {project.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => editProject(index)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Modifier le projet"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProject(index)}
                              className="text-red-500 hover:text-red-700"
                              title="Supprimer le projet"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>
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
                          {project.projectUrl && (
                            <p>
                              <span className="font-medium">Lien:</span>{" "}
                              <a 
                                href={project.projectUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline break-all"
                              >
                                {project.projectUrl}
                              </a>
                            </p>
                          )}
                          {project.feedback && (
                            <p>
                              <span className="font-medium">Commentaires:</span>{" "}
                              {project.feedback}
                            </p>
                          )}
                        </div>
                      </div>
                      );
                    })}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    <div className="relative">
                      <select
                        value={newResource.icon}
                        onChange={(e) =>
                          setNewResource((prev) => ({
                            ...prev,
                            icon: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option key="empty-icon" value="">Choisir une icône...</option>
                        
                        {/* Communication & Soft Skills */}
                        <option key="comm-efficace" value="💬">💬 Communication Efficace</option>
                        <option key="video-soft" value="🎥">🎥 Vidéo Soft Skills</option>
                        <option key="relations-inter" value="🤝">🤝 Relations Interpersonnelles</option>
                        <option key="presentation" value="🗣️">🗣️ Présentation Orale</option>
                        <option key="travail-equipe" value="👥">👥 Travail d'Équipe</option>
                        
                        {/* Guides & Documentation */}
                        <option key="guide-entretien" value="📖">📖 Guide Entretien d'Embauche</option>
                        <option key="guide-pratique" value="📋">📋 Guide Pratique</option>
                        <option key="document" value="📄">📄 Document/Manuel</option>
                        <option key="template" value="📝">📝 Template/Modèle</option>
                        <option key="livre" value="📚">📚 Livre/Formation</option>
                        
                        {/* Interactive & Games */}
                        <option key="quiz-leadership" value="❓">❓ Quiz Leadership Interactif</option>
                        <option key="jeux" value="🎮">🎮 Jeux Éducatifs</option>
                        <option key="quiz-test" value="🎯">🎯 Quiz/Test</option>
                        <option key="activites" value="🎲">🎲 Activités Ludiques</option>
                        <option key="challenges" value="🏆">🏆 Challenges</option>
                        
                        {/* Simulations & Scenarios */}
                        <option key="simulation" value="🎭">🎭 Simulation Entretien Client</option>
                        <option key="scenarios" value="🎪">🎪 Scénarios Pratiques</option>
                        <option key="mise-situation" value="🎬">🎬 Mise en Situation</option>
                        <option key="exercices" value="🎨">🎨 Exercices Créatifs</option>
                        <option key="cas-pratiques" value="⚡">⚡ Cas Pratiques</option>
                        
                        {/* Professional Skills */}
                        <option key="cv" value="💼">💼 CV/Portfolio</option>
                        <option key="lettre-motiv" value="✉️">✉️ Lettre de Motivation</option>
                        <option key="certification" value="🎓">🎓 Certification/Diplôme</option>
                        <option key="dev-personnel" value="📈">📈 Développement Personnel</option>
                        <option key="leadership" value="🌟">🌟 Leadership</option>
                        
                        {/* Technical & Digital */}
                        <option key="etraining" value="💻">💻 E-Training</option>
                        <option key="web" value="🌐">🌐 Ressources Web</option>
                        <option key="mobile" value="📱">📱 Applications Mobile</option>
                        <option key="outils" value="🔧">🔧 Outils Techniques</option>
                        <option key="config" value="⚙️">⚙️ Configuration</option>
                        
                        {/* Analysis & Evaluation */}
                        <option key="analyse" value="📊">📊 Analyse/Statistiques</option>
                        <option key="evaluation" value="🔍">🔍 Évaluation</option>
                        <option key="diagnostic" value="📉">📉 Diagnostic</option>
                        <option key="objectifs" value="🎯">🎯 Objectifs SMART</option>
                        <option key="conseils" value="💡">💡 Conseils/Tips</option>
                        
                        {/* Media & Content */}
                        <option key="podcast" value="🎤">🎤 Podcast/Audio</option>
                        <option key="audio" value="🔊">🔊 Contenu Audio</option>
                        <option key="webinaire" value="📺">📺 Webinaire</option>
                        <option key="visuel" value="📷">📷 Contenu Visuel</option>
                        <option key="multimedia" value="🎵">🎵 Contenu Multimédia</option>
                        
                        {/* Organization & Planning */}
                        <option key="planning" value="📅">📅 Planning/Agenda</option>
                        <option key="points" value="📌">📌 Points Importants</option>
                        <option key="liens" value="🔗">🔗 Liens Utiles</option>
                        <option key="favorites" value="⭐">⭐ Ressources Favorites</option>
                        <option key="demarrage" value="🚀">🚀 Démarrage Rapide</option>
                      </select>
                      {newResource.icon && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                          <span style={{ fontSize: '20px' }}>{newResource.icon}</span>
                        </div>
                      )}
                    </div>
                    
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
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addResource())
                      }
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <select
                      value={newResource.type}
                      onChange={(e) =>
                        setNewResource((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Guide">Guide</option>
                      <option value="CV Template">CV Template</option>
                      <option value="Lettre de motivation">Lettre de motivation</option>
                      <option value="Vidéo Soft Skills">Vidéo Soft Skills</option>
                      <option value="Jeux Éducatifs">Jeux Éducatifs</option>
                      <option value="Scénarios">Scénarios</option>
                      <option value="Bibliothèque Online">Bibliothèque Online</option>
                      <option value="Podcast">Podcast</option>
                      <option value="Atelier Interactif">Atelier Interactif</option>
                      <option value="Cas d'Etude">Cas d'Etude</option>
                      <option value="Webinaire">Webinaire</option>
                      <option value="Outils">Outils</option>
                    </select>
                    
                    <select
                      value={newResource.category}
                      onChange={(e) =>
                        setNewResource((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Ressources">Ressources</option>
                      <option value="Templates">Templates</option>
                      <option value="Soft Skills">Soft Skills</option>
                      <option value="Carrière">Carrière</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Innovation">Innovation</option>
                      <option value="Productivité">Productivité</option>
                    </select>
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

                <div className="space-y-3">
                  {coachingResources.map((resource, index) => (
                      <div
                        key={resource.id || `resource-${index}`}
                        className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {resource.icon && (
                              <div className="flex-shrink-0">
                                <span 
                                  style={{ 
                                    fontSize: '30px',
                                    width: '30px',
                                    height: '30px',
                                    display: 'inline-block',
                                    textAlign: 'center',
                                    lineHeight: '30px'
                                  }}
                                  className="block"
                                >
                                  {resource.icon}
                                </span>
                              </div>
                            )}
                            <div className="flex-1">
                              <span className="text-gray-900 font-medium text-lg">
                                {resource.title}
                              </span>
                              {resource.dataLinks && resource.dataLinks[0] && (
                                <a
                                  href={resource.dataLinks[0].url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-purple-600 hover:text-purple-800 hover:underline mt-1 block truncate transition-colors"
                                >
                                  🔗 {resource.dataLinks[0].url}
                                </a>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeResource(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded transition-colors"
                            title="Supprimer la ressource"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
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
                      <input
                        type="hidden"
                        value="information"
                        onChange={() =>
                          setNewNotification({
                            ...newNotification,
                            type: "information",
                          })
                        }
                      />
                      <div className="w-full px-3 py-2 bg-blue-50 border border-blue-300 rounded-lg text-blue-800 font-medium">
                        📄 Information
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 self-end">
                      <button
                        type="button"
                        onClick={addNotification}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center space-x-1"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>{editingNotificationIndex !== null ? 'Mettre à jour' : 'Ajouter Notification'}</span>
                      </button>
                      
                      {editingNotificationIndex !== null && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNotificationIndex(null);
                            setNewNotification({
                              message: "",
                              type: "information",
                              company: "",
                              jobTitle: "",
                              salary: "",
                              contractType: "",
                              contact: "",
                              description: "",
                              uploadLink: "",
                              phone: "",
                              email: "",
                              title: "",
                            });
                          }}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Annuler
                        </button>
                      )}
                      
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={cleanDuplicateNotifications}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-1"
                          title="Nettoyer les doublons"
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span>🧹 Nettoyer</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                    <input
                      type="text"
                      value={newNotification.title}
                      onChange={(e) =>
                        setNewNotification({
                          ...newNotification,
                          title: e.target.value,
                        })
                      }
                      placeholder="Titre (العنوان)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={newNotification.description}
                      onChange={(e) =>
                        setNewNotification({
                          ...newNotification,
                          description: e.target.value,
                        })
                      }
                      placeholder="Description (الوصف)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <input
                      type="text"
                      value={newNotification.contact}
                      onChange={(e) =>
                        setNewNotification({
                          ...newNotification,
                          contact: e.target.value,
                        })
                      }
                      placeholder="Contact (جهة الاتصال) - ex: Ahmed Ben Ali"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {notifications.map((notification, index) => {
                    // Determine background color and badge based on notification type
                    const getNotificationStyle = () => {
                      return { bg: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-800', icon: '📄', label: 'Information' };
                    };

                    const style = getNotificationStyle();

                    return (
                      <div
                        key={notification.id || `notification-${index}`}
                        className={`p-3 rounded-lg border ${style.bg}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Notification Type Badge */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${style.badge}`}>
                                {style.icon} {style.label}
                              </span>
                            </div>

                            {/* Title */}
                            {notification.title && (
                              <h4 className="font-medium text-gray-900 mb-1">
                                {notification.title}
                              </h4>
                            )}

                            {/* Message/Description */}
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message || notification.description}
                            </p>

                            {/* All Fields Display */}
                            <div className="space-y-1 mt-2 bg-gray-50 p-2 rounded text-xs">
                              {/* Description */}
                              {notification.description && (
                                <div>
                                  <span className="font-medium text-gray-700">📝 Description:</span>
                                  <span className="ml-1 text-gray-600">{notification.description}</span>
                                </div>
                              )}
                              
                              
                              {/* Contact */}
                              {notification.contact && (
                                <div>
                                  <span className="font-medium text-gray-700">👤 Contact:</span>
                                  <span className="ml-1 text-gray-600">{notification.contact}</span>
                                </div>
                              )}
                              
                              {/* Show if no details */}
                              {!notification.description && !notification.contact && (
                                <div className="text-gray-500 italic">
                                  Aucun détail supplémentaire
                                </div>
                              )}
                            </div>

                            {/* Date */}
                            <div className="text-xs text-gray-400 mt-2">
                              {new Date(notification.date).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1 ml-2">
                            {/* Edit Button */}
                            <button
                              onClick={() => editNotification(index)}
                              className="text-blue-500 hover:text-blue-700 p-1"
                              title="Modifier la notification"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            
                            {/* Delete Button */}
                            <button
                              onClick={() => removeNotification(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Supprimer la notification"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
              {editingProjectIndex !== null ? 'Modifier le projet' : 'Ajouter un nouveau projet'}
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
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  🔗 Lien du projet
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/project"
                  value={newProjectDetails.projectUrl || ""}
                  onChange={(e) => {
                    console.log('🔗 URL input changed to:', e.target.value);
                    setNewProjectDetails((prev) => {
                      const updated = {
                        ...prev,
                        projectUrl: e.target.value,
                      };
                      console.log('📝 Updated project details:', updated);
                      return updated;
                    });
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-blue-600 mt-1">
                  Exemple: https://github.com/user/project ou https://docs.google.com/...
                </p>
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
                  <option key="empty-formation" value="">Sélectionner une formation</option>
                  {formations.map((f, index) => (
                    <option key={f.id || `formation-${index}`} value={f.id || `formation-${index}`}>
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
                onClick={cancelProjectModal}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={addProject}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                {editingProjectIndex !== null ? 'Mettre à jour' : 'Enregistrer'}
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
              {(() => {
                const formation = formations.find(f => f.title === selectedFormation);
                const courses = formation?.courses || [];
                return courses.length > 0 ? (
                  <div className="space-y-2">
                    {courses.map((course, index) => (
                      <div
                        key={`course-${index}-${course.title}`}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded border"
                      >
                        <div className="flex-1">
                          <span className="text-gray-900">{course.title}</span>
                          {course.sessions && course.sessions.length > 0 && (
                            <div className="text-xs text-green-600 mt-1">
                              {course.sessions.length} session(s) ajoutée(s)
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => openSessionModal(course.title)}
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
                );
              })()}
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
                      key={session.id || `session-${index}`}
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
                            onClick={() => openSessionLinksModal(`${selectedFormation}-${selectedCourse}`, index)}
                            className="text-blue-500 hover:text-blue-700 text-xs px-2 py-1 border border-blue-300 rounded"
                            title="Gérer les liens de session"
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

      {/* Formation Links Modal REMOVED - using Session Links instead */}

      {/* Session Links Management Modal */}
      {isSessionLinksModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Gérer les liens de session
              </h3>
              <button
                onClick={closeSessionLinksModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Current Session Info */}
            {currentCourseKey && currentSessionIndex !== null && courseSessions[currentCourseKey] && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Session:</span> {courseSessions[currentCourseKey][currentSessionIndex]?.title}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Cours:</span> {currentCourseKey.split('-').pop()}
                </p>
              </div>
            )}

            {/* Add Session Link Form */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h4 className="text-md font-medium text-gray-800 mb-3">Ajouter un lien</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de lien
                  </label>
                  <select
                    value={newSessionLink.type}
                    onChange={(e) => setNewSessionLink(prev => ({ 
                      ...prev, 
                      type: e.target.value as "Résumé" | "Support" | "Vidéo" | "Exercice" | ""
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option key="empty-type" value="">Sélectionner un type</option>
                    <option key="resume" value="Résumé">📄 Résumé</option>
                    <option key="support" value="Support">📚 Support</option>
                    <option key="video" value="Vidéo">🎥 Vidéo</option>
                    <option key="exercice" value="Exercice">✏️ Exercice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre (optionnel)
                  </label>
                  <input
                    type="text"
                    value={newSessionLink.title}
                    onChange={(e) => setNewSessionLink(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Titre personnalisé..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL du lien
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={newSessionLink.url}
                    onChange={(e) => setNewSessionLink(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com/resource"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (!addingLinkRef.current) {
                          addSessionLink();
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!addingLinkRef.current) {
                        addSessionLink();
                      }
                    }}
                    disabled={!newSessionLink.url.trim() || !newSessionLink.type || addingLinkRef.current}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Ajouter</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Session Links List */}
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-800 mb-3">Liens existants</h4>
              
              {(() => {
                const links = currentCourseKey && currentSessionIndex !== null && courseSessions[currentCourseKey] && courseSessions[currentCourseKey][currentSessionIndex]?.links || [];
                console.log('🎨 Rendering links in modal:', links);
                console.log('🔑 Link IDs:', links.map(l => l.id));
                return links.length > 0;
              })() ? (
                <div className="space-y-2">
                  {currentCourseKey && currentSessionIndex !== null && courseSessions[currentCourseKey]?.[currentSessionIndex]?.links?.map((link: any, index: number) => (
                    <div
                      key={link.id || `link-${index}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-800">
                            {link.type === "Résumé" && "📄"}
                            {link.type === "Support" && "📚"}
                            {link.type === "Vidéo" && "🎥"}
                            {link.type === "Exercice" && "✏️"}
                            {link.type}
                          </span>
                          <span className="text-sm text-gray-600">-</span>
                          <span className="text-sm text-gray-700">{link.title}</span>
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 block truncate"
                        >
                          {link.url}
                        </a>
                      </div>
                      <button
                        onClick={() => removeSessionLink(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        title="Supprimer le lien"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4 border border-dashed border-gray-300 rounded-lg">
                  Aucun lien ajouté pour cette session
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button
                onClick={closeSessionLinksModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantFormEnhanced;
