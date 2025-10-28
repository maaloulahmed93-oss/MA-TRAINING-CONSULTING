const API_BASE = 'https://matc-backend.onrender.com/api';

// Enhanced error handling for API responses
const handleApiResponse = async (response: Response) => {
  // Check if response is HTML instead of JSON (common issue)
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    console.warn('⚠️ Server returned non-JSON response, likely HTML error page');
    throw new Error('Server returned HTML instead of JSON - check endpoint URL');
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'API request failed');
  }

  return result;
};

export interface ApiParticipant {
  id: string;
  partnerId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  type: string;
  isActive: boolean;
  totalProgress: number;
  formations: any[];
  projects: any[];
  coachingResources: any[];
  notifications: any[];
  firstName?: string;
  lastName?: string;
  avatar?: string;
  status?: string;
  enrollmentDate?: string;
  lastActivity?: string;
}

export interface ApiFormation {
  _id: string;
  participantId: string;
  title: string;
  description: string;
  domain: string;
  level: string;
  duration: string;
  progress: number;
  status: string;
  enrollmentDate: string;
  thumbnail?: string;
  courses: any[];
}

export interface ApiCoachingResource {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  type: string;
  assignedDate: string;
  isCompleted: boolean;
  dataLinks: {
    id: string;
    title: string;
    url: string;
    type: string;
  }[];
}

export interface ApiProject {
  _id: string;
  participantId: string;
  title: string;
  description: string;
  formationId: string;
  formationTitle: string;
  status: string;
  submittedDate?: string;
  dueDate?: string;
  feedback?: string;
  grade?: number;
  projectUrl?: string;
  files: any[];
}

export interface ApiResource {
  _id: string;
  participantId: string;
  title: string;
  description: string;
  type: string;
  category: string;
  thumbnail?: string;
  downloadUrl?: string;
  duration?: string;
  assignedDate: string;
  isCompleted: boolean;
  dataLinks: any[];
}

export interface ApiNotification {
  _id: string;
  participantId: string;
  title: string;
  message: string;
  type: string;
  date: string;
  isRead: boolean;
  actionUrl?: string;
  // Legacy job notification fields
  company?: string;
  jobTitle?: string;
  salary?: string;
  contractType?: string;
  contact?: string;
  environment?: string;
  benefits?: string;
  // New notification type fields
  description?: string;
  link?: string;      // For "information" type - clickable link
  phone?: string;     // For "offre_emploi" type - phone number
  email?: string;     // For "offre_emploi" type - email address
  uploadLink?: string; // For legacy "info" type
  dataLinks: any[];
}

class ParticipantApiService {
  // Get participant details with enhanced error handling
  async getParticipant(participantId: string): Promise<ApiParticipant | null> {
    try {
      console.log(`🔄 جلب بيانات المشارك: ${participantId}`);
      
      const response = await fetch(`${API_BASE}/participants/${participantId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000) // 10 seconds timeout
      });

      const result = await handleApiResponse(response);
      
      console.log(`✅ تم جلب بيانات المشارك بنجاح: ${participantId}`);
      return result.data;
      
    } catch (error) {
      console.error('❌ خطأ في جلب بيانات المشارك:', error);
      
      // Return fallback data
      return this.getFallbackParticipant(participantId);
    }
  }

  // Get participant's formations
  async getFormations(participantId: string): Promise<ApiFormation[]> {
    try {
      const response = await fetch(`${API_BASE}/participants/${participantId}/formations`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          return result.data;
        }
      }
    } catch (error) {
      console.error('Error fetching formations:', error);
    }
    return [];
  }

  // Get participant's projects
  async getProjects(participantId: string): Promise<ApiProject[]> {
    try {
      const response = await fetch(`${API_BASE}/participants/${participantId}/projects`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          return result.data;
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
    return [];
  }

  // Get participant's coaching resources
  async getResources(participantId: string): Promise<ApiResource[]> {
    try {
      const response = await fetch(`${API_BASE}/participants/${participantId}/resources`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          return result.data;
        }
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
    return [];
  }

  // Get participant's notifications
  async getNotifications(participantId: string): Promise<ApiNotification[]> {
    try {
      const response = await fetch(`${API_BASE}/participants/${participantId}/notifications`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          return result.data;
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    return [];
  }

  // Create formation for participant
  async createFormation(participantId: string, formationData: any): Promise<ApiFormation | null> {
    try {
      const response = await fetch(`${API_BASE}/participants/${participantId}/formations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formationData)
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.data;
        }
      }
    } catch (error) {
      console.error('Error creating formation:', error);
    }
    return null;
  }

  // Create project for participant
  async createProject(participantId: string, projectData: any): Promise<ApiProject | null> {
    try {
      const response = await fetch(`${API_BASE}/participants/${participantId}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData)
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.data;
        }
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
    return null;
  }

  // Create resource for participant
  async createResource(participantId: string, resourceData: any): Promise<ApiResource | null> {
    try {
      const response = await fetch(`${API_BASE}/participants/${participantId}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourceData)
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.data;
        }
      }
    } catch (error) {
      console.error('Error creating resource:', error);
    }
    return null;
  }

  // Create notification for participant
  async createNotification(participantId: string, notificationData: any): Promise<ApiNotification | null> {
    try {
      const response = await fetch(`${API_BASE}/participants/${participantId}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.data;
        }
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
    return null;
  }

  // Get participant's coaching resources
  async getParticipantResources(participantId: string): Promise<ApiCoachingResource[]> {
    try {
      const response = await fetch(`${API_BASE}/participants/${participantId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data?.coachingResources || [];
    } catch (error) {
      console.error('Error fetching participant resources:', error);
      return [];
    }
  }

  // Update participant data
  async updateParticipant(participantId: string, updateData: Partial<ApiParticipant>): Promise<ApiParticipant | null> {
    try {
      const response = await fetch(`${API_BASE}/participants/${participantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.data;
        }
      }
    } catch (error) {
      console.error('Error updating participant:', error);
    }
    return null;
  }

  // Mark notification as read
  async markNotificationAsRead(participantId: string, notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/participants/${participantId}/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
        signal: AbortSignal.timeout(10000)
      });
      
      const result = await handleApiResponse(response);
      return result.success;
    } catch (error) {
      console.error('❌ خطأ في تحديد الإشعار كمقروء:', error);
      return false;
    }
  }

  // Fallback participant data when API fails
  private getFallbackParticipant(participantId: string): ApiParticipant {
    return {
      id: participantId,
      partnerId: participantId,
      fullName: 'مشارك تجريبي',
      email: 'participant@example.com',
      phone: '+216 00 000 000',
      address: 'تونس',
      type: 'participant',
      isActive: true,
      totalProgress: 0,
      formations: [],
      projects: [],
      coachingResources: [],
      notifications: [],
      firstName: 'مشارك',
      lastName: 'تجريبي',
      avatar: '',
      status: 'active',
      enrollmentDate: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) return false;

      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('❌ اختبار الاتصال فشل:', error);
      return false;
    }
  }
}

export const participantApiService = new ParticipantApiService();
