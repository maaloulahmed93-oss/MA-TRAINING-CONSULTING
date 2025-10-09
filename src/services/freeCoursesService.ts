// Service pour l'accès aux cours gratuits côté site public
const API_BASE = 'http://localhost:3001/api/free-courses';

export interface Domain {
  id: string;
  title: string;
  icon: string;
  description: string;
  courses: Course[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
}

export interface CourseModule {
  id: number;
  title: string;
  duration: string;
  url?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class FreeCoursesService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      console.log(`🔄 API Request: ${endpoint}`);
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error(`❌ API Error (${response.status}):`, data);
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      console.log(`✅ API Success: ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`❌ Network Error: ${endpoint}`, error);
      throw error;
    }
  }

  // Récupérer tous les domaines avec cours et modules
  async getDomains(): Promise<Domain[]> {
    try {
      const response = await this.request<Domain[]>('/domains');
      return response.data || [];
    } catch (error) {
      console.error('❌ Erreur getDomains:', error);
      throw error;
    }
  }

  // Valider un ID d'accès
  async validateAccess(accessId: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await this.request<any>('/validate-access', {
        method: 'POST',
        body: JSON.stringify({ accessId }),
      });
      
      return {
        success: true,
        message: response.message || 'Accès validé',
        data: response.data
      };
    } catch (error) {
      console.error('❌ Erreur validateAccess:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur de validation'
      };
    }
  }

  // Vérifier la santé de l'API
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      return response.ok;
    } catch (error) {
      console.error('❌ API Health Check Failed:', error);
      return false;
    }
  }

  // Test de connectivité complète
  async testConnection(): Promise<{
    api: boolean;
    domains: boolean;
    validation: boolean;
  }> {
    const results = {
      api: false,
      domains: false,
      validation: false
    };

    try {
      // Test API health
      results.api = await this.checkApiHealth();
      
      // Test domains endpoint
      if (results.api) {
        try {
          await this.getDomains();
          results.domains = true;
        } catch (error) {
          console.error('❌ Domains test failed:', error);
        }
        
        // Test validation endpoint (expect 401 for invalid ID)
        try {
          const validationResult = await this.validateAccess('TEST-CONNECTION');
          results.validation = !validationResult.success; // 401 is expected for invalid ID
        } catch (error) {
          // 401 error is expected for invalid test ID, so validation endpoint is working
          results.validation = true;
          console.log('✅ Validation endpoint working (401 expected for test ID)');
        }
      }
      
    } catch (error) {
      console.error('❌ Connection test failed:', error);
    }

    return results;
  }
}

// Instance singleton
export const freeCoursesService = new FreeCoursesService();
export default freeCoursesService;
