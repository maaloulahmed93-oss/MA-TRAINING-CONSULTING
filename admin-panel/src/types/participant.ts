// Types pour la gestion des participants dans l'admin panel

export interface Participant {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  status: "active" | "inactive" | "graduated" | "suspended";
  enrollmentDate: string;
  lastActivity: string;
  totalProgress: number;
  completedCourses?: number;
  studyTime?: number;
  achievedGoals?: number;
  totalGoals?: number;
  formations: Formation[];
  projects: Project[];
  coachingResources: CoachingResource[];
  notifications: Notification[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormationLink {
  id: string;
  title: string;
  url: string;
  type: 'Résumé' | 'Support' | 'Vidéo' | 'Exercice';
}

export interface Formation {
  id: string;
  title: string;
  description: string;
  domain: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  duration: string;
  progress: number;
  status: "not_started" | "in_progress" | "completed" | "paused";
  enrollmentDate: string;
  completionDate?: string;
  courses: Course[];
  thumbnail?: string;
  links?: FormationLink[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  isCompleted: boolean;
  duration: string;
  modules: Module[];
  sessions: Session[];
}

export interface Session {
  id: string;
  title: string;
  description: string;
  duration: string;
  isCompleted: boolean;
  order: number;
  links: SessionLink[];
}

export interface SessionLink {
  id: string;
  type: "Résumé" | "Support" | "Vidéo" | "Exercice";
  title: string;
  url: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
  type: "video" | "document" | "quiz" | "project";
  content?: string;
  // Data links for each module
  dataLinks: ModuleDataLink[];
}

export interface ModuleDataLink {
  id: string;
  title: string;
  url: string;
  type: "video" | "document" | "resource" | "exercise" | "quiz";
  description?: string;
  fileSize?: string;
  duration?: string;
}

// Projects section
export interface Project {
  id: string;
  title: string;
  description: string;
  formationId: string;
  formationTitle: string;
  status:
    | "not_started"
    | "in_progress"
    | "submitted"
    | "accepted"
    | "rejected"
    | "completed";
  submittedDate?: string;
  dueDate: string;
  feedback?: string;
  grade?: number; // Note obtenue
  // Admin-only note and visibility
  note?: string;
  isVisible?: boolean;
  projectUrl?: string; // Lien vers le projet
  files: ProjectFile[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadDate: string;
  url?: string;
}

// Coaching & Orientation Resources
export interface CoachingResource {
  id: string;
  title: string;
  description: string;
  // Optional icon identifier or URL for display
  icon?: string;
  type:
    | "CV Template"
    | "Lettre de motivation"
    | "Vidéo Soft Skills"
    | "Guide"
    | "Jeux Éducatifs"
    | "Scénarios"
    | "Bibliothèque Online"
    | "Podcast"
    | "Atelier Interactif"
    | "Cas d'Etude"
    | "Webinaire"
    | "Outils";
  category:
    | "Templates"
    | "Soft Skills"
    | "Carrière"
    | "Ressources"
    | "Marketing"
    | "Innovation"
    | "Productivité";
  thumbnail?: string;
  downloadUrl?: string;
  duration?: string;
  // Data links for each resource
  dataLinks: ResourceDataLink[];
  assignedDate: string;
  accessedDate?: string;
  isCompleted: boolean;
}

export interface ResourceDataLink {
  id: string;
  title: string;
  url: string;
  type: "download" | "video" | "interactive" | "external";
  description?: string;
  fileSize?: string;
  duration?: string;
}

// Notifications system
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'job' | 'info' | 'success' | 'warning' | 'error' | 'information' | 'offre_emploi';
  date: string;
  isRead: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  contact?: string;
  actionUrl?: string;
  // Additional data for job notifications
  company?: string;
  jobTitle?: string;
  salary?: string;
  contractType?: string;
  environment?: string;
  benefits?: string;
  // Additional data for info notifications
  description?: string;
  uploadLink?: string;
  // New fields for specific notification types
  link?: string;      // For "information" type - clickable link
  phone?: string;     // For "offre_emploi" type - phone number
  email?: string;     // For "offre_emploi" type - email address
  // Data links for notifications
  dataLinks?: NotificationDataLink[];
}

export interface NotificationDataLink {
  id: string;
  title: string;
  url: string;
  type: "action" | "document" | "external";
  description?: string;
}

export interface ParticipantStats {
  total: number;
  active: number;
  graduated: number;
  suspended: number;
  newThisMonth: number;
  averageProgress: number;
}
