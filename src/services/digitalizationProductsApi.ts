const API_BASE_URL = 'https://matc-backend.onrender.com/api/digitalization-products';

export interface DigitalizationProductItem {
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

export interface DigitalizationProductsResponse {
  title: string;
  intro: string;
  products: DigitalizationProductItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class DigitalizationProductsApiService {
  // Get products for main website
  async getProducts(): Promise<DigitalizationProductsResponse> {
    try {
      console.log('🔄 Fetching digitalization products for main website...');
      
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<DigitalizationProductsResponse> = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ Products loaded successfully from API:', result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to load products');
      }
    } catch (error) {
      console.error('❌ Error fetching products from API:', error);
      
      // Fallback to static data
      console.log('🔄 Falling back to static data...');
      return this.getStaticProductsData();
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
  private getStaticProductsData(): DigitalizationProductsResponse {
    console.log('📦 Using static products data as fallback');
    
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
        },
        {
          id: 'ecommerce-testable',
          title: 'E-commerce Testable',
          description: 'Plateforme de vente en ligne complète et personnalisable',
          imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1600&auto=format&fit=crop',
          details: [
            'Catalogue produits et gestion panier',
            'Paiement test (sandbox) et factures',
            'Dashboard commandes et clients'
          ],
          mailtoSubject: 'Plus d\'infos - E-commerce Testable',
          demoLink: '#demo-ecommerce',
          category: 'ecommerce',
          isActive: true
        },
        {
          id: 'campagnes-sponsoring',
          title: 'Campagnes Sponsoring',
          description: 'Campagnes publicitaires optimisées prêtes à lancer',
          imageUrl: 'https://images.unsplash.com/photo-1543286386-2e659306cd6c?q=80&w=1600&auto=format&fit=crop',
          details: [
            'Ciblage précis et audiences lookalike',
            'Cohortes tests et A/B testing',
            'Rapports de performance clairs'
          ],
          mailtoSubject: 'Plus d\'infos - Campagnes Sponsoring',
          demoLink: '#demo-campaigns',
          category: 'marketing',
          isActive: true
        }
      ]
    };
  }

  // Get products with caching (for performance)
  private productsCache: DigitalizationProductsResponse | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getProductsWithCache(): Promise<DigitalizationProductsResponse> {
    const now = Date.now();
    
    // Return cached data if it's still fresh
    if (this.productsCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      console.log('📦 Returning cached products data');
      return this.productsCache;
    }
    
    // Fetch fresh data
    const products = await this.getProducts();
    
    // Update cache
    this.productsCache = products;
    this.cacheTimestamp = now;
    
    return products;
  }

  // Clear cache (useful for admin updates)
  clearCache(): void {
    console.log('🗑️ Clearing products cache');
    this.productsCache = null;
    this.cacheTimestamp = 0;
  }
}

export const digitalizationProductsApi = new DigitalizationProductsApiService();
