const API_BASE_URL = 'https://matc-backend.onrender.com/api';

export interface FormateurProgramme {
  _id: string;
  formateurId: string;
  titre: string;
  description?: string;
  dateDebut: string;
  dateFin: string;
  duree: {
    jours: number;
    heures: number;
  };
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  prix: number;
  maxParticipants: number;
  lieu: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  statistiques?: {
    totalSeances: number;
    totalParticipants: number;
  };
}

export interface FormateurSeance {
  _id: string;
  programmeId: string;
  formateurId: string;
  numero: string;
  module: string;
  titre?: string;
  description?: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  dureeMinutes: number;
  lieu: string;
  lienVisio?: string;
  statut: 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
  notes?: string;
  programmeId_populated?: {
    titre: string;
  };
}

export interface FormateurParticipant {
  _id: string;
  programmeId: string;
  formateurId: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  dateInscription: string;
  statut: 'inscrit' | 'confirme' | 'en_cours' | 'termine' | 'abandonne';
  progression: {
    seancesAssistees: number;
    totalSeances: number;
    pourcentage: number;
  };
  noteFinale?: number;
  programmeId_populated?: {
    titre: string;
  };
}

export interface FormateurEvenement {
  _id: string;
  formateurId: string;
  programmeId?: string;
  sujet: string;
  description?: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  dureeMinutes: number;
  type: 'reunion' | 'formation' | 'conference' | 'webinaire' | 'entretien' | 'autre';
  lieu: string;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule' | 'reporte';
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  couleur: string;
  notes?: string;
}

class FormateurProgrammeService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

  // ============ PROGRAMMES ============
  async getProgrammes(formateurId: string, filters?: {
    statut?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: FormateurProgramme[]; pagination: any }> {
    const params = new URLSearchParams();
    if (filters?.statut) params.append('statut', filters.statut);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const endpoint = `/formateur-programmes/${formateurId}${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ data: FormateurProgramme[]; pagination: any }>(endpoint);
  }

  async createProgramme(programmeData: {
    formateurId: string;
    titre: string;
    description?: string;
    dateDebut: string;
    dateFin: string;
    prix?: number;
    maxParticipants?: number;
    lieu?: string;
    notes?: string;
  }): Promise<FormateurProgramme> {
    const response = await this.request<{ success: boolean; data: FormateurProgramme }>('/formateur-programmes', {
      method: 'POST',
      body: JSON.stringify(programmeData),
    });

    return response.data;
  }

  async updateProgramme(programmeId: string, updateData: Partial<FormateurProgramme>): Promise<FormateurProgramme> {
    const response = await this.request<{ success: boolean; data: FormateurProgramme }>(`/formateur-programmes/${programmeId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    return response.data;
  }

  async deleteProgramme(programmeId: string): Promise<void> {
    await this.request(`/formateur-programmes/${programmeId}`, {
      method: 'DELETE',
    });
  }

  async getProgrammeDetails(programmeId: string): Promise<{
    programme: FormateurProgramme;
    seances: FormateurSeance[];
    participants: FormateurParticipant[];
    statistiques: any;
  }> {
    const response = await this.request<{ 
      success: boolean; 
      data: {
        programme: FormateurProgramme;
        seances: FormateurSeance[];
        participants: FormateurParticipant[];
        statistiques: any;
      }
    }>(`/formateur-programmes/${programmeId}/details`);

    return response.data;
  }

  // ============ SEANCES ============
  async getSeances(formateurId: string, filters?: {
    programmeId?: string;
    statut?: string;
    date?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: FormateurSeance[]; pagination: any }> {
    const params = new URLSearchParams();
    if (filters?.programmeId) params.append('programmeId', filters.programmeId);
    if (filters?.statut) params.append('statut', filters.statut);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const endpoint = `/formateur-seances/${formateurId}${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ data: FormateurSeance[]; pagination: any }>(endpoint);
  }

  async createSeance(seanceData: {
    programmeId: string;
    formateurId: string;
    numero: string;
    module: string;
    titre?: string;
    description?: string;
    date: string;
    heureDebut: string;
    heureFin: string;
    lieu?: string;
    lienVisio?: string;
    notes?: string;
  }): Promise<FormateurSeance> {
    const response = await this.request<{ success: boolean; data: FormateurSeance }>('/formateur-seances', {
      method: 'POST',
      body: JSON.stringify(seanceData),
    });

    return response.data;
  }

  async updateSeance(seanceId: string, updateData: Partial<FormateurSeance>): Promise<FormateurSeance> {
    const response = await this.request<{ success: boolean; data: FormateurSeance }>(`/formateur-seances/${seanceId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    return response.data;
  }

  async deleteSeance(seanceId: string): Promise<void> {
    await this.request(`/formateur-seances/${seanceId}`, {
      method: 'DELETE',
    });
  }

  // ============ PARTICIPANTS ============
  async getParticipants(formateurId: string, filters?: {
    programmeId?: string;
    statut?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: FormateurParticipant[]; pagination: any }> {
    const params = new URLSearchParams();
    if (filters?.programmeId) params.append('programmeId', filters.programmeId);
    if (filters?.statut) params.append('statut', filters.statut);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const endpoint = `/formateur-participants/${formateurId}${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ data: FormateurParticipant[]; pagination: any }>(endpoint);
  }

  async addParticipant(participantData: {
    programmeId: string;
    formateurId: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    informationsSupplementaires?: any;
  }): Promise<FormateurParticipant> {
    const response = await this.request<{ success: boolean; data: FormateurParticipant }>('/formateur-participants', {
      method: 'POST',
      body: JSON.stringify(participantData),
    });

    return response.data;
  }

  async updateParticipant(participantId: string, updateData: Partial<FormateurParticipant>): Promise<FormateurParticipant> {
    const response = await this.request<{ success: boolean; data: FormateurParticipant }>(`/formateur-participants/${participantId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    return response.data;
  }

  async deleteParticipant(participantId: string): Promise<void> {
    await this.request(`/formateur-participants/${participantId}`, {
      method: 'DELETE',
    });
  }

  // ============ EVENEMENTS ============
  async getEvenements(formateurId: string, filters?: {
    type?: string;
    statut?: string;
    dateDebut?: string;
    dateFin?: string;
    programmeId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: FormateurEvenement[]; pagination: any }> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.statut) params.append('statut', filters.statut);
    if (filters?.dateDebut) params.append('dateDebut', filters.dateDebut);
    if (filters?.dateFin) params.append('dateFin', filters.dateFin);
    if (filters?.programmeId) params.append('programmeId', filters.programmeId);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const endpoint = `/formateur-evenements/${formateurId}${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{ data: FormateurEvenement[]; pagination: any }>(endpoint);
  }

  async createEvenement(eventData: {
    formateurId: string;
    programmeId?: string;
    sujet: string;
    description?: string;
    date: string;
    heureDebut: string;
    heureFin: string;
    type?: string;
    lieu?: string;
    priorite?: string;
    couleur?: string;
    notes?: string;
  }): Promise<FormateurEvenement> {
    const response = await this.request<{ success: boolean; data: FormateurEvenement }>('/formateur-evenements', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });

    return response.data;
  }

  async updateEvenement(eventId: string, updateData: Partial<FormateurEvenement>): Promise<FormateurEvenement> {
    const response = await this.request<{ success: boolean; data: FormateurEvenement }>(`/formateur-evenements/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    return response.data;
  }

  async deleteEvenement(eventId: string): Promise<void> {
    await this.request(`/formateur-evenements/${eventId}`, {
      method: 'DELETE',
    });
  }

  async getCalendrier(formateurId: string, mois?: number, annee?: number): Promise<{
    periode: { debut: string; fin: string };
    evenements: Record<string, FormateurEvenement[]>;
    total: number;
  }> {
    const params = new URLSearchParams();
    if (mois) params.append('mois', mois.toString());
    if (annee) params.append('annee', annee.toString());
    
    const queryString = params.toString();
    const endpoint = `/formateur-evenements/${formateurId}/calendrier${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<{ 
      success: boolean; 
      data: {
        periode: { debut: string; fin: string };
        evenements: Record<string, FormateurEvenement[]>;
        total: number;
      }
    }>(endpoint);

    return response.data;
  }

  // ============ UTILITAIRES ============
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
export const formateurProgrammeService = new FormateurProgrammeService();
