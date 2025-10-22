import { Testimonial } from '../types';
import { API_BASE_URL } from '../config/api';

const API_BASE_URL_TESTIMONIALS = `${API_BASE_URL}/testimonials`;

export class TestimonialsApiService {
  private static instance: TestimonialsApiService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): TestimonialsApiService {
    if (!TestimonialsApiService.instance) {
      TestimonialsApiService.instance = new TestimonialsApiService();
    }
    return TestimonialsApiService.instance;
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCache(key: string): any {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  // Vérifier la connexion API
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL_TESTIMONIALS.replace('/testimonials', '')}/api/health`);
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.warn('🔌 API Backend non disponible:', error);
      return false;
    }
  }

  // Récupérer tous les témoignages (Admin Panel)
  async getAllTestimonials(filters?: {
    status?: string;
    category?: string;
    level?: string;
    search?: string;
  }): Promise<Testimonial[]> {
    try {
      console.log('📋 Récupération des témoignages depuis l\'API...');
      
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.level) params.append('level', filters.level);
      if (filters?.search) params.append('search', filters.search);

      const url = `${API_BASE_URL_TESTIMONIALS}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${result.data.length} témoignages récupérés depuis l'API`);
        return result.data.map(this.transformApiTestimonial);
      } else {
        throw new Error(result.message || 'Erreur API');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des témoignages:', error);
      
      // Fallback vers localStorage
      console.log('🔄 Basculement vers localStorage...');
      return this.getLocalStorageTestimonials();
    }
  }

  // Créer un nouveau témoignage
  async createTestimonial(testimonial: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>): Promise<Testimonial> {
    try {
      console.log('➕ Création d\'un nouveau témoignage...');
      
      const response = await fetch(API_BASE_URL_TESTIMONIALS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonial),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Témoignage créé avec succès');
        const createdTestimonial = this.transformApiTestimonial(result.data);
        
        // Sauvegarder aussi en localStorage
        this.saveToLocalStorage(createdTestimonial);
        
        return createdTestimonial;
      } else {
        throw new Error(result.message || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création du témoignage:', error);
      
      // Fallback vers localStorage
      console.log('🔄 Sauvegarde en localStorage...');
      const newTestimonial: Testimonial = {
        ...testimonial,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.saveToLocalStorage(newTestimonial);
      return newTestimonial;
    }
  }

  // Mettre à jour un témoignage
  async updateTestimonial(id: string, testimonial: Partial<Testimonial>): Promise<Testimonial> {
    try {
      console.log(`🔄 Mise à jour du témoignage ${id}...`);
      
      const response = await fetch(`${API_BASE_URL_TESTIMONIALS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonial),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Témoignage mis à jour avec succès');
        const updatedTestimonial = this.transformApiTestimonial(result.data);
        
        // Mettre à jour aussi en localStorage
        this.updateInLocalStorage(updatedTestimonial);
        
        return updatedTestimonial;
      } else {
        throw new Error(result.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du témoignage:', error);
      
      // Fallback vers localStorage
      console.log('🔄 Mise à jour en localStorage...');
      const updatedTestimonial = { ...testimonial, id, updatedAt: new Date() } as Testimonial;
      this.updateInLocalStorage(updatedTestimonial);
      return updatedTestimonial;
    }
  }

  // Supprimer un témoignage
  async deleteTestimonial(id: string): Promise<boolean> {
    try {
      console.log(`🗑️ Suppression du témoignage ${id}...`);
      
      const response = await fetch(`${API_BASE_URL_TESTIMONIALS}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Témoignage supprimé avec succès');
        
        // Supprimer aussi de localStorage
        this.deleteFromLocalStorage(id);
        
        return true;
      } else {
        throw new Error(result.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du témoignage:', error);
      
      // Fallback vers localStorage
      console.log('🔄 Suppression en localStorage...');
      this.deleteFromLocalStorage(id);
      return true;
    }
  }

  // Basculer le statut de publication
  async togglePublishStatus(id: string): Promise<Testimonial> {
    try {
      console.log(`📢 Basculement du statut de publication pour ${id}...`);
      
      const response = await fetch(`${API_BASE_URL_TESTIMONIALS}/${id}/publish`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Statut changé: ${result.data.isPublished ? 'Publié' : 'Non publié'}`);
        const updatedTestimonial = this.transformApiTestimonial(result.data);
        
        // Mettre à jour aussi en localStorage
        this.updateInLocalStorage(updatedTestimonial);
        
        return updatedTestimonial;
      } else {
        throw new Error(result.message || 'Erreur lors du changement de statut');
      }
    } catch (error) {
      console.error('❌ Erreur lors du changement de statut:', error);
      throw error;
    }
  }

  // Récupérer les statistiques
  async getStatistics(): Promise<any> {
    try {
      console.log('📊 Récupération des statistiques...');
      
      const cacheKey = 'testimonials-stats';
      if (this.isCacheValid(cacheKey)) {
        return this.getCache(cacheKey);
      }

      const response = await fetch(`${API_BASE_URL_TESTIMONIALS}/stats/summary`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Statistiques récupérées');
        this.setCache(cacheKey, result.data);
        return result.data;
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération des statistiques');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      return {
        total: 0,
        published: 0,
        unpublished: 0,
        byLevel: {},
        byCategory: {},
        avgRating: 0
      };
    }
  }

  // Transformer les données de l'API au format frontend
  private transformApiTestimonial(apiTestimonial: any): Testimonial {
    return {
      id: apiTestimonial._id || apiTestimonial.id,
      name: apiTestimonial.name,
      position: apiTestimonial.position,
      skills: apiTestimonial.skills,
      category: apiTestimonial.category,
      level: apiTestimonial.level,
      progress: apiTestimonial.progress,
      content: apiTestimonial.content,
      badge: apiTestimonial.badge || '',
      isPublished: apiTestimonial.isPublished,
      rating: apiTestimonial.rating,
      createdAt: new Date(apiTestimonial.createdAt),
      updatedAt: new Date(apiTestimonial.updatedAt)
    };
  }

  // Méthodes localStorage (fallback)
  private getLocalStorageTestimonials(): Testimonial[] {
    try {
      const stored = localStorage.getItem('testimonials');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erreur localStorage:', error);
      return [];
    }
  }

  private saveToLocalStorage(testimonial: Testimonial): void {
    try {
      const testimonials = this.getLocalStorageTestimonials();
      testimonials.unshift(testimonial);
      localStorage.setItem('testimonials', JSON.stringify(testimonials));
      console.log('💾 Témoignage sauvegardé en localStorage');
    } catch (error) {
      console.error('Erreur sauvegarde localStorage:', error);
    }
  }

  private updateInLocalStorage(updatedTestimonial: Testimonial): void {
    try {
      const testimonials = this.getLocalStorageTestimonials();
      const index = testimonials.findIndex(t => t.id === updatedTestimonial.id);
      if (index !== -1) {
        testimonials[index] = updatedTestimonial;
        localStorage.setItem('testimonials', JSON.stringify(testimonials));
        console.log('💾 Témoignage mis à jour en localStorage');
      }
    } catch (error) {
      console.error('Erreur mise à jour localStorage:', error);
    }
  }

  private deleteFromLocalStorage(id: string): void {
    try {
      const testimonials = this.getLocalStorageTestimonials();
      const filtered = testimonials.filter(t => t.id !== id);
      localStorage.setItem('testimonials', JSON.stringify(filtered));
      console.log('💾 Témoignage supprimé de localStorage');
    } catch (error) {
      console.error('Erreur suppression localStorage:', error);
    }
  }
}

export const testimonialsApiService = TestimonialsApiService.getInstance();
