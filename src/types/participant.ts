// Types pour l'Espace Participant
export interface Participant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  enrolledDate: string;
  totalProgress: number;
  completedCourses: number;
  totalCourses: number;
}

export interface Formation {
  id: string;
  title: string;
  description: string;
  domain: string;
  progress: number;
  totalCourses: number;
  completedCourses: number;
  courses: Course[];
  thumbnail: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  duration: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  progress: number;
  isCompleted: boolean;
  duration: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
  type: 'video' | 'document' | 'quiz' | 'project';
  content?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  formationId: string;
  formationTitle: string;
  status: 'En attente' | 'Accepté' | 'Refusé' | 'En révision';
  submittedDate?: string;
  dueDate: string;
  feedback?: string;
  grade?: number;
  files: ProjectFile[];
}

export interface ProjectFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadDate: string;
}

export interface CoachingResource {
  id: string;
  title: string;
  description: string;
  type: 'CV Template' | 'Lettre de motivation' | 'Vidéo Soft Skills' | 'Guide' | 
        'Jeux Éducatifs' | 'Scénarios' | 'Bibliothèque Online' | 'Podcast' | 
        'Atelier Interactif' | 'Cas d\'Etude' | 'Webinaire' | 'Outils';
  category: string;
  downloadUrl?: string;
  duration?: string;
  thumbnail: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'job';
  date: string;
  isRead: boolean;
  actionUrl?: string;
  company?: string;
  position?: string;
  salary?: string;
  contract?: string;
  environment?: string;
  benefits?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isPopular: boolean;
}

export interface ParticipantStats {
  totalParticipants: number;
  activeParticipants: number;
  completedCourses: number;
  inProgress?: number;
}
