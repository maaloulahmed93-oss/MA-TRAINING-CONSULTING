import { API_BASE_URL } from '../config/api';
// Service API pour la gestion des cours gratuits dans l'Admin Panel
const API_BASE = `${API_BASE_URL}/free-courses`;

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
  url?: string;
  modules: CourseModule[];
}

export interface CourseModule {
  id: number;
  title: string;
  duration: string;
  url?: string;
}

export interface FreeCourseAccess {
  accessId: string;
  isActive: boolean;
  usageCount: number;
  maxUsage: number;
  expiresAt?: string;
  description?: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class FreeCoursesApiService {
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

  // === PUBLIC METHODS ===
  
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
      const response = await fetch(`${API_BASE_URL}/health`);
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

  // === ADMIN DOMAIN MANAGEMENT ===
  
  // Créer un nouveau domaine
  async createDomain(domainData: {
    domainId: string;
    title: string;
    icon: string;
    description: string;
  }): Promise<any> {
    try {
      const response = await this.request<any>('/admin/domains', {
        method: 'POST',
        body: JSON.stringify(domainData),
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur createDomain:', error);
      throw error;
    }
  }

  // Mettre à jour un domaine
  async updateDomain(domainId: string, domainData: {
    title: string;
    icon: string;
    description: string;
  }): Promise<any> {
    try {
      const response = await this.request<any>(`/admin/domains/${domainId}`, {
        method: 'PUT',
        body: JSON.stringify(domainData),
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur updateDomain:', error);
      throw error;
    }
  }

  // Supprimer un domaine
  async deleteDomain(domainId: string): Promise<void> {
    try {
      await this.request<void>(`/admin/domains/${domainId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('❌ Erreur deleteDomain:', error);
      throw error;
    }
  }

  // Récupérer les domaines pour l'admin
  async getAdminDomains(): Promise<Domain[]> {
    try {
      const response = await this.request<Domain[]>('/admin/domains');
      return response.data || [];
    } catch (error) {
      console.error('❌ Erreur getAdminDomains:', error);
      throw error;
    }
  }

  // === ACCESS ID MANAGEMENT ===
  
  // Ajouter un ID d'accès
  async addAccessId(accessId: string, domainId?: string): Promise<any> {
    try {
      const response = await this.request<any>('/admin/access-ids', {
        method: 'POST',
        body: JSON.stringify({ accessId, domainId }),
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur addAccessId:', error);
      throw error;
    }
  }

  // Supprimer un ID d'accès
  async deleteAccessId(accessId: string): Promise<void> {
    try {
      await this.request<void>(`/admin/access-ids/${accessId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('❌ Erreur deleteAccessId:', error);
      throw error;
    }
  }

  // Récupérer tous les IDs d'accès
  async getAccessIds(): Promise<string[]> {
    try {
      const response = await this.request<FreeCourseAccess[]>('/admin/access-ids');
      return (response.data || []).map(access => access.accessId);
    } catch (error) {
      console.error('❌ Erreur getAccessIds:', error);
      throw error;
    }
  }

  // === COURSE MANAGEMENT ===
  
  // Créer un nouveau cours
  async createCourse(domainId: string, courseData: {
    courseId: string;
    title: string;
    description: string;
    url?: string;
  }): Promise<any> {
    try {
      const response = await this.request<any>('/admin/courses', {
        method: 'POST',
        body: JSON.stringify({
          ...courseData,
          domainId
        }),
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur createCourse:', error);
      throw error;
    }
  }

  // Mettre à jour un cours
  async updateCourse(courseId: string, courseData: {
    title: string;
    description: string;
    url?: string;
  }): Promise<any> {
    try {
      console.log(`🔄 Mise à jour du cours: ${courseId}`);
      console.log(`📝 Données envoyées:`, courseData);
      
      const response = await this.request<any>(`/admin/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify(courseData),
      });
      
      console.log(`✅ Réponse du serveur:`, response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur updateCourse:', error);
      throw error;
    }
  }

  // Supprimer un cours
  async deleteCourse(courseId: string): Promise<void> {
    try {
      await this.request<void>(`/admin/courses/${courseId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('❌ Erreur deleteCourse:', error);
      throw error;
    }
  }

  // === MODULE MANAGEMENT ===
  
  // Créer un nouveau module
  async createModule(courseId: string, moduleData: {
    moduleId: number;
    title: string;
    duration: string;
    url?: string;
  }): Promise<any> {
    try {
      const response = await this.request<any>('/admin/modules', {
        method: 'POST',
        body: JSON.stringify({
          ...moduleData,
          courseId
        }),
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur createModule:', error);
      throw error;
    }
  }

  // Mettre à jour un module
  async updateModule(moduleId: number, courseId: string, moduleData: {
    title: string;
    duration: string;
    url?: string;
  }): Promise<any> {
    try {
      const response = await this.request<any>(`/admin/modules/${moduleId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...moduleData,
          courseId
        }),
      });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur updateModule:', error);
      throw error;
    }
  }

  // Supprimer un module
  async deleteModule(moduleId: number, courseId: string): Promise<void> {
    try {
      await this.request<void>(`/admin/modules/${moduleId}`, {
        method: 'DELETE',
        body: JSON.stringify({ courseId }),
      });
    } catch (error) {
      console.error('❌ Erreur deleteModule:', error);
      throw error;
    }
  }
}

// Instance singleton
export const freeCoursesApiService = new FreeCoursesApiService();
export default freeCoursesApiService;
