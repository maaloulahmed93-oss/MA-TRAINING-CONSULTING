// Service API pour l'Espace Entreprise - Remplace les mock data
import { Partner, PartnershipProject, CoAnimatedFormation, PartnershipEvent, PartnershipStats } from '../types/partnership';

const API_BASE_URL = 'https://matc-backend.onrender.com/api';

// Interface pour les réponses API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

// Gestion des erreurs API
const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  throw new Error(error.message || 'Erreur de communication avec le serveur');
};

// Fonction utilitaire pour les appels API
const apiCall = async <T>(url: string, options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Erreur API');
    }

    return result.data;
  } catch (error) {
    handleApiError(error);
  }
};

// === PROFIL ENTREPRISE ===

export const getEnterpriseProfile = async (partnerId: string): Promise<Partner> => {
  const data = await apiCall<any>(`/enterprise/${partnerId}/profile`);
  
  // Transformer les données backend vers le format frontend
  return {
    id: data.partnerId,
    name: data.fullName,
    email: data.email,
    type: data.type === 'entreprise' ? 'Entreprise' : 'École',
    contactPerson: data.contactPerson || '',
    phone: data.phone || '',
    address: data.address || '',
    website: data.website || '',
    joinDate: data.joinDate ? new Date(data.joinDate).toISOString().split('T')[0] : '',
    description: data.description || ''
  };
};

export const updateEnterpriseProfile = async (partnerId: string, profileData: Partial<Partner>): Promise<Partner> => {
  // Transformer les données frontend vers le format backend
  const backendData = {
    fullName: profileData.name,
    email: profileData.email,
    contactPerson: profileData.contactPerson,
    phone: profileData.phone,
    address: profileData.address,
    website: profileData.website,
    description: profileData.description
  };

  const data = await apiCall<any>(`/enterprise/${partnerId}/profile`, {
    method: 'PUT',
    body: JSON.stringify(backendData)
  });

  return {
    id: data.partnerId,
    name: data.fullName,
    email: data.email,
    type: data.type === 'entreprise' ? 'Entreprise' : 'École',
    contactPerson: data.contactPerson || '',
    phone: data.phone || '',
    address: data.address || '',
    website: data.website || '',
    joinDate: data.joinDate ? new Date(data.joinDate).toISOString().split('T')[0] : '',
    description: data.description || ''
  };
};

// === PROJETS ===

export const getEnterpriseProjects = async (partnerId: string): Promise<PartnershipProject[]> => {
  const data = await apiCall<any[]>(`/enterprise/${partnerId}/projects`);
  
  return data.map(project => ({
    id: project.projectId,
    title: project.title,
    description: project.description,
    partnerId: project.partnerId,
    status: project.status,
    progress: project.progress,
    startDate: new Date(project.startDate).toISOString().split('T')[0],
    endDate: new Date(project.endDate).toISOString().split('T')[0],
    budget: project.budget,
    participants: project.participants || [],
    objectives: project.objectives || [],
    deliverables: project.deliverables || []
  }));
};

export const createEnterpriseProject = async (partnerId: string, projectData: Omit<PartnershipProject, 'id' | 'partnerId'>): Promise<PartnershipProject> => {
  const data = await apiCall<any>(`/enterprise/${partnerId}/projects`, {
    method: 'POST',
    body: JSON.stringify(projectData)
  });

  return {
    id: data.projectId,
    title: data.title,
    description: data.description,
    partnerId: data.partnerId,
    status: data.status,
    progress: data.progress,
    startDate: new Date(data.startDate).toISOString().split('T')[0],
    endDate: new Date(data.endDate).toISOString().split('T')[0],
    budget: data.budget,
    participants: data.participants || [],
    objectives: data.objectives || [],
    deliverables: data.deliverables || []
  };
};

// === FORMATIONS ===

export const getEnterpriseFormations = async (partnerId: string): Promise<CoAnimatedFormation[]> => {
  const data = await apiCall<any[]>(`/enterprise/${partnerId}/formations`);
  
  return data.map(formation => ({
    id: formation.formationId,
    title: formation.title,
    description: formation.description,
    partnerId: formation.partnerId,
    trainers: formation.trainers || [],
    partnerTrainers: formation.partnerTrainers || [],
    date: new Date(formation.date).toISOString().split('T')[0],
    duration: formation.duration,
    location: formation.location,
    participants: formation.participants,
    status: formation.status,
    materials: formation.materials || []
  }));
};

export const createEnterpriseFormation = async (partnerId: string, formationData: Omit<CoAnimatedFormation, 'id' | 'partnerId'>): Promise<CoAnimatedFormation> => {
  const data = await apiCall<any>(`/enterprise/${partnerId}/formations`, {
    method: 'POST',
    body: JSON.stringify(formationData)
  });

  return {
    id: data.formationId,
    title: data.title,
    description: data.description,
    partnerId: data.partnerId,
    trainers: data.trainers || [],
    partnerTrainers: data.partnerTrainers || [],
    date: new Date(data.date).toISOString().split('T')[0],
    duration: data.duration,
    location: data.location,
    participants: data.participants,
    status: data.status,
    materials: data.materials || []
  };
};

// === ÉVÉNEMENTS ===

export const getEnterpriseEvents = async (partnerId: string): Promise<PartnershipEvent[]> => {
  const data = await apiCall<any[]>(`/enterprise/${partnerId}/events`);
  
  return data.map(event => ({
    id: event.eventId,
    title: event.title,
    description: event.description,
    type: event.type,
    partnerId: event.partnerId,
    date: new Date(event.date).toISOString().split('T')[0],
    time: event.time,
    duration: event.duration,
    location: event.location,
    maxParticipants: event.maxParticipants,
    currentParticipants: event.currentParticipants,
    status: event.status,
    organizers: event.organizers || [],
    agenda: event.agenda || []
  }));
};

// === PARTICIPANTS ===

export const getEnterpriseParticipants = async (partnerId: string): Promise<any[]> => {
  return await apiCall<any[]>(`/enterprise/${partnerId}/participants`);
};

export const createEnterpriseParticipant = async (partnerId: string, participantData: any): Promise<any> => {
  return await apiCall<any>(`/enterprise/${partnerId}/participants`, {
    method: 'POST',
    body: JSON.stringify(participantData)
  });
};

// === STATISTIQUES ===

export const getEnterpriseStats = async (partnerId: string): Promise<PartnershipStats> => {
  return await apiCall<PartnershipStats>(`/enterprise/${partnerId}/stats`);
};

// === FONCTIONS DE COMPATIBILITÉ (pour remplacer les mock data) ===

// Fonction principale pour récupérer un partenaire par ID (remplace getPartnerById)
export const getPartnerById = async (partnerId: string): Promise<Partner | undefined> => {
  try {
    return await getEnterpriseProfile(partnerId);
  } catch (error) {
    console.error('Erreur récupération partenaire:', error);
    return undefined;
  }
};

// Fonction pour récupérer les statistiques de projets (remplace getProjectsStats)
export const getProjectsStats = async (partnerId: string) => {
  try {
    const stats = await getEnterpriseStats(partnerId);
    
    // Adapter le format pour la compatibilité
    return {
      totalProjects: stats.totalProjects,
      activeProjects: stats.activeProjects,
      completedProjects: stats.completedProjects,
      upcomingDeadlines: stats.upcomingEvents,
      totalParticipants: stats.totalParticipants,
      averageProgress: stats.satisfactionRate
    };
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      upcomingDeadlines: 0,
      totalParticipants: 0,
      averageProgress: 0
    };
  }
};

// Fonction pour récupérer les projets de partenariat (remplace getPartnershipProjects)
export const getPartnershipProjects = async (partnerId?: string): Promise<PartnershipProject[]> => {
  if (!partnerId) return [];
  
  try {
    return await getEnterpriseProjects(partnerId);
  } catch (error) {
    console.error('Erreur récupération projets:', error);
    return [];
  }
};

// Fonction pour récupérer les formations co-animées (remplace getCoAnimatedFormations)
export const getCoAnimatedFormations = async (partnerId?: string): Promise<CoAnimatedFormation[]> => {
  if (!partnerId) return [];
  
  try {
    return await getEnterpriseFormations(partnerId);
  } catch (error) {
    console.error('Erreur récupération formations:', error);
    return [];
  }
};

// Fonction pour récupérer les événements (remplace getPartnershipEvents)
export const getPartnershipEvents = async (partnerId?: string): Promise<PartnershipEvent[]> => {
  if (!partnerId) return [];
  
  try {
    return await getEnterpriseEvents(partnerId);
  } catch (error) {
    console.error('Erreur récupération événements:', error);
    return [];
  }
};

// Fonction pour récupérer les statistiques globales (remplace getPartnershipStats)
export const getPartnershipStats = async (partnerId?: string): Promise<PartnershipStats> => {
  if (!partnerId) {
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalFormations: 0,
      upcomingEvents: 0,
      totalParticipants: 0,
      partnershipDuration: 0,
      satisfactionRate: 0
    };
  }
  
  try {
    return await getEnterpriseStats(partnerId);
  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalFormations: 0,
      upcomingEvents: 0,
      totalParticipants: 0,
      partnershipDuration: 0,
      satisfactionRate: 0
    };
  }
};
