// API service for registrations
const API_BASE_URL = 'http://localhost:3001/api';

export interface RegistrationUser {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp?: string;
  phone?: string;
  message?: string;
}

export interface Registration {
  _id: string;
  type: 'program' | 'pack';
  itemId: string;
  itemName: string;
  price?: number;
  currency?: string;
  sessionId?: string;
  user: RegistrationUser;
  status: 'pending' | 'confirmed' | 'cancelled';
  adminNotes?: string;
  submittedAt: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  programs: number;
  packs: number;
}

export interface RegistrationFilters {
  type?: 'program' | 'pack';
  status?: 'pending' | 'confirmed' | 'cancelled';
  search?: string;
  page?: number;
  limit?: number;
}

export interface RegistrationResponse {
  success: boolean;
  data: Registration[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class RegistrationApiService {
  // Get all registrations with filters
  async getRegistrations(filters: RegistrationFilters = {}): Promise<RegistrationResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/registrations?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching registrations:', error);
      throw error;
    }
  }

  // Get single registration
  async getRegistration(id: string): Promise<{ success: boolean; data: Registration }> {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching registration:', error);
      throw error;
    }
  }

  // Update registration status
  async updateRegistration(
    id: string, 
    updates: { status?: string; adminNotes?: string }
  ): Promise<{ success: boolean; data: Registration }> {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating registration:', error);
      throw error;
    }
  }

  // Delete registration
  async deleteRegistration(id: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting registration:', error);
      throw error;
    }
  }

  // Get registration statistics
  async getRegistrationStats(): Promise<{ success: boolean; data: RegistrationStats }> {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations/stats/summary`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching registration stats:', error);
      throw error;
    }
  }

  // Create registration (for testing)
  async createRegistration(registrationData: Omit<Registration, '_id' | 'createdAt' | 'updatedAt' | 'submittedAt' | 'status'>): Promise<{ success: boolean; data: Registration }> {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating registration:', error);
      throw error;
    }
  }
}

export const registrationApiService = new RegistrationApiService();
export default registrationApiService;
