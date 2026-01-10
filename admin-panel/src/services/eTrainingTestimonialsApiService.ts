import { API_BASE_URL } from '../config/api';

const API_BASE_URL_ETRAINING_TESTIMONIALS = `${API_BASE_URL}/e-training-testimonials`;

export interface ETrainingTestimonial {
  _id?: string;
  quote: string;
  author: string;
  initials: string;
  role?: string;
  domain?: string;
  isPublished: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

class ETrainingTestimonialsApiService {
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAllTestimonials(filters?: { status?: string; search?: string }): Promise<ETrainingTestimonial[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const url = `${API_BASE_URL_ETRAINING_TESTIMONIALS}${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<ETrainingTestimonial[]> = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch testimonials');
    }

    return result.data;
  }

  async createTestimonial(data: Omit<ETrainingTestimonial, '_id' | 'createdAt' | 'updatedAt'>): Promise<ETrainingTestimonial> {
    const response = await fetch(API_BASE_URL_ETRAINING_TESTIMONIALS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<ETrainingTestimonial> = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to create testimonial');
    }

    return result.data;
  }

  async updateTestimonial(id: string, data: Partial<ETrainingTestimonial>): Promise<ETrainingTestimonial> {
    const response = await fetch(`${API_BASE_URL_ETRAINING_TESTIMONIALS}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<ETrainingTestimonial> = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to update testimonial');
    }

    return result.data;
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL_ETRAINING_TESTIMONIALS}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<null> = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete testimonial');
    }

    return true;
  }

  async togglePublishStatus(id: string): Promise<ETrainingTestimonial> {
    const response = await fetch(`${API_BASE_URL_ETRAINING_TESTIMONIALS}/${id}/publish`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<ETrainingTestimonial> = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to toggle publish status');
    }

    return result.data;
  }

  async getStats(): Promise<{ total: number; published: number; unpublished: number }> {
    const response = await fetch(`${API_BASE_URL_ETRAINING_TESTIMONIALS}/stats/summary`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<{ total: number; published: number; unpublished: number }> = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch stats');
    }

    return result.data;
  }
}

export const eTrainingTestimonialsApiService = new ETrainingTestimonialsApiService();
