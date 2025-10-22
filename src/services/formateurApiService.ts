const API_BASE_URL = 'https://matc-backend.onrender.com/api';

export interface FormateurLoginResponse {
  success: boolean;
  data?: {
    _id: string;
    partnerId: string;
    fullName: string;
    email: string;
    type: string;
    isActive: boolean;
    formateurInfo?: {
      specialites?: string[];
      experience?: number;
      certifications?: string[];
      tarifHoraire?: number;
      disponibilite?: string;
    };
    lastLogin?: string;
  };
  message?: string;
}

export interface FormateurSession {
  _id: string;
  formateurId: string;
  titre: string;
  description: string;
  categorie: {
    _id: string;
    name: string;
  };
  niveau: string;
  duree: {
    heures?: number;
    semaines?: number;
    sessions?: number;
  };
  prix: number;
  participants: Array<{
    nom: string;
    email: string;
    telephone?: string;
    dateInscription: string;
    statut: string;
    noteFinale?: number;
    attestationGeneree: boolean;
  }>;
  revenus: {
    montantTotal: number;
    commission: number;
    montantFormateur: number;
    statutPaiement: string;
  };
  statut: string;
  dateDebut?: string;
  dateFin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormateurStats {
  totalSessions: number;
  sessionsTerminees: number;
  sessionsEnCours: number;
  totalParticipants: number;
  revenuTotal: number;
  revenuEnAttente: number;
  noteMoyenne: number;
}

class FormateurApiService {
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

  // Connexion du formateur
  async loginFormateur(formateurId: string, email: string): Promise<FormateurLoginResponse> {
    return this.request<FormateurLoginResponse>(`/partners/login`, {
      method: 'POST',
      body: JSON.stringify({ partnerId: formateurId, email, partnerType: 'formateur' }),
    });
  }

  // Récupérer les sessions du formateur
  async getFormateurSessions(formateurId: string, statut?: string): Promise<FormateurSession[]> {
    const params = new URLSearchParams();
    if (statut) {
      params.append('statut', statut);
    }
    
    const queryString = params.toString();
    const endpoint = `/formateur-sessions/${formateurId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<{ success: boolean; data: FormateurSession[] }>(endpoint);
    return response.data || [];
  }

  // Créer une nouvelle session
  async createSession(sessionData: {
    formateurId: string;
    titre: string;
    description: string;
    categorie: string;
    niveau: string;
    duree?: {
      heures?: number;
      semaines?: number;
      sessions?: number;
    };
    prix: number;
    dateDebut?: string;
    dateFin?: string;
  }): Promise<FormateurSession> {
    const response = await this.request<{ success: boolean; data: FormateurSession }>('/formateur-sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });

    if (!response.data) {
      throw new Error('Aucune donnée retournée lors de la création');
    }

    return response.data;
  }

  // Mettre à jour une session
  async updateSession(sessionId: string, updateData: Partial<FormateurSession>): Promise<FormateurSession> {
    const response = await this.request<{ success: boolean; data: FormateurSession }>(`/formateur-sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    if (!response.data) {
      throw new Error('Aucune donnée retournée lors de la mise à jour');
    }

    return response.data;
  }

  // Ajouter un participant à une session
  async addParticipant(sessionId: string, participantData: {
    nom: string;
    email: string;
    telephone?: string;
  }): Promise<FormateurSession> {
    const response = await this.request<{ success: boolean; data: FormateurSession }>(`/formateur-sessions/${sessionId}/participants`, {
      method: 'POST',
      body: JSON.stringify(participantData),
    });

    if (!response.data) {
      throw new Error('Aucune donnée retournée lors de l\'ajout du participant');
    }

    return response.data;
  }

  // Upload de documents pour une session
  async uploadDocuments(sessionId: string, files: {
    attestations?: File[];
    evaluations?: File[];
    recommandations?: File[];
    supports?: File[];
  }): Promise<{ sessionId: string; documents: any }> {
    const formData = new FormData();
    
    Object.entries(files).forEach(([fieldName, fileList]) => {
      if (fileList && fileList.length > 0) {
        fileList.forEach(file => {
          formData.append(fieldName, file);
        });
      }
    });

    const response = await fetch(`${API_BASE_URL}/formateur-sessions/${sessionId}/documents`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data.data;
  }

  // Récupérer les statistiques du formateur
  async getFormateurStats(formateurId: string): Promise<FormateurStats> {
    const response = await this.request<{ success: boolean; data: FormateurStats }>(`/formateur-sessions/${formateurId}/stats`);
    return response.data || {
      totalSessions: 0,
      sessionsTerminees: 0,
      sessionsEnCours: 0,
      totalParticipants: 0,
      revenuTotal: 0,
      revenuEnAttente: 0,
      noteMoyenne: 0
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
export const formateurApiService = new FormateurApiService();

// Service de gestion de session locale
export class FormateurSessionManager {
  private static readonly SESSION_KEY = 'formateur_session';
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 heures

  static saveSession(formateurData: FormateurLoginResponse['data']) {
    if (!formateurData) return;

    const sessionData = {
      formateur: formateurData,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.SESSION_DURATION
    };

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
  }

  static getSession(): FormateurLoginResponse['data'] | null {
    try {
      const sessionStr = localStorage.getItem(this.SESSION_KEY);
      if (!sessionStr) return null;

      const sessionData = JSON.parse(sessionStr);
      
      // Vérifier si la session a expiré
      if (Date.now() > sessionData.expiresAt) {
        this.clearSession();
        return null;
      }

      return sessionData.formateur;
    } catch (error) {
      console.error('Erreur lors de la récupération de la session:', error);
      this.clearSession();
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  static clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
  }

  static getFormateurId(): string | null {
    const session = this.getSession();
    return session?.partnerId || null;
  }
}

// Service hybride pour l'authentification des formateurs
export class FormateurAuthService {
  private apiService = formateurApiService;
  private sessionManager = FormateurSessionManager;

  async login(formateurId: string, email: string): Promise<FormateurLoginResponse['data']> {
    try {
      const response = await this.apiService.loginFormateur(formateurId, email);
      
      if (response.success && response.data) {
        // Sauvegarder la session localement
        this.sessionManager.saveSession(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Échec de la connexion');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  }

  logout() {
    this.sessionManager.clearSession();
  }

  isAuthenticated(): boolean {
    return this.sessionManager.isAuthenticated();
  }

  getCurrentFormateur(): FormateurLoginResponse['data'] | null {
    return this.sessionManager.getSession();
  }

  getFormateurId(): string | null {
    return this.sessionManager.getFormateurId();
  }
}

export const formateurAuthService = new FormateurAuthService();
