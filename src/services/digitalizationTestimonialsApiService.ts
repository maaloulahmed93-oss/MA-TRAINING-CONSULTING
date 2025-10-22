const API_BASE = 'https://matc-backend.onrender.com/api/digitalization-testimonials';

export interface TestimonialItem {
  name: string;
  company: string;
  rating: number;
  comment: string;
  avatar: string;
}

export interface TestimonialsData {
  title: string;
  subtitle: string;
  testimonials: TestimonialItem[];
}

class DigitalizationTestimonialsApiService {
  private cache: TestimonialsData | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // جلب البيانات للموقع الرئيسي مع نظام cache
  async getTestimonialsData(): Promise<TestimonialsData> {
    try {
      // Check cache first
      if (this.cache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
        console.log('📦 Using cached testimonials data');
        return this.cache;
      }

      console.log('🔄 Fetching testimonials data from API...');
      
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
        console.log('✅ Testimonials data fetched successfully');
        
        // Cache the data
        this.cache = result.data;
        this.cacheTimestamp = Date.now();
        
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch testimonials data');
      }
      
    } catch (error) {
      console.error('❌ Error fetching testimonials data:', error);
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
    console.log('🗑️ Testimonials cache cleared');
  }

  // البيانات الثابتة كـ fallback
  private getStaticData(): TestimonialsData {
    return {
      title: 'Témoignages Clients',
      subtitle: 'Ce que disent nos clients de nos services de digitalisation',
      testimonials: [
        {
          name: 'Sarah Dubois',
          company: 'TechStart SAS',
          rating: 5,
          comment: 'Transformation digitale exceptionnelle ! Notre productivité a doublé en 3 mois.',
          avatar: 'SD'
        },
        {
          name: 'Ahmed Benali',
          company: 'Commerce Plus',
          rating: 5,
          comment: 'L\'équipe a créé notre e-commerce de A à Z. Résultats au-delà de nos attentes !',
          avatar: 'AB'
        },
        {
          name: 'Marie Laurent',
          company: 'Consulting Pro',
          rating: 5,
          comment: 'Support 24/7 exceptionnel et formations très pratiques. Je recommande vivement !',
          avatar: 'ML'
        },
        {
          name: 'Amel Rekik',
          company: 'RetailPlus',
          rating: 5,
          comment: 'Nos ventes en ligne ont doublé grâce à leur stratégie et automatisation marketing.',
          avatar: 'AR'
        },
        {
          name: 'Mohamed Ali Saidi',
          company: 'EduNext',
          rating: 5,
          comment: 'Plateforme e-learning livrée à temps, UX impeccable et support réactif.',
          avatar: 'MS'
        },
        {
          name: 'Ines Bouaziz',
          company: 'FinSolve',
          rating: 4,
          comment: 'Tableaux de bord clairs, décisions plus rapides. Très bon rapport qualité/prix.',
          avatar: 'IB'
        }
      ]
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

export const digitalizationTestimonialsApiService = new DigitalizationTestimonialsApiService();
