// Service API pour le nouveau système commercial avec 3 niveaux
const API_BASE_URL = 'http://localhost:3001/api/commercial-new';

export interface CommercialNewData {
  partnerId: string;
  fullName: string;
  email: string;
  phone?: string;
  niveau: 1 | 2 | 3;
  points: number;
  pointsHistoriques: number;
  chiffreAffaires: number;
  commissionTotale: number;
  transfertEffectue: boolean;
  montantTransfert: number;
  dateTransfert?: string;
  clients: CommercialClient[];
  ventes: CommercialVente[];
  servicesAttribues: CommercialService[];
  cadeauxMensuels: CadeauMensuel[];
  historiqueNiveaux: HistoriqueNiveau[];
  dateInscription: string;
  dernierActivite: string;
  isActive: boolean;
}

export interface CommercialClient {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  tel: string;
  status: 'nouveau' | 'payé' | 'annulé' | 'en_attente';
  programme: string;
  montant: number;
  dateAjout: string;
}

export interface CommercialVente {
  id: string;
  client: string;
  clientEmail: string;
  programme: string;
  montant: number;
  commission: number;
  status: 'confirmé' | 'en_attente' | 'annulé';
  date: string;
  methodePaiement: string;
}

export interface CommercialService {
  _id: string;
  id: string; // Alias pour compatibilité
  titre: string;
  description?: string;
  categorie?: string;
  prixPublic: number;
  prixCommercial: number;
  commission: number;
  duree?: string;
  statistiques: {
    totalVentes: number;
    chiffreAffaireGenere: number;
    commissionTotalePayee: number;
  };
  isActive: boolean;
}

export interface CadeauMensuel {
  mois: string; // Format: 2025-09
  valeur: number;
  dateAjout: string;
}

export interface HistoriqueNiveau {
  ancienNiveau: number;
  nouveauNiveau: number;
  dateChangement: string;
  raison: string;
}

export interface CommercialStats {
  niveau: number;
  points: number;
  chiffreAffaires: number;
  commissionTotale: number;
  totalVentes: number;
  totalClients: number;
  cadeauxMensuels: number;
  transfertEffectue: boolean;
  montantTransfert: number;
}

export interface NiveauInfo {
  niveau: number;
  nom: string;
  description: string;
  couleur: string;
  prochainNiveau?: number;
  conditionSuivante?: string;
  avantages: string[];
}

// Informations des niveaux
export const NIVEAUX_INFO: Record<number, NiveauInfo> = {
  1: {
    niveau: 1,
    nom: 'Apprenti Vendeur',
    description: 'Niveau débutant avec accès aux programmes de base',
    couleur: 'orange',
    prochainNiveau: 2,
    conditionSuivante: '1000 points requis',
    avantages: [
      '+5 points par vente confirmée',
      'Accès aux programmes attribués',
      'Support client de base'
    ]
  },
  2: {
    niveau: 2,
    nom: 'Vendeur Confirmé',
    description: 'Niveau intermédiaire avec gestion clients',
    couleur: 'blue',
    prochainNiveau: 3,
    conditionSuivante: 'Transférer 500€ vers l\'entreprise',
    avantages: [
      'Gestion de portefeuille clients',
      'Suivi du chiffre d\'affaires',
      'Options de transfert des gains',
      'Tous les avantages du niveau 1'
    ]
  },
  3: {
    niveau: 3,
    nom: 'Partenaire Officiel',
    description: 'Niveau expert avec commission directe',
    couleur: 'purple',
    avantages: [
      '20% de commission directe sur chaque vente',
      '5€ de cadeau automatique chaque mois',
      'Accès prioritaire aux nouveaux programmes',
      'Support commercial dédié',
      'Tous les avantages des niveaux précédents'
    ]
  }
};

class CommercialNewApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Authentification commercial
  async login(partnerId: string, email: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`http://localhost:3001/api/partners/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId: partnerId,
          email: email,
          partnerType: 'commercial'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Sauvegarder session locale
        this.saveSession(result.data);
      }

      return result;
    } catch (error) {
      console.error('Erreur login commercial:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  // Récupérer données complètes du commercial
  async getCommercialData(partnerId: string): Promise<{ success: boolean; data?: CommercialNewData; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${partnerId}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur récupération données commercial:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  // Récupérer services attribués
  async getServices(partnerId: string): Promise<{ success: boolean; data?: CommercialService[]; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${partnerId}/services`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur récupération services:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  // Ajouter une vente
  async ajouterVente(partnerId: string, venteData: {
    serviceId: string;
    client: string;
    clientEmail: string;
    montant: number;
    commission: number;
    methodePaiement: string;
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${partnerId}/vente`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(venteData)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur ajout vente:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  // Alias pour compatibilité
  async addVente(partnerId: string, venteData: {
    serviceId: string;
    client: string;
    clientEmail: string;
    montant: number;
    commission: number;
    methodePaiement: string;
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    return this.ajouterVente(partnerId, venteData);
  }

  // Ajouter un client (niveau 2+)
  async ajouterClient(partnerId: string, clientData: {
    nom: string;
    prenom: string;
    email: string;
    tel: string;
    programme: string;
    montant: number;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${partnerId}/client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur ajout client:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  // Alias pour compatibilité
  async addClient(partnerId: string, clientData: {
    nom: string;
    prenom: string;
    email: string;
    tel: string;
    programme: string;
    montant: number;
  }): Promise<{ success: boolean; message?: string }> {
    return this.ajouterClient(partnerId, clientData);
  }

  // Effectuer transfert (niveau 2)
  async effectuerTransfert(partnerId: string, montant: number): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${partnerId}/transfert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ montant })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur transfert:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  // Récupérer statistiques
  async getStats(partnerId: string): Promise<{ success: boolean; data?: CommercialStats; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${partnerId}/stats`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur récupération stats:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  // Gestion session locale
  saveSession(commercialData: any): void {
    const sessionData = {
      commercial: commercialData,
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24h
    };
    localStorage.setItem('commercialNewSession', JSON.stringify(sessionData));
  }

  getSession(): any {
    try {
      const sessionData = localStorage.getItem('commercialNewSession');
      if (!sessionData) return null;

      const parsed = JSON.parse(sessionData);
      if (Date.now() > parsed.expiresAt) {
        this.clearSession();
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Erreur lecture session:', error);
      return null;
    }
  }

  isSessionValid(): boolean {
    const session = this.getSession();
    return session !== null;
  }

  clearSession(): void {
    localStorage.removeItem('commercialNewSession');
  }

  logout(): void {
    this.clearSession();
  }

  // Utilitaires
  getNiveauInfo(niveau: number): NiveauInfo {
    return NIVEAUX_INFO[niveau] || NIVEAUX_INFO[1];
  }

  calculerProgressionNiveau(points: number, niveau: number): { pourcentage: number; pointsManquants: number } {
    switch (niveau) {
      case 1:
        const pourcentage1 = Math.min((points / 1000) * 100, 100);
        return { pourcentage: pourcentage1, pointsManquants: Math.max(1000 - points, 0) };
      case 2:
        return { pourcentage: 100, pointsManquants: 0 }; // Dépend du transfert
      case 3:
        return { pourcentage: 100, pointsManquants: 0 }; // Niveau max
      default:
        return { pourcentage: 0, pointsManquants: 1000 };
    }
  }

  formaterMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(montant);
  }

  // Alias pour compatibilité
  formatCurrency(montant: number): string {
    return this.formaterMontant(montant);
  }
}

// Instance singleton
export const commercialNewApiService = new CommercialNewApiService();
export default commercialNewApiService;
