const API_BASE = 'http://localhost:3001/api';

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
  // Get participant details
  async getParticipant(participantId: string): Promise<ApiParticipant | null> {
    try {
      const response = await fetch(`${API_BASE}/participants/${participantId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.data;
        }
      }
    } catch (error) {
      console.error('Error fetching participant:', error);
    }
    return null;
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
      // For now, we'll implement this as a simple update
      // In a real implementation, you'd have a specific endpoint for this
      const response = await fetch(`${API_BASE}/participants/${participantId}/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }
}

export const participantApiService = new ParticipantApiService();
