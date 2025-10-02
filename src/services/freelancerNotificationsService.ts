/**
 * خدمة إدارة الإشعارات للفريلانسرز
 * تتعامل مع الإشعارات المرسلة من Admin Panel
 */

export interface FreelancerNotification {
  id: string;
  freelancerId: string;
  freelancerName: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  deliverableName: string;
  decision: 'approved' | 'rejected';
  observation: string;
  timestamp: string;
  read: boolean;
  from: string;
}

/**
 * جلب الإشعارات للفريلانسر المحدد
 */
export const getFreelancerNotifications = (freelancerId: string): FreelancerNotification[] => {
  try {
    const notificationsKey = `freelancerNotifications_${freelancerId}`;
    const notifications = localStorage.getItem(notificationsKey);
    
    if (!notifications) {
      console.log(`📭 لا توجد إشعارات للفريلانسر ${freelancerId}`);
      return [];
    }
    
    const parsedNotifications = JSON.parse(notifications);
    console.log(`📬 تم جلب ${parsedNotifications.length} إشعار للفريلانسر ${freelancerId}`);
    
    return parsedNotifications;
  } catch (error) {
    console.error('خطأ في جلب الإشعارات:', error);
    return [];
  }
};

/**
 * تحديد الإشعار كمقروء
 */
export const markNotificationAsRead = (freelancerId: string, notificationId: string): void => {
  try {
    const notificationsKey = `freelancerNotifications_${freelancerId}`;
    const notifications = getFreelancerNotifications(freelancerId);
    
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    );
    
    localStorage.setItem(notificationsKey, JSON.stringify(updatedNotifications));
    console.log(`✅ تم تحديد الإشعار ${notificationId} كمقروء`);
  } catch (error) {
    console.error('خطأ في تحديث الإشعار:', error);
  }
};

/**
 * تحديد جميع الإشعارات كمقروءة
 */
export const markAllNotificationsAsRead = (freelancerId: string): void => {
  try {
    const notificationsKey = `freelancerNotifications_${freelancerId}`;
    const notifications = getFreelancerNotifications(freelancerId);
    
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    
    localStorage.setItem(notificationsKey, JSON.stringify(updatedNotifications));
    console.log(`✅ تم تحديد جميع الإشعارات كمقروءة للفريلانسر ${freelancerId}`);
  } catch (error) {
    console.error('خطأ في تحديث الإشعارات:', error);
  }
};

/**
 * حذف إشعار محدد
 */
export const deleteNotification = (freelancerId: string, notificationId: string): void => {
  try {
    const notificationsKey = `freelancerNotifications_${freelancerId}`;
    const notifications = getFreelancerNotifications(freelancerId);
    
    const updatedNotifications = notifications.filter(
      notification => notification.id !== notificationId
    );
    
    localStorage.setItem(notificationsKey, JSON.stringify(updatedNotifications));
    console.log(`🗑️ تم حذف الإشعار ${notificationId}`);
  } catch (error) {
    console.error('خطأ في حذف الإشعار:', error);
  }
};

/**
 * حذف جميع الإشعارات
 */
export const clearAllNotifications = (freelancerId: string): void => {
  try {
    const notificationsKey = `freelancerNotifications_${freelancerId}`;
    localStorage.removeItem(notificationsKey);
    console.log(`🗑️ تم حذف جميع الإشعارات للفريلانسر ${freelancerId}`);
  } catch (error) {
    console.error('خطأ في حذف الإشعارات:', error);
  }
};

/**
 * عدد الإشعارات غير المقروءة
 */
export const getUnreadNotificationsCount = (freelancerId: string): number => {
  try {
    const notifications = getFreelancerNotifications(freelancerId);
    const unreadCount = notifications.filter(notification => !notification.read).length;
    
    console.log(`📊 عدد الإشعارات غير المقروءة للفريلانسر ${freelancerId}: ${unreadCount}`);
    return unreadCount;
  } catch (error) {
    console.error('خطأ في حساب الإشعارات غير المقروءة:', error);
    return 0;
  }
};

/**
 * تنسيق تاريخ الإشعار
 */
export const formatNotificationDate = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    
    return date.toLocaleDateString('ar-SA');
  } catch (error) {
    console.error('خطأ في تنسيق التاريخ:', error);
    return 'تاريخ غير صحيح';
  }
};

/**
 * إنشاء إشعار تجريبي (للاختبار)
 */
export const createTestNotification = (freelancerId: string): void => {
  const testNotification: FreelancerNotification = {
    id: `test-${Date.now()}`,
    freelancerId,
    freelancerName: 'Test Freelancer',
    type: 'success',
    title: '✅ إشعار تجريبي',
    message: 'هذا إشعار تجريبي للاختبار',
    deliverableName: 'Test Deliverable',
    decision: 'approved',
    observation: 'تم القبول للاختبار',
    timestamp: new Date().toISOString(),
    read: false,
    from: 'admin'
  };
  
  const notificationsKey = `freelancerNotifications_${freelancerId}`;
  const notifications = getFreelancerNotifications(freelancerId);
  notifications.unshift(testNotification);
  
  localStorage.setItem(notificationsKey, JSON.stringify(notifications));
  console.log('🧪 تم إنشاء إشعار تجريبي:', testNotification);
};
