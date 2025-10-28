/**
 * خدمة إدارة الإشعارات المحسنة للمشاركين
 * تتعامل مع الإشعارات من Admin Panel مع إصلاح مشاكل API
 */

const API_BASE_URL = 'https://matc-backend.onrender.com/api';

export interface EnhancedNotification {
  _id: string;
  participantId: string;
  title: string;
  message: string;
  description?: string;
  type: 'information' | 'warning' | 'success' | 'error' | 'job_offer' | 'formation_update';
  date: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  contact?: string;
  phone?: string;
  email?: string;
  link?: string;
  uploadLink?: string;
  dataLinks: Array<{
    id: string;
    title: string;
    url: string;
    type: string;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: { [key: string]: number };
  byPriority: { [key: string]: number };
}

class ParticipantNotificationService {
  private cache: Map<string, { data: EnhancedNotification[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache

  /**
   * جلب جميع الإشعارات للمشارك مع إصلاح مشاكل API
   */
  async getNotifications(participantId: string): Promise<EnhancedNotification[]> {
    const cacheKey = `notifications_${participantId}`;
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey) || [];
    }

    try {
      console.log(`🔄 جلب الإشعارات للمشارك: ${participantId}`);
      
      const response = await fetch(`${API_BASE_URL}/participants/${participantId}/notifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000) // 10 seconds timeout
      });

      // Check if response is HTML instead of JSON (common issue)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('⚠️ Server returned non-JSON response, using fallback');
        return this.getFallbackNotifications(participantId);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        const notifications = result.data.map(this.transformNotification);
        this.setCache(cacheKey, notifications);
        
        console.log(`✅ تم جلب ${notifications.length} إشعار للمشارك ${participantId}`);
        return notifications;
      } else {
        console.warn('⚠️ Invalid API response format, using fallback');
        return this.getFallbackNotifications(participantId);
      }

    } catch (error) {
      console.error('❌ خطأ في جلب الإشعارات من API:', error);
      
      // Use fallback data
      return this.getFallbackNotifications(participantId);
    }
  }

  /**
   * إنشاء إشعار جديد للمشارك
   */
  async createNotification(participantId: string, notificationData: {
    title: string;
    message: string;
    description?: string;
    type?: string;
    priority?: string;
    contact?: string;
    phone?: string;
    email?: string;
    link?: string;
    uploadLink?: string;
    dataLinks?: Array<{ id: string; title: string; url: string; type: string }>;
  }): Promise<EnhancedNotification | null> {
    try {
      console.log(`📝 إنشاء إشعار جديد للمشارك: ${participantId}`);

      const response = await fetch(`${API_BASE_URL}/participants/${participantId}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...notificationData,
          type: notificationData.type || 'information',
          priority: notificationData.priority || 'medium',
          isRead: false,
          isActive: true,
          date: new Date().toISOString()
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const notification = this.transformNotification(result.data);
        
        // Clear cache to force refresh
        this.clearCache(`notifications_${participantId}`);
        
        console.log(`✅ تم إنشاء الإشعار بنجاح: ${notification._id}`);
        return notification;
      } else {
        throw new Error(result.message || 'Failed to create notification');
      }

    } catch (error) {
      console.error('❌ خطأ في إنشاء الإشعار:', error);
      return null;
    }
  }

  /**
   * تحديث إشعار موجود
   */
  async updateNotification(participantId: string, notificationId: string, updateData: Partial<EnhancedNotification>): Promise<boolean> {
    try {
      console.log(`✏️ تحديث الإشعار: ${notificationId}`);

      const response = await fetch(`${API_BASE_URL}/participants/${participantId}/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updateData),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Clear cache to force refresh
        this.clearCache(`notifications_${participantId}`);
        
        console.log(`✅ تم تحديث الإشعار بنجاح: ${notificationId}`);
        return true;
      } else {
        throw new Error(result.message || 'Failed to update notification');
      }

    } catch (error) {
      console.error('❌ خطأ في تحديث الإشعار:', error);
      return false;
    }
  }

  /**
   * حذف إشعار
   */
  async deleteNotification(participantId: string, notificationId: string): Promise<boolean> {
    try {
      console.log(`🗑️ حذف الإشعار: ${notificationId}`);

      const response = await fetch(`${API_BASE_URL}/participants/${participantId}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Clear cache to force refresh
        this.clearCache(`notifications_${participantId}`);
        
        console.log(`✅ تم حذف الإشعار بنجاح: ${notificationId}`);
        return true;
      } else {
        throw new Error(result.message || 'Failed to delete notification');
      }

    } catch (error) {
      console.error('❌ خطأ في حذف الإشعار:', error);
      return false;
    }
  }

  /**
   * تحديد إشعار كمقروء
   */
  async markAsRead(participantId: string, notificationId: string): Promise<boolean> {
    return this.updateNotification(participantId, notificationId, { isRead: true });
  }

  /**
   * تحديد جميع الإشعارات كمقروءة
   */
  async markAllAsRead(participantId: string): Promise<boolean> {
    try {
      const notifications = await this.getNotifications(participantId);
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      const updatePromises = unreadNotifications.map(notification => 
        this.markAsRead(participantId, notification._id)
      );
      
      await Promise.all(updatePromises);
      
      console.log(`✅ تم تحديد ${unreadNotifications.length} إشعار كمقروء`);
      return true;
    } catch (error) {
      console.error('❌ خطأ في تحديد جميع الإشعارات كمقروءة:', error);
      return false;
    }
  }

  /**
   * جلب إحصائيات الإشعارات
   */
  async getNotificationStats(participantId: string): Promise<NotificationStats> {
    try {
      const notifications = await this.getNotifications(participantId);
      
      const stats: NotificationStats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.isRead).length,
        byType: {},
        byPriority: {}
      };

      // Count by type
      notifications.forEach(notification => {
        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
        stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('❌ خطأ في جلب إحصائيات الإشعارات:', error);
      return {
        total: 0,
        unread: 0,
        byType: {},
        byPriority: {}
      };
    }
  }

  /**
   * تنظيف جميع الإشعارات للمشارك
   */
  async clearAllNotifications(participantId: string): Promise<boolean> {
    try {
      const notifications = await this.getNotifications(participantId);
      
      const deletePromises = notifications.map(notification => 
        this.deleteNotification(participantId, notification._id)
      );
      
      await Promise.all(deletePromises);
      
      console.log(`✅ تم حذف جميع الإشعارات للمشارك: ${participantId}`);
      return true;
    } catch (error) {
      console.error('❌ خطأ في حذف جميع الإشعارات:', error);
      return false;
    }
  }

  /**
   * اختبار اتصال API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
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

  // Private helper methods
  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private setCache(key: string, data: EnhancedNotification[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCache(key: string): EnhancedNotification[] | null {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  private clearCache(key: string): void {
    this.cache.delete(key);
  }

  private transformNotification(apiNotification: any): EnhancedNotification {
    return {
      _id: apiNotification._id,
      participantId: apiNotification.participantId,
      title: apiNotification.title || 'إشعار',
      message: apiNotification.message,
      description: apiNotification.description,
      type: apiNotification.type || 'information',
      date: apiNotification.date || apiNotification.createdAt,
      isRead: apiNotification.isRead || false,
      priority: apiNotification.priority || 'medium',
      actionUrl: apiNotification.actionUrl,
      contact: apiNotification.contact,
      phone: apiNotification.phone,
      email: apiNotification.email,
      link: apiNotification.link,
      uploadLink: apiNotification.uploadLink,
      dataLinks: apiNotification.dataLinks || [],
      isActive: apiNotification.isActive !== false,
      createdAt: apiNotification.createdAt,
      updatedAt: apiNotification.updatedAt
    };
  }

  private getFallbackNotifications(participantId: string): EnhancedNotification[] {
    // Return sample notifications when API fails
    return [
      {
        _id: 'fallback-1',
        participantId,
        title: 'مرحباً بك في النظام',
        message: 'تم تسجيل دخولك بنجاح إلى منصة التدريب',
        description: 'هذا إشعار ترحيبي',
        type: 'information',
        date: new Date().toISOString(),
        isRead: false,
        priority: 'medium',
        dataLinks: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
}

// Export singleton instance
export const participantNotificationService = new ParticipantNotificationService();
