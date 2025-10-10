import type { Partner, PartnerType } from './partnersService';

import { API_BASE_URL } from '../config/api';

export interface ApiPartner {
import { API_BASE_URL } from '../config/api';
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
  async getAllPartners(type?: PartnerType | 'all'): Promise<ApiPartner[]> {
    const params = new URLSearchParams();
    if (type && type !== 'all') {
      params.append('type', type);
    }
    
    const queryString = params.toString();
    const endpoint = `/partners${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<ApiPartner[]>(endpoint);
    return response.data || [];
  }

  // Récupérer un partenaire par ID
  async getPartnerById(partnerId: string): Promise<ApiPartner | null> {
    try {
      const response = await this.request<ApiPartner>(`/partners/${partnerId}`);
      return response.data || null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  // Créer un nouveau partenaire
  async createPartner(partnerData: {
    fullName: string;
    email: string;
    type: PartnerType;
    password?: string;
    formateurInfo?: ApiPartner['formateurInfo'];
  }): Promise<ApiPartner> {
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
  async updatePartner(partnerId: string, updateData: {
    fullName?: string;
    email?: string;
    isActive?: boolean;
    formateurInfo?: ApiPartner['formateurInfo'];
  }): Promise<ApiPartner> {
    const response = await this.request<ApiPartner>(`/partners/${partnerId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
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
    }>('/partners/stats/overview');

    return response.data || {
      total: 0,
      formateurs: 0,
      freelancers: 0,
      commerciaux: 0,
      entreprises: 0
    };
  }

  // Convertir ApiPartner vers Partner (pour compatibilité avec l'interface existante)
  apiPartnerToPartner(apiPartner: ApiPartner): Partner {
    return {
      id: apiPartner.partnerId,
      fullName: apiPartner.fullName,
      email: apiPartner.email,
      type: apiPartner.type
    };
  }

  // Convertir Partner vers données API (pour création/mise à jour)
  partnerToApiData(partner: Omit<Partner, 'id'>, formateurInfo?: ApiPartner['formateurInfo']) {
    return {
      fullName: partner.fullName,
      email: partner.email,
      type: partner.type,
      formateurInfo
    };
  }

  // Vérifier la connectivité avec l'API
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
}

// Instance singleton
export const partnersApiService = new PartnersApiService();

// Service hybride qui utilise l'API si disponible, sinon localStorage
export class HybridPartnersService {
  private useApi = false;
  private apiService = partnersApiService;

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    try {
      this.useApi = await this.apiService.checkApiHealth();
      console.log(`Partners service using: ${this.useApi ? 'API' : 'localStorage'}`);
      
      // Si on utilise localStorage, initialiser les données de démonstration
      if (!this.useApi) {
        await this.seedLocalStorageIfEmpty();
      }
    } catch (error) {
      console.error('Error initializing partners service:', error);
      this.useApi = false;
      await this.seedLocalStorageIfEmpty();
    }
  }

  private async seedLocalStorageIfEmpty() {
    try {
      const { listPartners, createPartner } = await import('./partnersService');
      const existing = listPartners();
      
      if (existing.length === 0) {
        // Créer des partenaires de démonstration
        const demoPartners = [
          { fullName: 'Ahmed Benali', email: 'ahmed.formateur@example.com', type: 'formateur' as PartnerType },
          { fullName: 'Fatima Zahra', email: 'fatima.freelancer@example.com', type: 'freelancer' as PartnerType },
          { fullName: 'Youssef Commercial', email: 'youssef.commercial@example.com', type: 'commercial' as PartnerType },
          { fullName: 'Société ABC', email: 'contact@abc.com', type: 'entreprise' as PartnerType },
        ];
        
        demoPartners.forEach(partner => {
          createPartner(partner);
        });
        
        console.log('Données de démonstration créées dans localStorage');
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des données de démonstration:', error);
    }
  }

  async getAllPartners(type?: PartnerType | 'all'): Promise<Partner[]> {
    if (this.useApi) {
      try {
        const apiPartners = await this.apiService.getAllPartners(type);
        return apiPartners.map(ap => this.apiService.apiPartnerToPartner(ap));
      } catch (error) {
        console.error('API call failed, falling back to localStorage:', error);
        this.useApi = false;
      }
    }

    // Fallback to localStorage
    const { listPartners } = await import('./partnersService');
    const allPartners = listPartners();
    
    if (type && type !== 'all') {
      return allPartners.filter(p => p.type === type);
    }
    
    return allPartners;
  }

  async createPartner(partnerData: Omit<Partner, 'id'>, formateurInfo?: ApiPartner['formateurInfo']): Promise<Partner> {
    if (this.useApi) {
      try {
        const apiPartner = await this.apiService.createPartner({
          ...this.apiService.partnerToApiData(partnerData, formateurInfo)
        });
        return this.apiService.apiPartnerToPartner(apiPartner);
      } catch (error) {
        console.error('API call failed, falling back to localStorage:', error);
        this.useApi = false;
      }
    }

    // Fallback to localStorage
    const { createPartner } = await import('./partnersService');
    return createPartner(partnerData);
  }

  async deletePartner(partnerId: string): Promise<boolean> {
    if (this.useApi) {
      try {
        await this.apiService.deletePartner(partnerId);
        return true;
      } catch (error) {
        console.error('API call failed, falling back to localStorage:', error);
        this.useApi = false;
      }
    }

    // Fallback to localStorage
    const { deletePartner } = await import('./partnersService');
    return deletePartner(partnerId);
  }
}

export const hybridPartnersService = new HybridPartnersService();
