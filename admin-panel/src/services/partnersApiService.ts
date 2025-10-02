import type { Partner, PartnerType } from './partnersService';

const API_BASE_URL = 'http://localhost:3001/api';

export interface ApiPartner {
  _id: string;
  partnerId: string;
  fullName: string;
  email: string;
  type: PartnerType;
  isActive: boolean;
  formateurInfo?: {
    specialites?: string[];
    experience?: number;
    certifications?: string[];
    tarifHoraire?: number;
    disponibilite?: 'disponible' | 'occupe' | 'indisponible';
  };
  createdAt: string;
  lastLogin?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

// Interface pour les données Enterprise
export interface EnterpriseProject {
  projectId: string;
  partnerId: string;
  title: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  startDate: string;
  endDate: string;
  budget?: number;
  participants?: string[];
  objectives?: string[];
  deliverables?: string[];
}

export interface EnterpriseFormation {
  formationId: string;
  partnerId: string;
  title: string;
  description: string;
  trainers?: string[];
  partnerTrainers?: string[];
  date: string;
  duration: number;
  location: 'online' | 'onsite' | 'hybrid';
  participants: number;
  maxParticipants?: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  materials?: string[];
}

export interface EnterpriseEvent {
  eventId: string;
  partnerId: string;
  title: string;
  description: string;
  type: 'seminar' | 'workshop' | 'conference' | 'networking';
  date: string;
  time: string;
  duration: number;
  location: string;
  maxParticipants?: number;
  currentParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizers?: string[];
  agenda?: string[];
}

export interface EnterpriseStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalFormations: number;
  upcomingEvents: number;
  totalParticipants: number;
  partnershipDuration: number;
  satisfactionRate: number;
}

class PartnersApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Récupérer tous les partenaires
  async getAllPartners(type?: PartnerType): Promise<ApiPartner[]> {
    const queryParams = type ? `?type=${type}` : '';
    const response = await this.request<ApiPartner[]>(`/partners${queryParams}`);
    return response.data || [];
  }

  // Récupérer un partenaire par ID
  async getPartnerById(partnerId: string): Promise<ApiPartner> {
    const response = await this.request<ApiPartner>(`/partners/${partnerId}`);
    
    if (!response.data) {
      throw new Error('Partenaire non trouvé');
    }

    return response.data;
  }

  // Créer un nouveau partenaire
  async createPartner(partnerData: Omit<ApiPartner, '_id' | 'partnerId' | 'createdAt'>): Promise<ApiPartner> {
    const response = await this.request<ApiPartner>('/partners', {
      method: 'POST',
      body: JSON.stringify(partnerData),
    });

    if (!response.data) {
      throw new Error('Aucune donnée retournée lors de la création');
    }

    return response.data;
  }

  // Mettre à jour un partenaire
  async updatePartner(partnerId: string, partnerData: Partial<ApiPartner>): Promise<ApiPartner> {
    const response = await this.request<ApiPartner>(`/partners/${partnerId}`, {
      method: 'PUT',
      body: JSON.stringify(partnerData),
    });

    if (!response.data) {
      throw new Error('Aucune donnée retournée lors de la mise à jour');
    }

    return response.data;
  }

  // Supprimer un partenaire
  async deletePartner(partnerId: string): Promise<void> {
    await this.request(`/partners/${partnerId}`, {
      method: 'DELETE',
    });
  }

  // ========== ENTERPRISE METHODS - ISOLATION DES DONNÉES ==========
  
  /**
   * Récupérer le profil d'une entreprise
   */
  async getEnterpriseProfile(partnerId: string): Promise<ApiResponse<ApiPartner>> {
    return this.request<ApiPartner>(`/enterprise/${partnerId}/profile`);
  }

  /**
   * Mettre à jour le profil d'une entreprise
   */
  async updateEnterpriseProfile(partnerId: string, profileData: Partial<ApiPartner>): Promise<ApiResponse<ApiPartner>> {
    return this.request<ApiPartner>(`/enterprise/${partnerId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  /**
   * Récupérer les projets d'une entreprise (ISOLÉS)
   */
  async getEnterpriseProjects(partnerId: string): Promise<ApiResponse<EnterpriseProject[]>> {
    return this.request<EnterpriseProject[]>(`/enterprise/${partnerId}/projects`);
  }

  /**
   * Créer un projet pour une entreprise
   */
  async createEnterpriseProject(partnerId: string, projectData: Omit<EnterpriseProject, 'projectId' | 'partnerId'>): Promise<ApiResponse<EnterpriseProject>> {
    return this.request<EnterpriseProject>(`/enterprise/${partnerId}/projects`, {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  /**
   * Mettre à jour un projet d'entreprise
   */
  async updateEnterpriseProject(partnerId: string, projectId: string, projectData: Partial<EnterpriseProject>): Promise<ApiResponse<EnterpriseProject>> {
    return this.request<EnterpriseProject>(`/enterprise/${partnerId}/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  /**
   * Récupérer les formations d'une entreprise (ISOLÉES)
   */
  async getEnterpriseFormations(partnerId: string): Promise<ApiResponse<EnterpriseFormation[]>> {
    return this.request<EnterpriseFormation[]>(`/enterprise/${partnerId}/formations`);
  }

  /**
   * Créer une formation pour une entreprise
   */
  async createEnterpriseFormation(partnerId: string, formationData: Omit<EnterpriseFormation, 'formationId' | 'partnerId'>): Promise<ApiResponse<EnterpriseFormation>> {
    return this.request<EnterpriseFormation>(`/enterprise/${partnerId}/formations`, {
      method: 'POST',
      body: JSON.stringify(formationData),
    });
  }

  /**
   * Récupérer les événements d'une entreprise (ISOLÉS)
   */
  async getEnterpriseEvents(partnerId: string): Promise<ApiResponse<EnterpriseEvent[]>> {
    return this.request<EnterpriseEvent[]>(`/enterprise/${partnerId}/events`);
  }

  /**
   * Créer un événement pour une entreprise
   */
  async createEnterpriseEvent(partnerId: string, eventData: Omit<EnterpriseEvent, 'eventId' | 'partnerId'>): Promise<ApiResponse<EnterpriseEvent>> {
    return this.request<EnterpriseEvent>(`/enterprise/${partnerId}/events`, {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  /**
   * Récupérer les statistiques d'une entreprise
   */
  async getEnterpriseStats(partnerId: string): Promise<ApiResponse<EnterpriseStats>> {
    return this.request<EnterpriseStats>(`/enterprise/${partnerId}/stats`);
  }

  /**
   * Méthode helper pour vérifier si un partenaire est une entreprise
   */
  isEnterprisePartner(partner: ApiPartner): boolean {
    return partner.type === 'entreprise';
  }

  /**
   * Méthode helper pour récupérer toutes les données d'une entreprise
   */
  async getEnterpriseAllData(partnerId: string) {
    try {
      const [profile, projects, formations, events, stats] = await Promise.all([
        this.getEnterpriseProfile(partnerId),
        this.getEnterpriseProjects(partnerId),
        this.getEnterpriseFormations(partnerId),
        this.getEnterpriseEvents(partnerId),
        this.getEnterpriseStats(partnerId)
      ]);

      return {
        profile: profile.data,
        projects: projects.data || [],
        formations: formations.data || [],
        events: events.data || [],
        stats: stats.data
      };
    } catch (error) {
      console.error('Erreur récupération données entreprise:', error);
      throw error;
    }
  }

  // Connexion d'un partenaire
  async loginPartner(partnerId: string, password?: string): Promise<ApiPartner> {
    const response = await this.request<ApiPartner>(`/partners/${partnerId}/login`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });

    if (!response.data) {
      throw new Error('Aucune donnée retournée lors de la connexion');
    }

    return response.data;
  }

  // Statistiques des partenaires
  async getPartnersStats(): Promise<{
    total: number;
    formateurs: number;
    freelancers: number;
    commerciaux: number;
    entreprises: number;
  }> {
    const response = await this.request<{
      total: number;
      formateurs: number;
      freelancers: number;
      commerciaux: number;
      entreprises: number;
    }>('/partners/stats');

    if (!response.data) {
      throw new Error('Aucune donnée de statistiques disponible');
    }

    return response.data;
  }
}

// Instance singleton
const partnersApiService = new PartnersApiService();

export default partnersApiService;
