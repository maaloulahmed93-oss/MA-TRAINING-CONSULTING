// Types pour l'Espace Partenariat

export interface PartnershipSession {
  partnerId: string;
  timestamp: number;
  isValid: boolean;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  type: "Entreprise" | "École";
  logo?: string;
  description?: string;
  contactPerson: string;
  phone?: string;
  address?: string;
  website?: string;
  joinDate: string;
}

export interface PartnershipProject {
  id: string;
  title: string;
  description: string;
  partnerId: string;
  status: "planning" | "in_progress" | "completed" | "on_hold";
  progress: number; // pourcentage 0-100
  startDate: string;
  endDate: string;
  budget?: number;
  participants: string[];
  objectives: string[];
  deliverables: string[];
}

export interface CoAnimatedFormation {
  id: string;
  title: string;
  description: string;
  partnerId: string;
  trainers: string[];
  partnerTrainers: string[];
  date: string;
  duration: number; // en heures
  location: "online" | "onsite" | "hybrid";
  participants: number;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  materials: string[];
}

export interface PartnershipEvent {
  id: string;
  title: string;
  description: string;
  type: "seminar" | "workshop" | "conference" | "networking";
  partnerId: string;
  date: string;
  time: string;
  duration: number; // en heures
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  organizers: string[];
  agenda: string[];
}

export interface PartnershipMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  attachments?: string[];
  priority: "low" | "medium" | "high";
}

export interface PartnershipStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalFormations: number;
  upcomingEvents: number;
  totalParticipants: number;
  partnershipDuration: number; // en mois
  satisfactionRate: number; // pourcentage
}
