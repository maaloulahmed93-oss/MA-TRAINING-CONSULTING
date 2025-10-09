interface ContactData {
  _id?: string;
  email: string;
  phone: string;
  whatsapp: string;
  companyName: string;
  supportHours: string;
  responseTime: string;
  emailSubjectPrefix: string;
  emailTemplate: string;
  whatsappMessage: string;
  buttons: {
    email: {
      text: string;
      enabled: boolean;
      style: string;
    };
    phone: {
      text: string;
      enabled: boolean;
      style: string;
    };
    whatsapp: {
      text: string;
      enabled: boolean;
      style: string;
    };
  };
  isActive?: boolean;
  lastUpdated?: string;
  updatedBy?: string;
}

interface ContactResponse {
  success: boolean;
  data?: ContactData;
  message?: string;
  error?: string;
}

interface ContactStats {
  totalContacts: number;
  activeContacts: number;
  lastUpdate: {
    date: string;
    by: string;
  } | null;
  systemStatus: string;
}

interface StatsResponse {
  success: boolean;
  data?: ContactStats;
  message?: string;
  error?: string;
}

class DigitalizationContactApiService {
  private readonly API_BASE = 'http://localhost:3001/api/digitalization-contact';
  private readonly STORAGE_KEY = 'digitalization_contact_backup';

  // Test de connexion API
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/stats`);
      return response.ok;
    } catch (error) {
      console.warn('⚠️ API non disponible, utilisation du fallback localStorage');
      return false;
    }
  }

  // Récupérer les données de contact pour l'admin
  async getContactData(): Promise<ContactData | null> {
    try {
      console.log('🔄 Récupération des données de contact depuis l\'API...');
      
      const response = await fetch(`${this.API_BASE}/admin`);
      const result: ContactResponse = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ Données de contact récupérées depuis l\'API');
        // Sauvegarder en backup
        this.saveToLocalStorage(result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération');
      }
    } catch (error) {
      console.error('❌ Erreur API, utilisation du fallback localStorage:', error);
      return this.getFromLocalStorage();
    }
  }

  // Sauvegarder les données de contact
  async saveContactData(contactData: Partial<ContactData>): Promise<ContactData | null> {
    try {
      console.log('🔄 Sauvegarde des données de contact...');
      console.log('📝 Données à sauvegarder:', contactData);
      
      const response = await fetch(this.API_BASE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData)
      });
      
      const result: ContactResponse = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ Données de contact sauvegardées avec succès');
        // Sauvegarder en backup
        this.saveToLocalStorage(result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde API:', error);
      // Fallback vers localStorage
      const updatedData = { ...this.getFromLocalStorage(), ...contactData };
      this.saveToLocalStorage(updatedData);
      return updatedData;
    }
  }

  // Tester les liens générés
  async testLinks(contactData: { email: string; phone: string; whatsapp: string; customSubject?: string }): Promise<any> {
    try {
      console.log('🔄 Test des liens de contact...');
      
      const response = await fetch(`${this.API_BASE}/test-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Liens testés avec succès');
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors du test des liens');
      }
    } catch (error) {
      console.error('❌ Erreur lors du test des liens:', error);
      // Générer des liens de test localement
      return {
        links: {
          email: `mailto:${contactData.email}`,
          phone: `tel:${contactData.phone}`,
          whatsapp: `https://wa.me/${contactData.whatsapp.replace(/\s+/g, '').replace(/^\+/, '')}`
        },
        preview: {
          email: `mailto:${contactData.email}`,
          phone: `tel:${contactData.phone}`,
          whatsapp: `WhatsApp: ${contactData.whatsapp}`
        }
      };
    }
  }

  // Réinitialiser aux valeurs par défaut
  async resetToDefault(): Promise<ContactData | null> {
    try {
      console.log('🔄 Réinitialisation aux valeurs par défaut...');
      
      const response = await fetch(`${this.API_BASE}/reset`, {
        method: 'DELETE'
      });
      
      const result: ContactResponse = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ Réinitialisation réussie');
        this.saveToLocalStorage(result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors de la réinitialisation');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la réinitialisation API:', error);
      // Créer des données par défaut localement
      const defaultData = this.getDefaultContactData();
      this.saveToLocalStorage(defaultData);
      return defaultData;
    }
  }

  // Récupérer les statistiques
  async getStats(): Promise<ContactStats | null> {
    try {
      console.log('🔄 Récupération des statistiques...');
      
      const response = await fetch(`${this.API_BASE}/stats`);
      const result: StatsResponse = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ Statistiques récupérées avec succès');
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération des statistiques');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      return {
        totalContacts: 1,
        activeContacts: 1,
        lastUpdate: {
          date: new Date().toISOString(),
          by: 'localStorage'
        },
        systemStatus: 'fallback'
      };
    }
  }

  // Méthodes localStorage (fallback)
  private saveToLocalStorage(data: ContactData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      console.log('💾 Données sauvegardées en localStorage comme backup');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde localStorage:', error);
    }
  }

  private getFromLocalStorage(): ContactData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        console.log('📦 Données récupérées depuis localStorage');
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la lecture localStorage:', error);
    }
    
    console.log('🔧 Utilisation des données par défaut');
    return this.getDefaultContactData();
  }

  private getDefaultContactData(): ContactData {
    return {
      email: 'contact@matc-consulting.com',
      phone: '+216 52 345 678',
      whatsapp: '+216 52 345 678',
      companyName: 'MA Training & Consulting',
      supportHours: '24/7',
      responseTime: 'Sous 2h',
      emailSubjectPrefix: 'Demande de consultation - Digitalisation MATC',
      emailTemplate: `Bonjour,

Je souhaite obtenir plus d'informations concernant vos services de digitalisation.

Mes coordonnées :
- Nom : [Votre nom]
- Entreprise : [Nom de votre entreprise]
- Téléphone : [Votre numéro]
- Secteur d'activité : [Votre secteur]

Besoins spécifiques :
[Décrivez brièvement vos besoins]

Cordialement,
[Votre nom]`,
      whatsappMessage: 'Bonjour, je souhaite obtenir des informations sur vos services de digitalisation MATC.',
      buttons: {
        email: {
          text: '📩 Email',
          enabled: true,
          style: 'primary'
        },
        phone: {
          text: '📞 Téléphone',
          enabled: true,
          style: 'secondary'
        },
        whatsapp: {
          text: 'WhatsApp',
          enabled: true,
          style: 'whatsapp'
        }
      },
      isActive: true,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'localStorage'
    };
  }
}

export const digitalizationContactApiService = new DigitalizationContactApiService();
export type { ContactData, ContactStats };
