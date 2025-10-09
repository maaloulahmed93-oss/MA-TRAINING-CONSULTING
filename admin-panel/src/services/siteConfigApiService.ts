interface SiteConfig {
  _id?: string;
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  favicon: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: {
    facebook: string;
    linkedin: string;
    twitter: string;
    instagram: string;
  };
  seo: {
    keywords: string;
    googleAnalytics: string;
    googleTagManager: string;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class SiteConfigApiService {
  private readonly API_BASE = 'http://localhost:3001/api/site-config';

  // Obtenir la configuration actuelle
  async getSiteConfig(): Promise<SiteConfig> {
    try {
      const response = await fetch(this.API_BASE);
      const result: ApiResponse<SiteConfig> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error(result.message || 'Erreur lors de la récupération de la configuration');
    } catch (error) {
      console.error('Erreur getSiteConfig:', error);
      
      // Fallback vers localStorage
      const localConfig = localStorage.getItem('siteConfig');
      if (localConfig) {
        return JSON.parse(localConfig);
      }
      
      // Configuration par défaut
      return this.getDefaultConfig();
    }
  }

  // Mettre à jour la configuration
  async updateSiteConfig(config: Partial<SiteConfig>): Promise<SiteConfig> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const result: ApiResponse<SiteConfig> = await response.json();
      
      if (result.success && result.data) {
        // Sauvegarder en localStorage comme backup
        localStorage.setItem('siteConfig', JSON.stringify(result.data));
        return result.data;
      }
      
      throw new Error(result.message || 'Erreur lors de la mise à jour');
    } catch (error) {
      console.error('Erreur updateSiteConfig:', error);
      
      // Fallback vers localStorage
      const currentConfig = await this.getSiteConfig();
      const updatedConfig = { ...currentConfig, ...config };
      localStorage.setItem('siteConfig', JSON.stringify(updatedConfig));
      
      throw error;
    }
  }

  // Upload favicon ou logo
  async uploadFile(file: File, type: 'favicon' | 'logo'): Promise<{ favicon?: string; logo?: string }> {
    try {
      const formData = new FormData();
      formData.append(type, file);

      const response = await fetch(`${this.API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      const result: ApiResponse<{ favicon?: string; logo?: string }> = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      
      throw new Error(result.message || 'Erreur lors de l\'upload');
    } catch (error) {
      console.error('Erreur uploadFile:', error);
      throw error;
    }
  }

  // Réinitialiser la configuration
  async resetSiteConfig(): Promise<SiteConfig> {
    try {
      const response = await fetch(`${this.API_BASE}/reset`, {
        method: 'POST',
      });

      const result: ApiResponse<SiteConfig> = await response.json();
      
      if (result.success && result.data) {
        // Mettre à jour localStorage
        localStorage.setItem('siteConfig', JSON.stringify(result.data));
        return result.data;
      }
      
      throw new Error(result.message || 'Erreur lors de la réinitialisation');
    } catch (error) {
      console.error('Erreur resetSiteConfig:', error);
      
      // Fallback vers configuration par défaut
      const defaultConfig = this.getDefaultConfig();
      localStorage.setItem('siteConfig', JSON.stringify(defaultConfig));
      return defaultConfig;
    }
  }

  // Configuration par défaut
  private getDefaultConfig(): SiteConfig {
    return {
      siteName: '3d MA-TRAINING-CONSULTING',
      siteTitle: '3d MA-TRAINING-CONSULTING - Formation et Consulting',
      siteDescription: 'Centre de formation professionnelle et consulting en Tunisie',
      favicon: '/favicon.ico',
      logo: '/logo.png',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      contactEmail: 'contact@ma-training-consulting.com',
      contactPhone: '+216 XX XXX XXX',
      address: 'Tunis, Tunisie',
      socialMedia: {
        facebook: '',
        linkedin: '',
        twitter: '',
        instagram: ''
      },
      seo: {
        keywords: 'formation, consulting, tunisie, professionnelle',
        googleAnalytics: '',
        googleTagManager: ''
      },
      isActive: true
    };
  }

  // Vérifier la connexion API
  async checkApiConnection(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('API non disponible:', error);
      return false;
    }
  }
}

export const siteConfigApiService = new SiteConfigApiService();
export type { SiteConfig };
