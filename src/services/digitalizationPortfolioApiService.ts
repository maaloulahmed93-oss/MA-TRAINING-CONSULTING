const API_BASE = 'http://localhost:3001/api/digitalization-portfolio';

export interface PortfolioItem {
  title: string;
  description: string;
  result: string;
  image: string;
}

export interface PortfolioExample {
  name: string;
  detail: string;
  link?: string;
  imageUrl?: string;
}

export interface PortfolioData {
  title: string;
  intro: string;
  portfolio: PortfolioItem[];
  portfolioExamples: Record<string, PortfolioExample[]>;
}

class DigitalizationPortfolioApiService {
  private cache: PortfolioData | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // جلب البيانات للموقع الرئيسي مع نظام cache
  async getPortfolioData(): Promise<PortfolioData> {
    try {
      // Check cache first
      if (this.cache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
        console.log('📦 Using cached portfolio data');
        return this.cache;
      }

      console.log('🔄 Fetching portfolio data from API...');
      
      const response = await fetch(API_BASE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Portfolio data fetched successfully');
        
        // Cache the data
        this.cache = result.data;
        this.cacheTimestamp = Date.now();
        
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch portfolio data');
      }
      
    } catch (error) {
      console.error('❌ Error fetching portfolio data:', error);
      console.log('🔄 Falling back to static data...');
      
      // Fallback to static data
      return this.getStaticData();
    }
  }

  // فحص حالة الـ API
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/stats`, {
        method: 'GET',
        timeout: 5000 // 5 second timeout
      } as RequestInit);
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // مسح الـ cache
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
    console.log('🗑️ Portfolio cache cleared');
  }

  // البيانات الثابتة كـ fallback
  private getStaticData(): PortfolioData {
    return {
      title: 'Portfolio & Réalisations',
      intro: 'Découvrez les résultats concrets obtenus pour nos clients',
      portfolio: [
        {
          title: 'Transformation E-commerce',
          description: 'Augmentation de 300% des ventes en ligne',
          result: '+300% ventes',
          image: '📊'
        },
        {
          title: 'Automatisation RH',
          description: 'Réduction de 70% du temps de traitement',
          result: '-70% temps',
          image: '⚡'
        },
        {
          title: 'Présence Digitale',
          description: 'Croissance de 250% de la visibilité en ligne',
          result: '+250% visibilité',
          image: '🚀'
        }
      ],
      portfolioExamples: {
        'Transformation E-commerce': [
          { 
            name: 'Boutique Alpha', 
            detail: 'Migration Shopify + campagnes Meta/Google → CA x3 en 4 mois',
            link: '#case-boutique-alpha',
            imageUrl: 'https://images.unsplash.com/photo-1515165562835-c3b8c2e5d3c4?q=80&w=400&auto=format&fit=crop'
          },
          { 
            name: 'ModeLine', 
            detail: 'Optimisation checkout et upsell → +22% panier moyen',
            link: '#case-modeline'
          },
          { 
            name: 'TechGear', 
            detail: 'Emailing automation (Klaviyo) → +35% revenus récurrents',
            link: '#case-techgear'
          }
        ],
        'Automatisation RH': [
          { 
            name: 'HRPro', 
            detail: 'Flux onboarding automatisé (Zapier) → -70% temps administratif',
            link: '#case-hrpro'
          },
          { 
            name: 'EduNext', 
            detail: 'Signature électronique + suivi candidats → délais divisés par 2',
            link: '#case-edunext'
          },
          { 
            name: 'AgriSmart', 
            detail: 'Portail self-service employés → -40% tickets support',
            link: '#case-agri'
          }
        ],
        'Présence Digitale': [
          { 
            name: 'FinSolve', 
            detail: 'SEO + contenu LinkedIn → +250% impressions organiques',
            link: '#case-finsolve'
          },
          { 
            name: 'RetailPlus', 
            detail: 'Refonte site + social kit → +180% trafic qualifié',
            link: '#case-retailplus'
          },
          { 
            name: 'StartupXYZ', 
            detail: 'Branding cohérent + blog → 3x leads marketing',
            link: '#case-startupxyz'
          }
        ]
      }
    };
  }

  // إحصائيات للتطوير
  async getStats(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      return null;
    }
  }
}

export const digitalizationPortfolioApiService = new DigitalizationPortfolioApiService();
