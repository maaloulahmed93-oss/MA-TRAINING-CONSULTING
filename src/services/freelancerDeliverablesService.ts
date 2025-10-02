// Service للتعامل مع API الـ Livrables للفريلانسرز
import { Deliverable } from '../types/freelancer';

const API_BASE_URL = 'http://localhost:3001/api';

// تحويل البيانات من Backend إلى Frontend format
const transformDeliverableFromAPI = (apiDeliverable: any): Deliverable => {
  return {
    id: apiDeliverable._id,
    title: apiDeliverable.title,
    projectId: apiDeliverable.projectId,
    type: apiDeliverable.type,
    status: mapDeliverableStatus(apiDeliverable.status),
    dueDate: apiDeliverable.dueDate.split('T')[0], // YYYY-MM-DD format
    submittedDate: apiDeliverable.submittedDate.split('T')[0],
    submittedAt: apiDeliverable.submittedDate,
    description: apiDeliverable.description,
    fileUrl: apiDeliverable.fileUrl || apiDeliverable.linkUrl || '',
    content: apiDeliverable.content || '',
    feedback: apiDeliverable.feedback || '',
    rating: apiDeliverable.rating || 0
  };
};

// تحويل حالة الـ Deliverable من Backend إلى Frontend
const mapDeliverableStatus = (backendStatus: string): Deliverable['status'] => {
  switch (backendStatus) {
    case 'pending':
      return 'pending';
    case 'approved':
      return 'approved';
    case 'revision_requested':
    case 'revision_needed':
      return 'revision_needed';
    case 'rejected':
      return 'rejected';
    default:
      return 'pending';
  }
};

// تحويل البيانات من Frontend إلى Backend format
const transformDeliverableToAPI = (deliverable: Partial<Deliverable>, freelancerId: string) => {
  return {
    title: deliverable.title,
    description: deliverable.description,
    freelancerId,
    projectId: deliverable.projectId,
    projectTitle: 'مشروع', // يمكن تحسينه لاحقاً
    type: deliverable.type,
    dueDate: deliverable.dueDate,
    linkUrl: deliverable.type === 'link' ? deliverable.fileUrl : '',
    content: deliverable.content || ''
  };
};

// دالة للحصول على معرف الفريلانسر الحالي
const getCurrentFreelancerId = (): string | null => {
  try {
    // البحث في localStorage عن session الفريلانسر
    const freelancerSession = localStorage.getItem('freelancer_session');
    if (freelancerSession) {
      const session = JSON.parse(freelancerSession);
      return session.freelancerId || null;
    }
    
    // fallback - البحث في authentication data
    const authData = localStorage.getItem('freelancer_auth');
    if (authData) {
      const auth = JSON.parse(authData);
      return auth.id || auth.freelancerId || null;
    }
    
    // fallback للاختبار
    return 'FRE-340255';
  } catch (error) {
    console.error('خطأ في الحصول على معرف الفريلانسر:', error);
    return 'FRE-340255'; // fallback للاختبار
  }
};

// جلب جميع الـ Livrables لفريلانسر معين
export const getFreelancerDeliverables = async (
  freelancerId: string,
  status?: string,
  projectId?: string
): Promise<Deliverable[]> => {
  try {
    let url = `${API_BASE_URL}/freelancer-deliverables/freelancer/${freelancerId}`;
    const params = new URLSearchParams();
    
    if (status && status !== 'all') {
      params.append('status', status);
    }
    
    if (projectId) {
      params.append('projectId', projectId);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && Array.isArray(data.data)) {
      console.log(`📦 تم جلب ${data.data.length} livrable للفريلانسر ${freelancerId} من API`);
      return data.data.map(transformDeliverableFromAPI);
    }

    return [];
  } catch (error) {
    console.error('خطأ في جلب الـ Livrables من API:', error);
    throw error;
  }
};

// إنشاء livrable جديد
export const createDeliverable = async (
  deliverableData: Partial<Deliverable>,
  file?: File
): Promise<Deliverable> => {
  try {
    const freelancerId = getCurrentFreelancerId();
    if (!freelancerId) {
      throw new Error('معرف الفريلانسر غير متوفر');
    }

    const formData = new FormData();
    
    // إضافة البيانات الأساسية
    const apiData = transformDeliverableToAPI(deliverableData, freelancerId);
    Object.entries(apiData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // إضافة الملف إذا كان موجوداً
    if (file) {
      formData.append('file', file);
    }

    const response = await fetch(`${API_BASE_URL}/freelancer-deliverables`, {
      method: 'POST',
      body: formData, // لا نضع Content-Type header مع FormData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log(`📦 تم إنشاء livrable جديد: ${data.data._id}`);
      return transformDeliverableFromAPI(data.data);
    }

    throw new Error(data.message || 'فشل في إنشاء الـ Livrable');
  } catch (error) {
    console.error('خطأ في إنشاء الـ Livrable:', error);
    throw error;
  }
};

// تحديث livrable موجود
export const updateDeliverable = async (
  deliverableId: string,
  deliverableData: Partial<Deliverable>,
  file?: File
): Promise<Deliverable> => {
  try {
    const freelancerId = getCurrentFreelancerId();
    if (!freelancerId) {
      throw new Error('معرف الفريلانسر غير متوفر');
    }

    const formData = new FormData();
    
    // إضافة البيانات الأساسية
    const apiData = transformDeliverableToAPI(deliverableData, freelancerId);
    Object.entries(apiData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // إضافة الملف إذا كان موجوداً
    if (file) {
      formData.append('file', file);
    }

    const response = await fetch(`${API_BASE_URL}/freelancer-deliverables/${deliverableId}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log(`📦 تم تحديث livrable: ${deliverableId}`);
      return transformDeliverableFromAPI(data.data);
    }

    throw new Error(data.message || 'فشل في تحديث الـ Livrable');
  } catch (error) {
    console.error('خطأ في تحديث الـ Livrable:', error);
    throw error;
  }
};

// حذف livrable
export const deleteDeliverable = async (deliverableId: string): Promise<void> => {
  try {
    const freelancerId = getCurrentFreelancerId();
    if (!freelancerId) {
      throw new Error('معرف الفريلانسر غير متوفر');
    }

    const response = await fetch(
      `${API_BASE_URL}/freelancer-deliverables/${deliverableId}?freelancerId=${freelancerId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log(`📦 تم حذف livrable: ${deliverableId}`);
    } else {
      throw new Error(data.message || 'فشل في حذف الـ Livrable');
    }
  } catch (error) {
    console.error('خطأ في حذف الـ Livrable:', error);
    throw error;
  }
};

// جلب إحصائيات الـ Livrables
export const getDeliverablesStats = async (freelancerId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/freelancer-deliverables/stats/${freelancerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }

    throw new Error(data.message || 'فشل في جلب الإحصائيات');
  } catch (error) {
    console.error('خطأ في جلب إحصائيات الـ Livrables:', error);
    throw error;
  }
};

// تحميل ملف livrable
export const downloadDeliverableFile = async (deliverableId: string): Promise<void> => {
  try {
    const freelancerId = getCurrentFreelancerId();
    if (!freelancerId) {
      throw new Error('معرف الفريلانسر غير متوفر');
    }

    const url = `${API_BASE_URL}/freelancer-deliverables/download/${deliverableId}?freelancerId=${freelancerId}`;
    
    // فتح رابط التحميل في نافذة جديدة
    window.open(url, '_blank');
    
    console.log(`📦 بدء تحميل ملف livrable: ${deliverableId}`);
  } catch (error) {
    console.error('خطأ في تحميل الملف:', error);
    throw error;
  }
};

// دالة مساعدة للتحقق من نوع الملف
export const isValidFileType = (file: File): boolean => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'text/csv'
  ];
  
  return allowedTypes.includes(file.type);
};

// دالة مساعدة لتنسيق حجم الملف
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// دالة للحصول على الـ Livrables مع fallback للبيانات المحلية
export const getDeliverablesWithFallback = async (
  freelancerId?: string,
  status?: string
): Promise<Deliverable[]> => {
  const currentFreelancerId = freelancerId || getCurrentFreelancerId();
  
  if (currentFreelancerId) {
    try {
      const apiDeliverables = await getFreelancerDeliverables(currentFreelancerId, status);
      if (apiDeliverables && apiDeliverables.length >= 0) {
        return apiDeliverables;
      }
    } catch (error) {
      console.error('فشل في جلب الـ Livrables من API، استخدام البيانات المحلية:', error);
    }
  }
  
  // fallback للبيانات المحلية
  const { getDeliverables } = await import('./freelancerData');
  return getDeliverables();
};
