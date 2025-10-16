import { WebsitePage, WebsitePageFormData } from '../types/websitePage';
import { API_BASE_URL as BASE_URL } from '../config/api';

const API_BASE_URL = `${BASE_URL}/website-pages`;

export class WebsitePagesApiService {
  // جلب جميع الصفحات
  static async getAllPages(): Promise<WebsitePage[]> {
    try {
      const response = await fetch(API_BASE_URL);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || 'Erreur lors de la récupération des pages');
    } catch (error) {
      console.error('Error fetching pages:', error);
      throw error;
    }
  }

  // جلب الصفحات النشطة فقط
  static async getActivePages(): Promise<WebsitePage[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/active`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || 'Erreur lors de la récupération des pages actives');
    } catch (error) {
      console.error('Error fetching active pages:', error);
      throw error;
    }
  }

  // إنشاء صفحة جديدة (فقط للصفحات غير الافتراضية)
  static async createPage(pageData: WebsitePageFormData): Promise<WebsitePage> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData),
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || 'Erreur lors de la création de la page');
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  }

  // تحديث صفحة
  static async updatePage(id: string, pageData: Partial<WebsitePageFormData>): Promise<WebsitePage> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData),
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || 'Erreur lors de la mise à jour de la page');
    } catch (error) {
      console.error('Error updating page:', error);
      throw error;
    }
  }

  // حذف صفحة (فقط للصفحات غير الافتراضية)
  static async deletePage(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la suppression de la page');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      throw error;
    }
  }

  // تبديل حالة النشاط
  static async togglePageStatus(id: string): Promise<WebsitePage> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/toggle-status`, {
        method: 'PUT',
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || 'Erreur lors du changement de statut');
    } catch (error) {
      console.error('Error toggling page status:', error);
      throw error;
    }
  }

  // جلب إحصائيات الصفحات
  static async getStats(): Promise<{
    totalPages: number;
    activePages: number;
    inactivePages: number;
    defaultPages: number;
    customPages: number;
    categoriesStats: { _id: string; count: number }[];
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || 'Erreur lors de la récupération des statistiques');
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  // إنشاء الصفحات الافتراضية
  static async initDefaultPages(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/init-defaults`, {
        method: 'POST',
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de l\'initialisation');
      }
    } catch (error) {
      console.error('Error initializing default pages:', error);
      throw error;
    }
  }
}
