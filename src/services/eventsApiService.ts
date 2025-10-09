/**
 * Events API Service for Main Website
 * Handles fetching published events from backend
 */

const API_BASE = 'http://localhost:3001/api/events';

export interface ApiEvent {
  _id: string;
  eventId: string;
  title: string;
  description?: string;
  category: 'formation' | 'webinaire' | 'conference' | 'team-building' | 'voyage';
  date: string;
  format: {
    type: 'Présentiel' | 'En ligne' | 'Hybride' | 'Voyage';
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
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventForWebsite {
  id: string;
  date: string;
  title: string;
  format: string;
  duration: string;
  icon: any; // Will be set based on category
  color: 'blue' | 'purple' | 'green' | 'orange';
  type: 'webinaire' | 'formation' | 'team-building' | 'conference';
  description?: string;
  location?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  price?: number;
  isUpcoming: boolean;
  registrationOpen: boolean;
  url?: string; // رابط الحدث للعين
}

class EventsApiService {
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON response, got ${contentType}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data.data || data;
  }

  // جلب الأحداث المنشورة للموقع الرئيسي
  async getPublishedEvents(): Promise<EventForWebsite[]> {
    try {
      console.log('🔄 Fetching published events for website...');
      
      const response = await fetch(`${API_BASE}/published`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const apiEvents: ApiEvent[] = await this.handleResponse(response);
      
      // تحويل البيانات من API format إلى Website format
      const websiteEvents = apiEvents.map(apiEvent => this.transformToWebsiteFormat(apiEvent));
      
      console.log(`✅ Published events loaded for website: ${websiteEvents.length} events`);
      return websiteEvents;
      
    } catch (error) {
      console.error('❌ Error fetching published events:', error);
      throw error;
    }
  }

  // جلب الأحداث القادمة فقط
  async getUpcomingEvents(): Promise<EventForWebsite[]> {
    try {
      console.log('🔄 Fetching upcoming events...');
      
      const response = await fetch(`${API_BASE}/upcoming`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const apiEvents: ApiEvent[] = await this.handleResponse(response);
      
      // تحويل البيانات من API format إلى Website format
      const websiteEvents = apiEvents.map(apiEvent => this.transformToWebsiteFormat(apiEvent));
      
      console.log(`✅ Upcoming events loaded: ${websiteEvents.length} events`);
      return websiteEvents;
      
    } catch (error) {
      console.error('❌ Error fetching upcoming events:', error);
      throw error;
    }
  }

  // تسجيل في حدث
  async registerForEvent(eventId: string, registrationData: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  }): Promise<{
    success: boolean;
    message: string;
    eventTitle?: string;
  }> {
    try {
      console.log(`🔄 Registering for event: ${eventId}`);
      
      const response = await fetch(`${API_BASE}/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });
      
      const result = await this.handleResponse<{
        eventTitle: string;
        participantName: string;
        registrationDate: string;
      }>(response);
      
      console.log(`✅ Registration successful for: ${result.eventTitle}`);
      
      return {
        success: true,
        message: 'تم التسجيل بنجاح!',
        eventTitle: result.eventTitle
      };
      
    } catch (error) {
      console.error('❌ Error registering for event:', error);
      
      let message = 'حدث خطأ أثناء التسجيل';
      
      if (error instanceof Error) {
        if (error.message.includes('Event is full')) {
          message = 'الحدث مكتمل العدد';
        } else if (error.message.includes('Already registered')) {
          message = 'أنت مسجل بالفعل في هذا الحدث';
        } else if (error.message.includes('Registration is closed')) {
          message = 'التسجيل مغلق لهذا الحدث';
        }
      }
      
      return {
        success: false,
        message
      };
    }
  }

  // تحويل البيانات من API format إلى Website format
  private transformToWebsiteFormat(apiEvent: ApiEvent): EventForWebsite {
    // تحديد الأيقونة والألوان حسب الفئة
    const getCategoryConfig = (category: string) => {
      switch (category) {
        case 'formation':
          return { 
            color: 'blue' as const, 
            icon: 'MapPin', // سيتم استبداله بالأيقونة الفعلية
            type: 'formation' as const 
          };
        case 'webinaire':
          return { 
            color: 'purple' as const, 
            icon: 'Video',
            type: 'webinaire' as const 
          };
        case 'conference':
          return { 
            color: 'orange' as const, 
            icon: 'CalendarIcon',
            type: 'conference' as const 
          };
        case 'team-building':
          return { 
            color: 'green' as const, 
            icon: 'Users',
            type: 'team-building' as const 
          };
        default:
          return { 
            color: 'blue' as const, 
            icon: 'MapPin',
            type: 'formation' as const 
          };
      }
    };

    const config = getCategoryConfig(apiEvent.category);
    const eventDate = new Date(apiEvent.date);
    const now = new Date();
    
    // تنسيق التاريخ
    const formatDate = (date: Date): string => {
      const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ];
      
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day} ${month} ${year}`;
    };

    // تنسيق الفورمات
    const formatEventFormat = (format: ApiEvent['format']): string => {
      if (format.details) {
        return `${format.type} – ${format.details}`;
      }
      return format.type;
    };

    return {
      id: apiEvent._id,
      date: formatDate(eventDate),
      title: apiEvent.title,
      format: formatEventFormat(apiEvent.format),
      duration: apiEvent.duration,
      icon: config.icon, // سيتم تعيين الأيقونة الفعلية في المكون
      color: config.color,
      type: config.type,
      description: apiEvent.description,
      location: apiEvent.location,
      maxParticipants: apiEvent.places.total,
      currentParticipants: apiEvent.places.registered,
      price: apiEvent.price || 0,
      isUpcoming: eventDate > now,
      registrationOpen: apiEvent.isPublished && 
                       eventDate > now && 
                       apiEvent.places.registered < apiEvent.places.total,
      url: apiEvent.url // رابط الحدث للعين
    };
  }

  // دالة للحصول على الأيقونة الفعلية (ستستخدم في المكون)
  getIconComponent(iconName: string) {
    // سيتم استيراد الأيقونات في المكون المستخدم
    const iconMap: { [key: string]: string } = {
      'MapPin': 'MapPin',
      'Video': 'Video', 
      'Users': 'Users',
      'CalendarIcon': 'Calendar'
    };
    
    return iconMap[iconName] || 'MapPin';
  }
}

// إنشاء instance واحد للاستخدام
export const eventsApiService = new EventsApiService();

// تصدير الكلاس أيضاً للاستخدام المتقدم
export default EventsApiService;
