// Core application types
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: Date;
  lastLogin?: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

// Re-export specific types to avoid conflicts
export type { 
  Participant, 
  Formation, 
  Course, 
  Module, 
  Project, 
  ProjectFile, 
  CoachingResource, 
  Notification, 
  FAQ, 
  ParticipantStats 
} from './participant';
export * from './freelancer';
export * from './trainer';
export * from './partnership';
export * from './courses';
