export interface User {
  email: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export interface ParticipantStats {
  total: number;
  completed: number;
  inProgress: number;
  dropped?: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface Pack {
  id: string;
  title: string;
  description: string;
  price: number;
}

export interface Session {
  id: string;
  topic: string;
  date: string;
  duration: number;
}
