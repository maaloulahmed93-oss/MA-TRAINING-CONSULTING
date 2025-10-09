interface ContactLinks {
  email: string;
  phone: string;
  whatsapp: string;
}

interface ContactButtons {
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
}

interface ContactData {
  email: string;
  phone: string;
  whatsapp: string;
  companyName: string;
  supportHours: string;
  responseTime: string;
  buttons: ContactButtons;
  links: ContactLinks;
}

interface ContactResponse {
  success: boolean;
  data?: ContactData;
  message?: string;
  error?: string;
}

class DigitalizationContactApiService {
  private readonly API_BASE = 'http://localhost:3001/api/digitalization-contact';
  private readonly CACHE_KEY = 'digitalization_contact_cache';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private cache: { data: ContactData; timestamp: number } | null = null;

  // Test de connexion API
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.API_BASE);
      return response.ok;
    } catch (error) {
      console.warn('⚠️ API Contact non disponible');
      return false;
    }
  }

  // Récupérer les données de contact avec cache
  async getContactDataWithCache(): Promise<ContactData> {
    try {
      // Vérifier le cache en mémoire
      if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_DURATION) {
        console.log('📦 Contact data depuis cache mémoire');
        return this.cache.data;
      }

      // Vérifier le cache localStorage
      const cachedData = this.getCachedData();
      if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_DURATION) {
        console.log('📦 Contact data depuis cache localStorage');
        this.cache = cachedData;
        return cachedData.data;
      }

      console.log('🔄 Récupération des données de contact depuis l\'API...');
      
      const response = await fetch(this.API_BASE);
      const result: ContactResponse = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ Données de contact récupérées depuis l\'API');
        
        // Mettre en cache
        const cacheEntry = {
          data: result.data,
          timestamp: Date.now()
        };
        
        this.cache = cacheEntry;
        this.setCachedData(cacheEntry);
        
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération');
      }
    } catch (error) {
      console.error('❌ Erreur API Contact, utilisation des données par défaut:', error);
      return this.getDefaultContactData();
    }
  }

  // Générer le lien mailto avec template personnalisé
  generateMailto(subject?: string): string {
    const defaultEmail = 'contact@matc-consulting.com';
    const emailSubject = subject || 'Demande de consultation - Digitalisation MATC';
    return this.generateMailtoLink(defaultEmail, emailSubject);
  }

  // Générer le lien téléphone
  generatePhoneLink(phone?: string): string {
    const defaultPhone = '+216 52 345 678';
    const phoneNumber = phone || defaultPhone;
    return this.generatePhoneLinkDirect(phoneNumber);
  }

  // Générer le lien WhatsApp
  generateWhatsAppLink(phone?: string, message?: string): string {
    const defaultWhatsApp = '+216 52 345 678';
    const whatsappNumber = phone || defaultWhatsApp;
    const whatsappMessage = message || 'Bonjour, je souhaite obtenir des informations sur vos services de digitalisation MATC.';
    
    const cleanPhone = whatsappNumber.replace(/\s+/g, '').replace(/^\+/, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
  }

  // Méthodes de cache
  private setCachedData(cacheEntry: { data: ContactData; timestamp: number }): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('⚠️ Erreur lors de la mise en cache:', error);
    }
  }

  private getCachedData(): { data: ContactData; timestamp: number } | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de la lecture du cache:', error);
    }
    return null;
  }

  // Données par défaut
  private getDefaultContactData(): ContactData {
    const defaultEmail = 'contact@matc-consulting.com';
    const defaultPhone = '+216 52 345 678';
    const defaultWhatsApp = '+216 52 345 678';
    
    return {
      email: defaultEmail,
      phone: defaultPhone,
      whatsapp: defaultWhatsApp,
      companyName: 'MA Training & Consulting',
      supportHours: '24/7',
      responseTime: 'Sous 2h',
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
      links: {
        email: this.generateMailtoLink(defaultEmail, 'Demande de consultation - Digitalisation MATC'),
        phone: this.generatePhoneLinkDirect(defaultPhone),
        whatsapp: this.generateWhatsAppLinkDirect(defaultWhatsApp)
      }
    };
  }

  // Méthodes directes pour éviter la récursion
  private generateMailtoLink(email: string, subject: string): string {
    const emailBody = `Bonjour,

Je souhaite obtenir plus d'informations concernant vos services de digitalisation.

Mes coordonnées :
- Nom : [Votre nom]
- Entreprise : [Nom de votre entreprise]
- Téléphone : [Votre numéro]
- Secteur d'activité : [Votre secteur]

Besoins spécifiques :
[Décrivez brièvement vos besoins]

Cordialement,
[Votre nom]`;

    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
  }

  private generatePhoneLinkDirect(phone: string): string {
    return `tel:${phone.replace(/\s+/g, '')}`;
  }

  private generateWhatsAppLinkDirect(phone: string): string {
    const whatsappMessage = 'Bonjour, je souhaite obtenir des informations sur vos services de digitalisation MATC.';
    const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
  }

  // Vider le cache
  clearCache(): void {
    this.cache = null;
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('🗑️ Cache contact vidé');
    } catch (error) {
      console.warn('⚠️ Erreur lors du vidage du cache:', error);
    }
  }

  // Forcer le rechargement depuis l'API
  async forceRefresh(): Promise<ContactData> {
    this.clearCache();
    return this.getContactDataWithCache();
  }
}

export const digitalizationContactApiService = new DigitalizationContactApiService();
export type { ContactData, ContactLinks, ContactButtons };
