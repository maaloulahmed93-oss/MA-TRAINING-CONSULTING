const API_BASE_URL = 'http://localhost:3001/api/partnerships';

export interface Partnership {
  _id?: string;
  partnershipId: string;
  type: 'formateur' | 'freelance' | 'commercial' | 'entreprise';
  title: string;
  subtitle: string;
  intro: string;
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow';
  gradient: string;
  details: string[];
  requirements: string[];
  ctaLabel: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

class PartnershipsApiService {
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error parsing response:', error);
      return {
        success: false,
        error: 'Error parsing server response'
      };
    }
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Get all partnerships
  async getAllPartnerships(): Promise<ApiResponse<Partnership[]>> {
    return this.makeRequest<Partnership[]>('');
  }

  // Get partnership by type
  async getPartnershipByType(type: string): Promise<ApiResponse<Partnership>> {
    return this.makeRequest<Partnership>(`/${type}`);
  }

  // Create new partnership
  async createPartnership(partnership: Omit<Partnership, '_id' | 'partnershipId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Partnership>> {
    return this.makeRequest<Partnership>('', {
      method: 'POST',
      body: JSON.stringify(partnership),
    });
  }

  // Update partnership
  async updatePartnership(type: string, partnership: Partial<Partnership>): Promise<ApiResponse<Partnership>> {
    return this.makeRequest<Partnership>(`/${type}`, {
      method: 'PUT',
      body: JSON.stringify(partnership),
    });
  }

  // Delete partnership
  async deletePartnership(type: string): Promise<ApiResponse<Partnership>> {
    return this.makeRequest<Partnership>(`/${type}`, {
      method: 'DELETE',
    });
  }

  // Seed default partnerships
  async seedDefaultPartnerships(): Promise<ApiResponse<Partnership[]>> {
    return this.makeRequest<Partnership[]>('/seed', {
      method: 'POST',
    });
  }

  // Test API connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.getAllPartnerships();
      if (response.success) {
        return { success: true, message: 'API connection successful' };
      } else {
        return { success: false, message: 'API connection failed' };
      }
    } catch (error) {
      return { success: false, message: `API connection error: ${error}` };
    }
  }
}

export const partnershipsApiService = new PartnershipsApiService();
