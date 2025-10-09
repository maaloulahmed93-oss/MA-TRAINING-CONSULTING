export interface Subscriber {
  _id: string;
  email: string;
  status: 'subscribed' | 'unsubscribed';
  subscribedAt?: string;
  unsubscribedAt?: string;
  source?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterStats {
  total: number;
  subscribed: number;
  unsubscribed: number;
  recentSubscriptions: number;
}

export interface NewsletterResponse {
  success: boolean;
  data: Subscriber[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats?: NewsletterStats;
  message?: string;
}

const API_BASE = 'http://localhost:3001/api/newsletter';

class NewsletterApiService {
  
  // Get all subscribers with filters
  async getSubscribers(params?: {
    status?: 'all' | 'subscribed' | 'unsubscribed';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<NewsletterResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.status && params.status !== 'all') {
        queryParams.append('status', params.status);
      }
      if (params?.search) {
        queryParams.append('search', params.search);
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      
      const url = queryParams.toString() ? `${API_BASE}?${queryParams}` : API_BASE;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      throw error;
    }
  }
  
  // Update subscriber status
  async updateSubscriberStatus(id: string, status: 'subscribed' | 'unsubscribed'): Promise<{ success: boolean; data?: Subscriber; message?: string }> {
    try {
      const response = await fetch(`${API_BASE}/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Error updating subscriber status:', error);
      throw error;
    }
  }
  
  // Delete subscriber
  async deleteSubscriber(id: string): Promise<{ success: boolean; data?: Subscriber; message?: string }> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      throw error;
    }
  }
  
  // Subscribe email (for admin use)
  async subscribeEmail(email: string): Promise<{ success: boolean; data?: Subscriber; message?: string }> {
    try {
      const response = await fetch(`${API_BASE}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Error subscribing email:', error);
      throw error;
    }
  }
  
  // Unsubscribe email (for admin use)
  async unsubscribeEmail(email: string): Promise<{ success: boolean; data?: Subscriber; message?: string }> {
    try {
      const response = await fetch(`${API_BASE}/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Error unsubscribing email:', error);
      throw error;
    }
  }
  
  // Get newsletter statistics
  async getStats(): Promise<{ success: boolean; data?: NewsletterStats; message?: string }> {
    try {
      const response = await fetch(`${API_BASE}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Error fetching newsletter stats:', error);
      throw error;
    }
  }
  
  // Check API health
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      return response.ok;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
}

export const newsletterApiService = new NewsletterApiService();
export default newsletterApiService;
