/**
 * TypeScript interfaces for the Admin Panel
 * Ready for backend integration
 */

// Authentication Types
export type Level = 'Avancé' | 'Débutant' | 'Intermédiaire' | 'Expert';

export interface Certificate {
  id: string;
  firstName: string;
  lastName: string;
  program: string;
  skills: string[];
  techniques: string[];
  grade: number;
  level: Level;
  certificateUrl: string;
  recommendationUrl: string;
  evaluationUrl: string;
  completionDate: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'moderator';
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

// Program Types
export interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  price: number;
  instructor: string;
  maxStudents: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Pack Types
export interface Module {
  moduleId: string;
  title: string;
}

export interface Theme {
  themeId: string;
  name: string;
  startDate: string;
  endDate: string;
  modules: Module[];
}

export interface Pack {
  packId: string;
  name: string;
  description: string;
  image: string;
  details: {
    themes: Theme[];
    advantages: string[];
    price: number;
    originalPrice: number;
    savings: number;
  };
}

// Testimonial Types
export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Session Types
export interface Session {
  id: string;
  title: string;
  programId: string;
  startDate: Date;
  endDate: Date;
  instructor: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'number' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

// Sidebar Navigation Types
export interface NavigationChild {
  name: string;
  href: string;
}

export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  children?: NavigationChild[];
}

// Dashboard Stats
export interface DashboardStats {
  totalPrograms: number;
  totalPacks: number;
  totalTestimonials: number;
  totalSessions: number;
  totalUsers: number;
  activePrograms: number;
  upcomingSessions: number;
  publishedTestimonials: number;
}

// Participant Stats
export interface ParticipantStats {
  total: number;
  completed: number;
  inProgress: number;
  dropped?: number;
}

// Notification Types
export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  contact?: string;
}
