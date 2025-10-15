import { API_BASE_URL } from '../config/api';
const API_BASE = `${API_BASE_URL}/digitalization-testimonials`;

export interface TestimonialItem {
  author: string;
  role?: string;
  quote: string;
  rating?: number;
  avatar?: string;
}

export interface TestimonialsData {
  title: string;
  subtitle: string;
  items: TestimonialItem[];
}

class DigitalizationTestimonialsApiService {
  
  // جلب البيانات للـ Admin Panel
  async getTestimonialsForAdmin(): Promise<TestimonialsData> {
    try {
      console.log('🔄 Fetching testimonials data for admin...');
      
      const response = await fetch(`${API_BASE}/admin`, {
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
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch testimonials data');
      }
      
    } catch (error) {
      console.error('❌ Error fetching testimonials data:', error);
      
      // Fallback to localStorage
      console.log('🔄 Falling back to localStorage...');
      return this.getLocalStorageData();
    }
  }

  // حفظ البيانات من Admin Panel
  async saveTestimonials(data: TestimonialsData): Promise<boolean> {
    try {
      console.log('💾 Saving testimonials data...', data);
      
      const response = await fetch(API_BASE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Testimonials saved successfully');
        
        // Also save to localStorage as backup
        this.saveToLocalStorage(data);
        
        return true;
      } else {
        throw new Error(result.message || 'Failed to save testimonials');
      }
      
    } catch (error) {
      console.error('❌ Error saving testimonials:', error);
      
      // Fallback to localStorage
      console.log('💾 Saving to localStorage as fallback...');
      this.saveToLocalStorage(data);
      
      return false;
    }
  }

  // إضافة تيموين جديد
  async addTestimonial(testimonial: TestimonialItem): Promise<boolean> {
    try {
      console.log('➕ Adding new testimonial...', testimonial);
      
      const response = await fetch(`${API_BASE}/testimonial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: testimonial.author,
          company: testimonial.role,
          rating: testimonial.rating || 5,
          comment: testimonial.quote
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Testimonial added successfully');
        return true;
      } else {
        throw new Error(result.message || 'Failed to add testimonial');
      }
      
    } catch (error) {
      console.error('❌ Error adding testimonial:', error);
      return false;
    }
  }

  // إعادة تعيين للبيانات الافتراضية
  async resetToDefault(): Promise<boolean> {
    try {
      console.log('🔄 Resetting testimonials to default...');
      
      const response = await fetch(`${API_BASE}/reset`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Testimonials reset successfully');
        return true;
      } else {
        throw new Error(result.message || 'Failed to reset testimonials');
      }
      
    } catch (error) {
      console.error('❌ Error resetting testimonials:', error);
      return false;
    }
  }

  // جلب الإحصائيات
  async getStats(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      
      return {
        totalTestimonials: 0,
        averageRating: 0,
        lastUpdated: null
      };
      
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      return {
        totalTestimonials: 0,
        averageRating: 0,
        lastUpdated: null
      };
    }
  }

  // فحص حالة الـ API
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // البيانات الافتراضية للـ localStorage
  private getLocalStorageData(): TestimonialsData {
    const saved = localStorage.getItem('digitalization_testimonials');
    
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
      }
    }
    
    // Default data
    return {
      title: 'Témoignages Clients',
      subtitle: 'Ce que disent nos clients de nos services de digitalisation',
      items: [
        {
          author: 'Client A',
          role: 'CEO',
          quote: 'Super accompagnement, résultats concrets.',
          rating: 5
        }
      ]
    };
  }

  // حفظ في localStorage
  private saveToLocalStorage(data: TestimonialsData): void {
    try {
      localStorage.setItem('digitalization_testimonials', JSON.stringify(data));
      console.log('💾 Data saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
    }
  }
}

export const digitalizationTestimonialsApiService = new DigitalizationTestimonialsApiService();
