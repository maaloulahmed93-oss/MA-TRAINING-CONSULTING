const API_BASE_URL = 'https://matc-backend.onrender.com/api/digitalization-services';

export interface DigitalizationServiceItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  gradient: string;
  items: string[];
}

export interface DigitalizationServicesResponse {
  title: string;
  intro: string;
  services: DigitalizationServiceItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class DigitalizationServicesApiService {
  // Get services for main website
  async getServices(): Promise<DigitalizationServicesResponse> {
    try {
      console.log('🔄 Fetching digitalization services for main website...');
      
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<DigitalizationServicesResponse> = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ Services loaded successfully from API:', result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to load services');
      }
    } catch (error) {
      console.error('❌ Error fetching services from API:', error);
      
      // Fallback to static data
      console.log('🔄 Falling back to static data...');
      return this.getStaticServicesData();
    }
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔄 Testing API connection...');
      
      const response = await fetch('https://matc-backend.onrender.com/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('✅ API connection successful');
        return true;
      } else {
        console.log('❌ API connection failed');
        return false;
      }
    } catch (error) {
      console.error('❌ API connection error:', error);
      return false;
    }
  }

  // Static fallback data (matches current DigitalizationPage.tsx)
  private getStaticServicesData(): DigitalizationServicesResponse {
    console.log('📦 Using static services data as fallback');
    
    return {
      title: 'Nos Services',
      intro: 'Des solutions complètes pour digitaliser votre entreprise et optimiser vos performances',
      services: [
        {
          id: 'creation',
          title: 'Création digitale & présence en ligne',
          icon: 'Globe',
          color: 'blue',
          gradient: 'from-blue-500 to-blue-600',
          items: [
            'Site web vitrine avec démo',
            'Plateforme e-commerce prête à l\'emploi',
            'Packs publications (affiches, vidéos)',
            'Sponsoring & campagnes réseaux sociaux'
          ]
        },
        {
          id: 'automation',
          title: 'Automatisation & Applications IA',
          icon: 'Bot',
          color: 'purple',
          gradient: 'from-purple-500 to-purple-600',
          items: [
            'Automatisation des processus internes',
            'Applications IA sur mesure',
            'Marketing automatisé',
            'Analyse BI & rapports'
          ]
        },
        {
          id: 'training',
          title: 'Accompagnement & formation',
          icon: 'GraduationCap',
          color: 'green',
          gradient: 'from-green-500 to-green-600',
          items: [
            'Certification ISO',
            'Transformation digitale sur mesure',
            'Formations pratiques'
          ]
        },
        {
          id: 'saas',
          title: 'Solutions (SaaS)',
          icon: 'Database',
          color: 'orange',
          gradient: 'from-orange-500 to-orange-600',
          items: [
            'ERP modulaire',
            'CRM en ligne',
            'Gestion réseaux sociaux avec IA',
            'Plateforme e-commerce + maintenance'
          ]
        }
      ]
    };
  }

  // Get services with caching (for performance)
  private servicesCache: DigitalizationServicesResponse | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getServicesWithCache(): Promise<DigitalizationServicesResponse> {
    const now = Date.now();
    
    // Return cached data if it's still fresh
    if (this.servicesCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      console.log('📦 Returning cached services data');
      return this.servicesCache;
    }
    
    // Fetch fresh data
    const services = await this.getServices();
    
    // Update cache
    this.servicesCache = services;
    this.cacheTimestamp = now;
    
    return services;
  }

  // Clear cache (useful for admin updates)
  clearCache(): void {
    console.log('🗑️ Clearing services cache');
    this.servicesCache = null;
    this.cacheTimestamp = 0;
  }
}

export const digitalizationServicesApi = new DigitalizationServicesApiService();
