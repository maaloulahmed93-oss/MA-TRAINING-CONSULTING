import { API_BASE_URL } from '../config/api';

export interface CommercialDeal {
  _id?: string;
  commercialId: string;
  dealTitle: string;
  clientName: string;
  clientType: 'particulier' | 'entreprise' | 'association';
  clientEmail: string;
  clientPhone?: string;
  clientAddress?: string;
  serviceType: string;
  serviceDescription?: string;
  montantTotal: number;
  devise: string;
  tauxCommission: number;
  montantCommission?: number;
  statutDeal: 'prospection' | 'negociation' | 'signe' | 'en_cours' | 'termine' | 'annule';
  dateProspection: Date;
  dateSignature?: Date;
  dateDebutService?: Date;
  dateFinService?: Date;
  documents: {
    contrats: string[];
    factures: string[];
    devis: string[];
    autres: string[];
  };
  notes: Array<{
    contenu: string;
    auteur: string;
    dateAjout: Date;
  }>;
  tags: string[];
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  historique: Array<{
    action: string;
    details: string;
    auteur: string;
    date: Date;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
  isActive: boolean;
}

export interface CommercialStats {
  totalDeals: number;
  dealsActives: number;
  chiffreAffaireTotal: number;
  commissionTotale: number;
  tauxConversion: number;
  repartitionStatuts: Record<string, number>;
  periode?: {
    type: string;
    totalDeals: number;
    chiffreAffaire: number;
    commission: number;
  };
}

export interface ClientInfo {
  _id: string;
  clientName: string;
  clientType: string;
  clientPhone?: string;
  totalDeals: number;
  chiffreAffaireTotal: number;
  derniereDeal: Date;
}

class CommercialApiService {
  private baseUrl = `${API_BASE_URL}/commercial-deals`;

  // Vérifier la santé de l'API
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }

  // Authentification du commercial
  async login(commercialId: string, email: string): Promise<{ success: boolean; commercial?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/partners/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          partnerId: commercialId,
          email: email,
          partnerType: 'commercial'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Stocker les informations de session
        const sessionData = {
          commercialId,
          commercial: data.partner,
          loginTime: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
        };
        localStorage.setItem('commercial_session', JSON.stringify(sessionData));
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  // Vérifier la session active
  isSessionValid(): boolean {
    try {
      const sessionData = localStorage.getItem('commercial_session');
      if (!sessionData) return false;

      const session = JSON.parse(sessionData);
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);

      return now < expiresAt;
    } catch (error) {
      return false;
    }
  }

  // Récupérer les informations de session
  getSessionData(): any {
    try {
      const sessionData = localStorage.getItem('commercial_session');
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      return null;
    }
  }

  // Déconnexion
  logout(): void {
    localStorage.removeItem('commercial_session');
  }

  // Récupérer les deals d'un commercial
  async getDeals(commercialId: string, filters?: {
    statut?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ success: boolean; data?: CommercialDeal[]; pagination?: any; message?: string }> {
    try {
      const params = new URLSearchParams();
      if (filters?.statut) params.append('statut', filters.statut);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`${this.baseUrl}/${commercialId}?${params.toString()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des deals:', error);
      return { success: false, message: 'Erreur lors de la récupération des deals' };
    }
  }

  // Créer une nouvelle deal
  async createDeal(dealData: Partial<CommercialDeal>): Promise<{ success: boolean; data?: CommercialDeal; message?: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la deal:', error);
      return { success: false, message: 'Erreur lors de la création de la deal' };
    }
  }

  // Mettre à jour une deal
  async updateDeal(dealId: string, dealData: Partial<CommercialDeal>): Promise<{ success: boolean; data?: CommercialDeal; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${dealId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la deal:', error);
      return { success: false, message: 'Erreur lors de la mise à jour de la deal' };
    }
  }

  // Ajouter une note à une deal
  async addNote(dealId: string, contenu: string, auteur: string): Promise<{ success: boolean; data?: CommercialDeal; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${dealId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contenu, auteur }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la note:', error);
      return { success: false, message: 'Erreur lors de l\'ajout de la note' };
    }
  }

  // Upload de documents
  async uploadDocuments(dealId: string, files: { [key: string]: FileList }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const formData = new FormData();
      
      Object.keys(files).forEach(fieldName => {
        const fileList = files[fieldName];
        for (let i = 0; i < fileList.length; i++) {
          formData.append(fieldName, fileList[i]);
        }
      });

      const response = await fetch(`${this.baseUrl}/${dealId}/documents`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'upload des documents:', error);
      return { success: false, message: 'Erreur lors de l\'upload des documents' };
    }
  }

  // Récupérer les statistiques d'un commercial
  async getStats(commercialId: string, periode?: string): Promise<{ success: boolean; data?: CommercialStats; message?: string }> {
    try {
      const params = periode ? `?periode=${periode}` : '';
      const response = await fetch(`${this.baseUrl}/${commercialId}/stats${params}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return { success: false, message: 'Erreur lors de la récupération des statistiques' };
    }
  }

  // Récupérer la liste des clients d'un commercial
  async getClients(commercialId: string): Promise<{ success: boolean; data?: ClientInfo[]; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${commercialId}/clients`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      return { success: false, message: 'Erreur lors de la récupération des clients' };
    }
  }

  // Supprimer une deal
  async deleteDeal(dealId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${dealId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la deal:', error);
      return { success: false, message: 'Erreur lors de la suppression de la deal' };
    }
  }
}

// Service hybride avec fallback localStorage
class HybridCommercialService {
  private apiService = new CommercialApiService();
  private useApi = false;
  private localStorageKey = 'commercial_deals_data';

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    try {
      this.useApi = await this.apiService.checkApiHealth();
      console.log(`Commercial service using: ${this.useApi ? 'API' : 'localStorage'}`);
      
      if (!this.useApi) {
        await this.seedLocalStorageIfEmpty();
      }
    } catch (error) {
      console.error('Error initializing commercial service:', error);
      this.useApi = false;
      await this.seedLocalStorageIfEmpty();
    }
  }

  private async seedLocalStorageIfEmpty() {
    const existingData = localStorage.getItem(this.localStorageKey);
    if (!existingData) {
      const demoData = {
        deals: [
          {
            _id: 'deal-001',
            commercialId: 'COM-123456',
            dealTitle: 'Formation React Entreprise TechCorp',
            clientName: 'TechCorp Solutions',
            clientType: 'entreprise',
            clientEmail: 'contact@techcorp.com',
            clientPhone: '+33123456789',
            serviceType: 'Formation en entreprise',
            serviceDescription: 'Formation React avancée pour 15 développeurs',
            montantTotal: 12000,
            devise: 'EUR',
            tauxCommission: 15,
            montantCommission: 1800,
            statutDeal: 'signe',
            dateProspection: new Date('2024-01-15'),
            dateSignature: new Date('2024-01-25'),
            dateDebutService: new Date('2024-02-01'),
            documents: { contrats: [], factures: [], devis: [], autres: [] },
            notes: [],
            tags: ['formation', 'react', 'entreprise'],
            priorite: 'haute',
            historique: [],
            isActive: true
          }
        ]
      };
      localStorage.setItem(this.localStorageKey, JSON.stringify(demoData));
    }
  }

  // Méthodes publiques qui utilisent soit l'API soit localStorage
  async login(commercialId: string, email: string) {
    if (this.useApi) {
      return await this.apiService.login(commercialId, email);
    } else {
      // Simulation de login local
      const sessionData = {
        commercialId,
        commercial: { partnerId: commercialId, fullName: 'Commercial Demo', type: 'commercial', email: email },
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      localStorage.setItem('commercial_session', JSON.stringify(sessionData));
      return { success: true, commercial: sessionData.commercial };
    }
  }

  isSessionValid(): boolean {
    return this.apiService.isSessionValid();
  }

  getSessionData(): any {
    return this.apiService.getSessionData();
  }

  logout(): void {
    this.apiService.logout();
  }

  async getDeals(commercialId: string, filters?: any) {
    if (this.useApi) {
      return await this.apiService.getDeals(commercialId, filters);
    } else {
      // Récupération locale
      const data = JSON.parse(localStorage.getItem(this.localStorageKey) || '{"deals":[]}');
      const deals = data.deals.filter((deal: CommercialDeal) => 
        deal.commercialId === commercialId && deal.isActive
      );
      return { success: true, data: deals };
    }
  }

  async createDeal(dealData: Partial<CommercialDeal>) {
    if (this.useApi) {
      return await this.apiService.createDeal(dealData);
    } else {
      // Création locale
      const data = JSON.parse(localStorage.getItem(this.localStorageKey) || '{"deals":[]}');
      const newDeal = {
        ...dealData,
        _id: `deal-${Date.now()}`,
        dateProspection: new Date(),
        documents: { contrats: [], factures: [], devis: [], autres: [] },
        notes: [],
        historique: [],
        isActive: true
      };
      data.deals.push(newDeal);
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));
      return { success: true, data: newDeal };
    }
  }

  async getStats(commercialId: string, periode?: string) {
    if (this.useApi) {
      return await this.apiService.getStats(commercialId, periode);
    } else {
      // Calcul local des statistiques
      const data = JSON.parse(localStorage.getItem(this.localStorageKey) || '{"deals":[]}');
      const deals = data.deals.filter((deal: CommercialDeal) => 
        deal.commercialId === commercialId && deal.isActive
      );
      
      const stats = {
        totalDeals: deals.length,
        dealsActives: deals.filter((d: CommercialDeal) => d.statutDeal !== 'annule').length,
        chiffreAffaireTotal: deals.reduce((sum: number, d: CommercialDeal) => sum + d.montantTotal, 0),
        commissionTotale: deals.reduce((sum: number, d: CommercialDeal) => sum + (d.montantCommission || 0), 0),
        tauxConversion: 0,
        repartitionStatuts: {}
      };
      
      return { success: true, data: stats };
    }
  }
}

export const hybridCommercialService = new HybridCommercialService();
export default CommercialApiService;
