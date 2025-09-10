// Types pour l'Espace Freelancer

export interface FreelancerSession {
  freelancerId: string;
  timestamp: number;
  isValid: boolean;
}

export interface JobOffer {
  id: string;
  title: string;
  description: string;
  client: string;
  clientName?: string;
  budget: number;
  price?: number;
  currency?: string;
  deadline: string;
  createdAt?: string;
  status: 'pending' | 'accepted' | 'refused' | 'completed' | 'available';
  skills: string[];
  requirements?: string[];
  workMode: 'remote' | 'hybrid' | 'onsite';
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high';
  category?: string;
}

export interface Meeting {
  id: string;
  title: string;
  client: string;
  date: string;
  time: string;
  duration: number; // en minutes
  type: 'project_kickoff' | 'progress_review' | 'training' | 'client_meeting';
  status: 'scheduled' | 'completed' | 'cancelled';
  meetingLink: string;
  platform?: string;
  participants?: string[];
  agenda: string;
  notes: string;
}

export interface Project {
  id: string;
  title: string;
  client: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
  progress: number; // pourcentage 0-100
  startDate: string;
  endDate: string;
  budget: number;
  description: string;
  teamMembers: string[];
  milestones: ProjectMilestone[];
}

export interface ProjectMilestone {
  name: string;
  completed: boolean;
  date: string;
}

export type DeliverableType = 'design' | 'code' | 'documentation' | 'prototype' | 'file' | 'link';

export interface Deliverable {
  id: string;
  title: string;
  projectId: string;
  type: DeliverableType;
  status: 'pending' | 'approved' | 'revision_requested' | 'rejected' | 'revision_needed';
  dueDate: string;
  submittedDate: string;
  submittedAt?: string;
  description: string;
  fileUrl: string;
  content?: string;
  feedback: string;
  rating: number; // 1-5 étoiles
}

export interface FreelancerStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalEarnings: number;
  monthlyEarnings: number;
  averageRating: number;
  totalHours: number;
  successRate: number; // pourcentage
  responseTime: string;
  clientSatisfaction: number; // pourcentage
}

export interface TeamInvitation {
  id: string;
  projectTitle: string;
  client: string;
  memberName: string;
  memberEmail: string;
  role: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface ProjectStatus {
  id: string;
  title: string;
  client: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold' | 'cancelled';
  progress: number;
  startDate: string;
  endDate: string;
  deadline?: string;
  lastUpdate?: string;
  workMode?: 'remote' | 'hybrid' | 'onsite';
  budget: number;
  description: string;
  teamMembers: string[];
}
