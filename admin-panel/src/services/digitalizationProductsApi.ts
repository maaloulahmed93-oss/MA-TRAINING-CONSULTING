import { API_BASE_URL } from '../config/api';
const API_BASE_URL = 'http://localhost:3001/api/digitalization-products';

export interface DigitalizationProduct {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  details: string[];
  mailtoSubject: string;
  demoLink: string;
  category: string;
  isActive: boolean;
}

export interface DigitalizationProductsData {
  title: string;
  intro: string;
  products: DigitalizationProduct[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class DigitalizationProductsApiService {
  // Get products for admin panel
  async getProductsForAdmin(): Promise<DigitalizationProductsData> {
    try {
      console.log('🔄 Fetching products for admin panel...');
      
      const response = await fetch(`${API_BASE_URL}/admin`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<DigitalizationProductsData> = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ Products loaded successfully from API:', result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to load products');
      }
    } catch (error) {
      console.error('❌ Error fetching products from API:', error);
      
      // Fallback to localStorage
      console.log('🔄 Falling back to localStorage...');
      return this.getProductsFromLocalStorage();
    }
  }

  // Save products from admin panel
  async saveProducts(productsData: DigitalizationProductsData): Promise<boolean> {
    try {
      console.log('🔄 Saving products to API...');
      console.log('📝 Data to save:', productsData);
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productsData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      
      if (result.success) {
        console.log('✅ Products saved successfully to API');
        
        // Also save to localStorage as backup
        this.saveProductsToLocalStorage(productsData);
        
        return true;
      } else {
        throw new Error(result.message || 'Failed to save products');
      }
    } catch (error) {
      console.error('❌ Error saving products to API:', error);
      
      // Fallback to localStorage
      console.log('🔄 Falling back to localStorage...');
      this.saveProductsToLocalStorage(productsData);
      
      return false; // Indicate API save failed but localStorage succeeded
    }
  }

  // Get statistics
  async getStatistics() {
    try {
      console.log('🔄 Fetching statistics...');
      
      const response = await fetch(`${API_BASE_URL}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ Statistics loaded:', result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to load statistics');
      }
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      return {
        totalProducts: 0,
        totalDetails: 0,
        lastUpdated: null,
        categories: {}
      };
    }
  }

  // Reset to default products
  async resetToDefault(): Promise<boolean> {
    try {
      console.log('🔄 Resetting products to default...');
      
      const response = await fetch(`${API_BASE_URL}/reset`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      
      if (result.success) {
        console.log('✅ Products reset to default successfully');
        return true;
      } else {
        throw new Error(result.message || 'Failed to reset products');
      }
    } catch (error) {
      console.error('❌ Error resetting products:', error);
      return false;
    }
  }

  // localStorage fallback methods
  private getProductsFromLocalStorage(): DigitalizationProductsData {
    try {
      const stored = localStorage.getItem('digitalization_products');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('📦 Loaded products from localStorage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('❌ Error loading from localStorage:', error);
    }

    // Return default data
    console.log('🔄 Using default products data');
    return this.getDefaultProductsData();
  }

  private saveProductsToLocalStorage(productsData: DigitalizationProductsData): void {
    try {
      localStorage.setItem('digitalization_products', JSON.stringify(productsData));
      console.log('💾 Products saved to localStorage as backup');
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
    }
  }

  private getDefaultProductsData(): DigitalizationProductsData {
    return {
      title: 'Démo & Produits Prêts',
      intro: 'Découvrez nos solutions en action et testez nos produits avant de vous engager',
      products: [
        {
          id: 'site-web-demo',
          title: 'Site Web Démo',
          description: 'Site vitrine professionnel avec accès test complet',
          imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop',
          details: [
            'Hébergement et domaine inclus (démo)',
            'Design responsive multi-plateformes',
            'Formulaire de contact et pages essentielles'
          ],
          mailtoSubject: 'Plus d\'infos - Site Web Démo',
          demoLink: '#demo-site',
          category: 'web',
          isActive: true
        },
        {
          id: 'pack-publications',
          title: 'Pack Publications Pro',
          description: 'Affiches et contenus visuels professionnels prêts à utiliser',
          imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop',
          details: [
            'Templates multi-format (feed, story, reels)',
            'Charte graphique cohérente',
            'Calendrier éditorial de 30 jours'
          ],
          mailtoSubject: 'Plus d\'infos - Pack Publications Pro',
          demoLink: '#demo-publications',
          category: 'marketing',
          isActive: true
        }
      ]
    };
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔄 Testing API connection...');
      
      const response = await fetch(`${API_BASE_URL.replace("/api", "")}/health`, {
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
}

export const digitalizationProductsApi = new DigitalizationProductsApiService();
