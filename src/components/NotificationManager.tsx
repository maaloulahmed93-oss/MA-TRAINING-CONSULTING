import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  Trash2, 
  Eye, 
  EyeOff, 
  Filter,
  Search,
  RefreshCw,
  Plus,
  Edit,
  Save,
  X
} from 'lucide-react';
import { 
  participantNotificationService, 
  EnhancedNotification, 
  NotificationStats 
} from '../services/participantNotificationService';

interface NotificationManagerProps {
  participantId: string;
  onNotificationUpdate?: (stats: NotificationStats) => void;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ 
  participantId, 
  onNotificationUpdate 
}) => {
  const [notifications, setNotifications] = useState<EnhancedNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byType: {},
    byPriority: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<EnhancedNotification | null>(null);
  const [apiConnected, setApiConnected] = useState(false);

  // Form state for creating/editing notifications
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    description: '',
    type: 'information',
    priority: 'medium',
    contact: '',
    phone: '',
    email: '',
    link: '',
    uploadLink: ''
  });

  useEffect(() => {
    loadNotifications();
    testConnection();
  }, [participantId]);

  const testConnection = async () => {
    const connected = await participantNotificationService.testConnection();
    setApiConnected(connected);
    console.log(`🔗 API Connection Status: ${connected ? 'Connected' : 'Disconnected'}`);
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [notificationsData, statsData] = await Promise.all([
        participantNotificationService.getNotifications(participantId),
        participantNotificationService.getNotificationStats(participantId)
      ]);
      
      setNotifications(notificationsData);
      setStats(statsData);
      
      if (onNotificationUpdate) {
        onNotificationUpdate(statsData);
      }
      
      console.log(`✅ تم تحميل ${notificationsData.length} إشعار للمشارك: ${participantId}`);
    } catch (error) {
      console.error('❌ خطأ في تحميل الإشعارات:', error);
      setError('فشل في تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async () => {
    try {
      const newNotification = await participantNotificationService.createNotification(
        participantId, 
        formData
      );
      
      if (newNotification) {
        setNotifications(prev => [newNotification, ...prev]);
        await loadNotifications(); // Refresh stats
        setShowCreateModal(false);
        resetForm();
        console.log('✅ تم إنشاء الإشعار بنجاح');
      }
    } catch (error) {
      console.error('❌ خطأ في إنشاء الإشعار:', error);
    }
  };

  const handleUpdateNotification = async () => {
    if (!editingNotification) return;
    
    try {
      const success = await participantNotificationService.updateNotification(
        participantId,
        editingNotification._id,
        formData
      );
      
      if (success) {
        await loadNotifications();
        setEditingNotification(null);
        resetForm();
        console.log('✅ تم تحديث الإشعار بنجاح');
      }
    } catch (error) {
      console.error('❌ خطأ في تحديث الإشعار:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإشعار؟')) return;
    
    try {
      const success = await participantNotificationService.deleteNotification(
        participantId,
        notificationId
      );
      
      if (success) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        await loadNotifications(); // Refresh stats
        console.log('✅ تم حذف الإشعار بنجاح');
      }
    } catch (error) {
      console.error('❌ خطأ في حذف الإشعار:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const success = await participantNotificationService.markAsRead(
        participantId,
        notificationId
      );
      
      if (success) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
        await loadNotifications(); // Refresh stats
        console.log('✅ تم تحديد الإشعار كمقروء');
      }
    } catch (error) {
      console.error('❌ خطأ في تحديد الإشعار كمقروء:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const success = await participantNotificationService.markAllAsRead(participantId);
      
      if (success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true }))
        );
        await loadNotifications(); // Refresh stats
        console.log('✅ تم تحديد جميع الإشعارات كمقروءة');
      }
    } catch (error) {
      console.error('❌ خطأ في تحديد جميع الإشعارات كمقروءة:', error);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) return;
    
    try {
      const success = await participantNotificationService.clearAllNotifications(participantId);
      
      if (success) {
        setNotifications([]);
        await loadNotifications(); // Refresh stats
        console.log('✅ تم حذف جميع الإشعارات');
      }
    } catch (error) {
      console.error('❌ خطأ في حذف جميع الإشعارات:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      description: '',
      type: 'information',
      priority: 'medium',
      contact: '',
      phone: '',
      email: '',
      link: '',
      uploadLink: ''
    });
  };

  const openEditModal = (notification: EnhancedNotification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      description: notification.description || '',
      type: notification.type,
      priority: notification.priority,
      contact: notification.contact || '',
      phone: notification.phone || '',
      email: notification.email || '',
      link: notification.link || '',
      uploadLink: notification.uploadLink || ''
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">جاري تحميل الإشعارات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bell className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">إدارة الإشعارات</h2>
            <div className={`ml-3 px-2 py-1 rounded-full text-xs ${
              apiConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {apiConnected ? 'متصل' : 'غير متصل'}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={testConnection}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              اختبار الاتصال
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              إضافة إشعار
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">إجمالي الإشعارات</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
            <div className="text-sm text-gray-600">غير مقروءة</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.total - stats.unread}</div>
            <div className="text-sm text-gray-600">مقروءة</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(stats.byType).length}
            </div>
            <div className="text-sm text-gray-600">أنواع مختلفة</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="البحث في الإشعارات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center">
            <Filter className="w-4 h-4 text-gray-400 mr-2" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">جميع الأنواع</option>
              <option value="information">معلومات</option>
              <option value="warning">تحذير</option>
              <option value="success">نجاح</option>
              <option value="error">خطأ</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">جميع الأولويات</option>
              <option value="high">عالي</option>
              <option value="medium">متوسط</option>
              <option value="low">منخفض</option>
            </select>
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center"
            >
              <Eye className="w-4 h-4 mr-1" />
              تحديد الكل كمقروء
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              حذف الكل
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-lg shadow-sm border p-4 ${
                !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{notification.message}</p>
                    {notification.description && (
                      <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
                    )}
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{new Date(notification.date).toLocaleDateString('ar-SA')}</span>
                      {notification.contact && (
                        <span className="mx-2">•</span>
                      )}
                      {notification.contact && (
                        <span>جهة الاتصال: {notification.contact}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="تحديد كمقروء"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(notification)}
                    className="p-2 text-gray-400 hover:text-yellow-600"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNotification(notification._id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              لا توجد إشعارات
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' || filterPriority !== 'all'
                ? 'لم يتم العثور على إشعارات تطابق الفلاتر المحددة'
                : 'لم يتم إنشاء أي إشعارات بعد'
              }
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingNotification) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                {editingNotification ? 'تعديل الإشعار' : 'إضافة إشعار جديد'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingNotification(null);
                  resetForm();
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  العنوان *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="عنوان الإشعار"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الرسالة *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="نص الرسالة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="وصف إضافي (اختياري)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع الإشعار
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="information">معلومات</option>
                    <option value="warning">تحذير</option>
                    <option value="success">نجاح</option>
                    <option value="error">خطأ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الأولوية
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="low">منخفض</option>
                    <option value="medium">متوسط</option>
                    <option value="high">عالي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  جهة الاتصال
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="مثال: أحمد بن علي"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+216 00 000 000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رابط إضافي
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={editingNotification ? handleUpdateNotification : handleCreateNotification}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                disabled={!formData.title || !formData.message}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingNotification ? 'حفظ التعديلات' : 'إنشاء الإشعار'}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingNotification(null);
                  resetForm();
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default NotificationManager;
