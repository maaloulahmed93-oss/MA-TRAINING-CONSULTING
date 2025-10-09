/**
 * Events API Service for Admin Panel
 * Handles all API calls related to events management
 */

const API_BASE = 'http://localhost:3001/api/events';

export interface EventFormData {
  title: string;
  description?: string;
  category: 'formation' | 'webinaire' | 'conference' | 'team-building' | 'voyage';
  date: Date;
  format: {
    type: 'Présentiel' | 'En ligne' | 'Hybride' | 'Voyage';
    details?: string;
  };
  duration: string;
  price?: number;
  places: {
    total: number;
    registered?: number;
  };
  isPublished: boolean;
  url?: string;
  location?: string;
}

export interface EventResponse {
  _id: string;
  eventId: string;
  title: string;
  description?: string;
  category: string;
  date: string;
  format: {
    type: string;
    details?: string;
  };
  duration: string;
  price?: number;
  places: {
    total: number;
    registered: number;
  };
  isPublished: boolean;
  url?: string;
  location?: string;
  registrations: Array<{
    name: string;
    email: string;
    phone?: string;
    company?: string;
    registrationDate: string;
    status: string;
  }>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  count?: number;
}

class EventsApiService {
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON response, got ${contentType}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  }

  // جلب جميع الأحداث
  async getEvents(filters?: {
    category?: string;
    published?: boolean;
    upcoming?: boolean;
  }): Promise<EventResponse[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.published !== undefined) params.append('published', filters.published.toString());
      if (filters?.upcoming !== undefined) params.append('upcoming', filters.upcoming.toString());
      
      const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
      
      console.log('🔄 Fetching events from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await this.handleResponse<EventResponse[]>(response);
      
      console.log(`✅ Events fetched successfully: ${result.data.length} events`);
      return result.data;
      
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      throw error;
    }
  }

  // جلب الأحداث المنشورة فقط
  async getPublishedEvents(): Promise<EventResponse[]> {
    try {
      console.log('🔄 Fetching published events...');
      
      const response = await fetch(`${API_BASE}/published`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await this.handleResponse<EventResponse[]>(response);
      
      console.log(`✅ Published events fetched: ${result.data.length} events`);
      return result.data;
      
    } catch (error) {
      console.error('❌ Error fetching published events:', error);
      throw error;
    }
  }

  // جلب حدث محدد
  async getEvent(id: string): Promise<EventResponse> {
    try {
      console.log(`🔄 Fetching event: ${id}`);
      
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await this.handleResponse<EventResponse>(response);
      
      console.log(`✅ Event fetched: ${result.data.title}`);
      return result.data;
      
    } catch (error) {
      console.error('❌ Error fetching event:', error);
      throw error;
    }
  }

  // إنشاء حدث جديد
  async createEvent(eventData: EventFormData): Promise<EventResponse> {
    try {
      console.log('🔄 Creating new event:', eventData.title);
      
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      const result = await this.handleResponse<EventResponse>(response);
      
      console.log(`✅ Event created successfully: ${result.data.title} (ID: ${result.data.eventId})`);
      return result.data;
      
    } catch (error) {
      console.error('❌ Error creating event:', error);
      throw error;
    }
  }

  // تحديث حدث
  async updateEvent(id: string, eventData: Partial<EventFormData>): Promise<EventResponse> {
    try {
      console.log(`🔄 Updating event: ${id}`);
      
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      const result = await this.handleResponse<EventResponse>(response);
      
      console.log(`✅ Event updated successfully: ${result.data.title}`);
      return result.data;
      
    } catch (error) {
      console.error('❌ Error updating event:', error);
      throw error;
    }
  }

  // حذف حدث
  async deleteEvent(id: string): Promise<void> {
    try {
      console.log(`🔄 Deleting event: ${id}`);
      
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      await this.handleResponse<void>(response);
      
      console.log(`✅ Event deleted successfully`);
      
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      throw error;
    }
  }

  // جلب قائمة المسجلين في حدث
  async getEventRegistrations(id: string): Promise<{
    eventTitle: string;
    registrations: Array<{
      name: string;
      email: string;
      phone?: string;
      company?: string;
      registrationDate: string;
      status: string;
    }>;
    totalRegistrations: number;
    availableSpaces: number;
  }> {
    try {
      console.log(`🔄 Fetching registrations for event: ${id}`);
      
      const response = await fetch(`${API_BASE}/${id}/registrations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await this.handleResponse<{
        eventTitle: string;
        registrations: any[];
        totalRegistrations: number;
        availableSpaces: number;
      }>(response);
      
      console.log(`✅ Registrations fetched: ${result.data.totalRegistrations} registrations`);
      return result.data;
      
    } catch (error) {
      console.error('❌ Error fetching registrations:', error);
      throw error;
    }
  }

  // إحصائيات الأحداث
  async getEventsStats(): Promise<{
    totalEvents: number;
    publishedEvents: number;
    upcomingEvents: number;
    totalRegistrations: number;
  }> {
    try {
      console.log('🔄 Fetching events statistics...');
      
      const response = await fetch(`${API_BASE}/stats/summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await this.handleResponse<{
        totalEvents: number;
        publishedEvents: number;
        upcomingEvents: number;
        totalRegistrations: number;
      }>(response);
      
      console.log('✅ Events statistics fetched');
      return result.data;
      
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      throw error;
    }
  }

  // تحويل البيانات من Admin Panel إلى API format
  transformToApiFormat(formData: any): EventFormData {
    return {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      date: new Date(formData.date),
      format: {
        type: formData.format?.type || 'Présentiel',
        details: formData.format?.details || ''
      },
      duration: formData.duration,
      price: formData.price || 0,
      places: {
        total: formData.places?.total || 10,
        registered: formData.places?.registered || 0
      },
      isPublished: formData.isPublished || false,
      url: formData.url,
      location: formData.location
    };
  }

  // تحويل البيانات من API إلى Admin Panel format
  transformFromApiFormat(apiData: EventResponse): any {
    return {
      _id: apiData._id,
      title: apiData.title,
      description: apiData.description,
      category: apiData.category,
      date: new Date(apiData.date),
      format: apiData.format,
      duration: apiData.duration,
      price: apiData.price,
      places: apiData.places,
      isPublished: apiData.isPublished,
      url: apiData.url,
      location: apiData.location,
      createdAt: new Date(apiData.createdAt),
      updatedAt: new Date(apiData.updatedAt)
    };
  }
}

// إنشاء instance واحد للاستخدام
export const eventsApiService = new EventsApiService();

// تصدير الكلاس أيضاً للاستخدام المتقدم
export default EventsApiService;
