// API Service للتعامل مع Partner Testimonials في الموقع الرئيسي
const API_BASE_URL = 'http://localhost:3001/api/partner-testimonials';

// Interface للتيمونيال (format الموقع الرئيسي)
export interface WebsiteTestimonial {
  id: string;
  text: string;
  initials: string;
  name: string;
  position: string;
  rating: number;
}

// Interface للاستجابة
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

class PartnerTestimonialsWebsiteService {
  // جلب التيمونيالز المنشورة للموقع الرئيسي
  async getPublishedTestimonials(): Promise<WebsiteTestimonial[]> {
    try {
      console.log('🔄 Fetching published testimonials from API...');
      
      const response = await fetch(`${API_BASE_URL}/published`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<WebsiteTestimonial[]> = await response.json();
      
      if (result.success) {
        console.log(`✅ ${result.count} published testimonials loaded from API`);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch testimonials');
      }
    } catch (error) {
      console.error('❌ Error fetching published testimonials:', error);
      console.log('📦 Falling back to default testimonials');
      
      // Fallback to default testimonials
      return this.getDefaultTestimonials();
    }
  }

  // فحص حالة API
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/published`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // البيانات الافتراضية (fallback)
  private getDefaultTestimonials(): WebsiteTestimonial[] {
    return [
      { 
        id: "1", 
        text: "Grâce à MATC, notre équipe RH a progressé rapidement dans la digitalisation.", 
        initials: "BXZ", 
        name: "Banque XYZ", 
        position: "DRH",
        rating: 5
      },
      { 
        id: "2", 
        text: "Leurs formateurs sont excellents : clairs, concrets.", 
        initials: "TP", 
        name: "TECHPRO", 
        position: "Directeur Général",
        rating: 5
      },
      { 
        id: "3", 
        text: "MATC a apporté une vraie valeur ajoutée à notre organisation.", 
        initials: "EG", 
        name: "ÉDUCA Group", 
        position: "Responsable formation",
        rating: 5
      },
      { 
        id: "4", 
        text: "Un partenariat qui a transformé notre approche du digital.", 
        initials: "BC", 
        name: "BIZCONNECT", 
        position: "CEO",
        rating: 5
      },
      { 
        id: "5", 
        text: "Des solutions concrètes et efficaces pour nos projets.", 
        initials: "NM", 
        name: "Nova Market", 
        position: "Directrice Marketing",
        rating: 5
      },
      { 
        id: "6", 
        text: "Une équipe à l'écoute et réactive à chaque étape.", 
        initials: "SC", 
        name: "SmartConsult", 
        position: "Consultante Senior",
        rating: 5
      },
      { 
        id: "7", 
        text: "Des formations co-animées qui ont vraiment motivé nos équipes.", 
        initials: "PL", 
        name: "ProLearn", 
        position: "Directeur Formation",
        rating: 5
      }
    ];
  }

  // Cache system pour améliorer les performances
  private cache: {
    data: WebsiteTestimonial[] | null;
    timestamp: number;
    ttl: number; // 5 minutes
  } = {
    data: null,
    timestamp: 0,
    ttl: 5 * 60 * 1000
  };

  // جلب التيمونيالز مع cache
  async getTestimonialsWithCache(): Promise<WebsiteTestimonial[]> {
    const now = Date.now();
    
    // Check if cache is valid
    if (this.cache.data && (now - this.cache.timestamp) < this.cache.ttl) {
      console.log('📦 Using cached testimonials');
      return this.cache.data;
    }
    
    // Fetch fresh data
    const testimonials = await this.getPublishedTestimonials();
    
    // Update cache
    this.cache.data = testimonials;
    this.cache.timestamp = now;
    
    return testimonials;
  }

  // Clear cache
  clearCache(): void {
    this.cache.data = null;
    this.cache.timestamp = 0;
    console.log('🗑️ Testimonials cache cleared');
  }
}

// Export singleton instance
export const partnerTestimonialsWebsiteService = new PartnerTestimonialsWebsiteService();
