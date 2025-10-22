// Service API مبسط للنظام التجاري الجديد
const API_BASE_URL = 'https://matc-backend.onrender.com/api/commercial-new';

export interface CommercialNewData {
  partnerId: string;
  fullName: string;
  email: string;
  niveau: 1 | 2 | 3;
  points: number;
  chiffreAffaires: number;
  commissionTotale: number;
  ventes: any[];
  clients: any[];
  isActive: boolean;
}

class CommercialNewApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async login(partnerId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${partnerId}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur login commercial:', error);
      return {
        success: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  async getCommercialData(partnerId: string): Promise<{ success: boolean; data?: any; message?: string }> {
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

  // Session management simple
  saveSession(commercialData: any): void {
    localStorage.setItem('commercialNewSession', JSON.stringify(commercialData));
  }

  getSession(): any {
    try {
      const sessionData = localStorage.getItem('commercialNewSession');
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      return null;
    }
  }

  isSessionValid(): boolean {
    return this.getSession() !== null;
  }

  clearSession(): void {
    localStorage.removeItem('commercialNewSession');
  }

  logout(): void {
    this.clearSession();
  }
}

export const commercialNewApiService = new CommercialNewApiService();
export default commercialNewApiService;
