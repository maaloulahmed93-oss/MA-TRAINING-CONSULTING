import { API_BASE_URL } from '../config/api';
const API_BASE_URL_DIGITALIZATION_SERVICES = `${API_BASE_URL}/digitalization-services`;

export interface DigitalizationService {
  id: string;
  title: string;
  items: string[];
}

export interface DigitalizationServicesData {
  title: string;
  intro: string;
  services: DigitalizationService[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class DigitalizationServicesApiService {
  // Get services for admin panel
  async getServicesForAdmin(): Promise<DigitalizationServicesData> {
    try {
      console.log('🔄 Fetching services for admin panel...');
      
      const response = await fetch(`${API_BASE_URL_DIGITALIZATION_SERVICES}/admin`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<DigitalizationServicesData> = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ Services loaded successfully from API:', result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to load services');
      }
    } catch (error) {
      console.error('❌ Error fetching services from API:', error);
      
      // Fallback to localStorage
      console.log('🔄 Falling back to localStorage...');
      return this.getServicesFromLocalStorage();
    }
  }

  // Save services from admin panel
  async saveServices(servicesData: DigitalizationServicesData): Promise<boolean> {
    try {
      console.log('🔄 Saving services to API...');
      console.log('📝 Data to save:', servicesData);
      
      const response = await fetch(API_BASE_URL_DIGITALIZATION_SERVICES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(servicesData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      
      if (result.success) {
        console.log('✅ Services saved successfully to API');
        
        // Also save to localStorage as backup
        this.saveServicesToLocalStorage(servicesData);
        
        return true;
      } else {
        throw new Error(result.message || 'Failed to save services');
      }
    } catch (error) {
      console.error('❌ Error saving services to API:', error);
      
      // Fallback to localStorage
      console.log('🔄 Falling back to localStorage...');
      this.saveServicesToLocalStorage(servicesData);
      
      return false; // Indicate API save failed but localStorage succeeded
    }
  }

  // Get statistics
  async getStatistics() {
    try {
      console.log('🔄 Fetching statistics...');
      
      const response = await fetch(`${API_BASE_URL_DIGITALIZATION_SERVICES}/stats`, {
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
        totalServices: 0,
        totalItems: 0,
        lastUpdated: null
      };
    }
  }

  // Reset to default services
  async resetToDefault(): Promise<boolean> {
    try {
      console.log('🔄 Resetting services to default...');
      
      const response = await fetch(`${API_BASE_URL_DIGITALIZATION_SERVICES}/reset`, {
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
        console.log('✅ Services reset to default successfully');
        return true;
      } else {
        throw new Error(result.message || 'Failed to reset services');
      }
    } catch (error) {
      console.error('❌ Error resetting services:', error);
      return false;
    }
  }

  // localStorage fallback methods
  private getServicesFromLocalStorage(): DigitalizationServicesData {
    try {
      const stored = localStorage.getItem('digitalization_services');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('📦 Loaded services from localStorage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('❌ Error loading from localStorage:', error);
    }

    // Return default data
    console.log('🔄 Using default services data');
    return this.getDefaultServicesData();
  }

  private saveServicesToLocalStorage(servicesData: DigitalizationServicesData): void {
    try {
      localStorage.setItem('digitalization_services', JSON.stringify(servicesData));
      console.log('💾 Services saved to localStorage as backup');
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
    }
  }

  private getDefaultServicesData(): DigitalizationServicesData {
    return {
      title: 'Nos Services',
      intro: 'Des prestations complètes pour propulser votre transformation digitale',
      services: [
        {
          id: 'creation',
          title: 'Création digitale & présence en ligne',
          items: ['Sites vitrines', 'E-commerce', 'Branding']
        },
        {
          id: 'automation',
          title: 'Automatisation & Applications IA',
          items: ['Chatbots', 'RPA', 'LLM Apps']
        },
        {
          id: 'growth',
          title: 'Acquisition & Growth',
          items: ['SEO', 'Ads', 'Emailing']
        },
        {
          id: 'saas',
          title: 'Solutions (SaaS)',
          items: ['CRM', 'Helpdesk', 'Analytics']
        }
      ]
    };
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔄 Testing API connection...');
      
      const response = await fetch(`${API_BASE_URL}/health`, {
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

export const digitalizationServicesApi = new DigitalizationServicesApiService();
