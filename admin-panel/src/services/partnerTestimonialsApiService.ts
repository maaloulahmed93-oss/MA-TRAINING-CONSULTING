// API Service للتعامل مع Partner Testimonials
import { API_BASE_URL } from '../config/api';

const API_BASE_URL_PARTNER_TESTIMONIALS = `${API_BASE_URL}/partner-testimonials`;

// Interface للتيمونيال
export interface PartnerTestimonial {
  _id?: string;
  testimonialId?: string;
  companyName: string;
  position: string;
  authorName?: string;
  testimonialText: string;
  rating: number;
  initials: string;
  isPublished: boolean;
  displayOrder?: number;
  metadata?: {
    industry?: string;
    projectType?: string;
    collaborationDuration?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Interface للإحصائيات
export interface TestimonialsStats {
  total: number;
  published: number;
  unpublished: number;
  averageRating: number;
  recentlyAdded: number;
}

// Interface للاستجابة
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

class PartnerTestimonialsApiService {
  // جلب جميع التيمونيالز
  async getAllTestimonials(published?: boolean): Promise<PartnerTestimonial[]> {
    try {
      const url = new URL(API_BASE_URL_PARTNER_TESTIMONIALS);
      if (published !== undefined) {
        url.searchParams.append('published', published.toString());
      }

      console.log('🔄 Fetching partner testimonials from API...');
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<PartnerTestimonial[]> = await response.json();
      
      if (result.success) {
        console.log(`✅ ${result.count} partner testimonials loaded from API`);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch testimonials');
      }
    } catch (error) {
      console.error('❌ Error fetching partner testimonials:', error);
      
      // Fallback to localStorage
      return this.getTestimonialsFromLocalStorage();
    }
  }

  // إنشاء تيمونيال جديد
  async createTestimonial(testimonialData: Omit<PartnerTestimonial, '_id' | 'testimonialId' | 'createdAt' | 'updatedAt'>): Promise<PartnerTestimonial> {
    try {
      console.log('🔄 Creating new testimonial via API...');
      
      const response = await fetch(API_BASE_URL_PARTNER_TESTIMONIALS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonialData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<PartnerTestimonial> = await response.json();
      
      if (result.success) {
        console.log('✅ Testimonial created successfully');
        
        // حفظ في localStorage كـ backup
        this.saveTestimonialToLocalStorage(result.data);
        
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to create testimonial');
      }
    } catch (error) {
      console.error('❌ Error creating testimonial:', error);
      
      // Fallback to localStorage
      return this.createTestimonialInLocalStorage(testimonialData);
    }
  }

  // تحديث تيمونيال
  async updateTestimonial(id: string, testimonialData: Partial<PartnerTestimonial>): Promise<PartnerTestimonial> {
    try {
      console.log('🔄 Updating testimonial via API...');
      
      const response = await fetch(`${API_BASE_URL_PARTNER_TESTIMONIALS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonialData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<PartnerTestimonial> = await response.json();
      
      if (result.success) {
        console.log('✅ Testimonial updated successfully');
        
        // تحديث localStorage
        this.updateTestimonialInLocalStorage(id, result.data);
        
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to update testimonial');
      }
    } catch (error) {
      console.error('❌ Error updating testimonial via API:', error);
      console.log('📦 Falling back to localStorage update...');
      
      // Fallback to localStorage
      try {
        return this.updateTestimonialInLocalStorage(id, testimonialData);
      } catch (localError) {
        console.error('❌ Error updating in localStorage:', localError);
        // Si même localStorage échoue, créer un nouveau testimonial
        const createData: Omit<PartnerTestimonial, '_id' | 'testimonialId' | 'createdAt' | 'updatedAt'> = {
          companyName: testimonialData.companyName || 'Unknown Company',
          position: testimonialData.position || '',
          authorName: testimonialData.authorName,
          testimonialText: testimonialData.testimonialText || '',
          rating: testimonialData.rating || 5,
          initials: testimonialData.initials || 'UK',
          isPublished: testimonialData.isPublished || false,
          displayOrder: testimonialData.displayOrder || 0,
          metadata: testimonialData.metadata
        };
        return this.createTestimonialInLocalStorage(createData);
      }
    }
  }

  // حذف تيمونيال
  async deleteTestimonial(id: string): Promise<boolean> {
    try {
      console.log('🔄 Deleting testimonial via API...');
      
      const response = await fetch(`${API_BASE_URL_PARTNER_TESTIMONIALS}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<null> = await response.json();
      
      if (result.success) {
        console.log('✅ Testimonial deleted successfully');
        
        // حذف من localStorage
        this.deleteTestimonialFromLocalStorage(id);
        
        return true;
      } else {
        throw new Error(result.message || 'Failed to delete testimonial');
      }
    } catch (error) {
      console.error('❌ Error deleting testimonial:', error);
      
      // Fallback to localStorage
      this.deleteTestimonialFromLocalStorage(id);
      return true;
    }
  }

  // تبديل حالة النشر
  async togglePublishStatus(id: string): Promise<PartnerTestimonial> {
    try {
      console.log('🔄 Toggling publish status via API...');
      
      const response = await fetch(`${API_BASE_URL_PARTNER_TESTIMONIALS}/${id}/toggle-publish`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<PartnerTestimonial> = await response.json();
      
      if (result.success) {
        console.log('✅ Publish status toggled successfully');
        
        // تحديث localStorage
        this.updateTestimonialInLocalStorage(id, result.data);
        
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to toggle publish status');
      }
    } catch (error) {
      console.error('❌ Error toggling publish status:', error);
      throw error;
    }
  }

  // جلب الإحصائيات
  async getStats(): Promise<TestimonialsStats> {
    try {
      console.log('🔄 Fetching testimonials stats...');
      
      const response = await fetch(`${API_BASE_URL_PARTNER_TESTIMONIALS}/stats/summary`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse<TestimonialsStats> = await response.json();
      
      if (result.success) {
        console.log('✅ Stats loaded successfully');
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      
      // Fallback stats
      const testimonials = this.getTestimonialsFromLocalStorage();
      return {
        total: testimonials.length,
        published: testimonials.filter(t => t.isPublished).length,
        unpublished: testimonials.filter(t => !t.isPublished).length,
        averageRating: testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length || 0,
        recentlyAdded: 0
      };
    }
  }

  // إعادة تعيين البيانات الافتراضية
  async resetToDefaults(): Promise<PartnerTestimonial[]> {
    try {
      console.log('🔄 Resetting testimonials to defaults...');
      
      const response = await fetch(`${API_BASE_URL_PARTNER_TESTIMONIALS}/reset`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<PartnerTestimonial[]> = await response.json();
      
      if (result.success) {
        console.log('✅ Testimonials reset successfully');
        
        // تحديث localStorage
        this.saveTestimonialsToLocalStorage(result.data);
        
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to reset testimonials');
      }
    } catch (error) {
      console.error('❌ Error resetting testimonials:', error);
      throw error;
    }
  }

  // === LocalStorage Fallback Methods ===

  private getTestimonialsFromLocalStorage(): PartnerTestimonial[] {
    try {
      const stored = localStorage.getItem('partner-testimonials');
      if (stored) {
        console.log('📦 Loading testimonials from localStorage fallback');
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    
    return this.getDefaultTestimonials();
  }

  private saveTestimonialsToLocalStorage(testimonials: PartnerTestimonial[]): void {
    try {
      localStorage.setItem('partner-testimonials', JSON.stringify(testimonials));
      console.log('💾 Testimonials saved to localStorage');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private saveTestimonialToLocalStorage(testimonial: PartnerTestimonial): void {
    const testimonials = this.getTestimonialsFromLocalStorage();
    testimonials.push(testimonial);
    this.saveTestimonialsToLocalStorage(testimonials);
  }

  private createTestimonialInLocalStorage(testimonialData: Omit<PartnerTestimonial, '_id' | 'testimonialId' | 'createdAt' | 'updatedAt'>): PartnerTestimonial {
    const newTestimonial: PartnerTestimonial = {
      ...testimonialData,
      _id: `local-${Date.now()}`,
      testimonialId: `TEST-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.saveTestimonialToLocalStorage(newTestimonial);
    return newTestimonial;
  }

  private updateTestimonialInLocalStorage(id: string, updates: Partial<PartnerTestimonial>): PartnerTestimonial {
    const testimonials = this.getTestimonialsFromLocalStorage();
    const index = testimonials.findIndex(t => t._id === id);
    
    if (index !== -1) {
      testimonials[index] = { ...testimonials[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveTestimonialsToLocalStorage(testimonials);
      return testimonials[index];
    }
    
    // Si le testimonial n'est pas trouvé, le créer comme nouveau
    console.log(`⚠️ Testimonial with ID ${id} not found in localStorage, creating as new entry`);
    const newTestimonial: PartnerTestimonial = {
      _id: id,
      testimonialId: `TEST-${Date.now()}`,
      companyName: updates.companyName || 'Unknown Company',
      position: updates.position || '',
      authorName: updates.authorName,
      testimonialText: updates.testimonialText || '',
      rating: updates.rating || 5,
      initials: updates.initials || 'UK',
      isPublished: updates.isPublished || false,
      displayOrder: updates.displayOrder || 0,
      metadata: updates.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    testimonials.push(newTestimonial);
    this.saveTestimonialsToLocalStorage(testimonials);
    return newTestimonial;
  }

  private deleteTestimonialFromLocalStorage(id: string): void {
    const testimonials = this.getTestimonialsFromLocalStorage();
    const filtered = testimonials.filter(t => t._id !== id);
    this.saveTestimonialsToLocalStorage(filtered);
  }

  private getDefaultTestimonials(): PartnerTestimonial[] {
    return [
      {
        _id: 'default-1',
        testimonialId: 'TEST-DEFAULT-001',
        companyName: 'Nova Market',
        position: 'Directrice Marketing',
        authorName: 'Sarah Mansouri',
        testimonialText: 'Des solutions concrètes et efficaces pour nos projets.',
        rating: 5,
        initials: 'NM',
        isPublished: true,
        displayOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'default-2',
        testimonialId: 'TEST-DEFAULT-002',
        companyName: 'SmartConsult',
        position: 'Consultante Senior',
        authorName: 'Fatma Trabelsi',
        testimonialText: 'Une équipe à l\'écoute et réactive à chaque étape.',
        rating: 5,
        initials: 'SC',
        isPublished: true,
        displayOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
}

// Export singleton instance
export const partnerTestimonialsApiService = new PartnerTestimonialsApiService();
