// Service للتعامل مع API الاجتماعات للفريلانسرز
import { Meeting } from '../types/freelancer';

const API_BASE_URL = 'http://localhost:3001/api';

// تحويل البيانات من Backend إلى Frontend format
const transformMeetingFromAPI = (apiMeeting: any): Meeting => {
  return {
    id: apiMeeting._id,
    title: apiMeeting.subject,
    client: apiMeeting.withWhom || 'Client',
    date: apiMeeting.date,
    time: apiMeeting.startTime,
    duration: apiMeeting.durationMinutes || calculateDuration(apiMeeting.startTime, apiMeeting.endTime),
    type: mapMeetingType(apiMeeting.type),
    status: apiMeeting.status,
    meetingLink: apiMeeting.meetingLink || '',
    platform: detectPlatform(apiMeeting.meetingLink),
    participants: [], // سيتم ملؤها لاحقاً
    agenda: Array.isArray(apiMeeting.agenda) ? apiMeeting.agenda.join(', ') : '',
    notes: getFreelancerNotes(apiMeeting.freelancerResponses, getCurrentFreelancerId() || '') || apiMeeting.notes || ''
  };
};

// تحويل نوع الاجتماع من Backend إلى Frontend
const mapMeetingType = (backendType: string): Meeting['type'] => {
  switch (backendType) {
    case 'visio':
      return 'client_meeting';
    case 'presentiel':
      return 'client_meeting';
    default:
      return 'client_meeting';
  }
};

// حساب مدة الاجتماع بالدقائق
const calculateDuration = (startTime: string, endTime?: string): number => {
  if (!endTime) return 60; // افتراضي ساعة واحدة
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startTotalMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;
  
  return Math.max(endTotalMin - startTotalMin, 15); // على الأقل 15 دقيقة
};

// اكتشاف منصة الاجتماع من الرابط
const detectPlatform = (meetingLink?: string): string => {
  if (!meetingLink) return 'Unknown';
  
  if (meetingLink.includes('meet.google.com')) return 'Google Meet';
  if (meetingLink.includes('zoom.us')) return 'Zoom';
  if (meetingLink.includes('teams.microsoft.com')) return 'Teams';
  if (meetingLink.includes('webex.com')) return 'Webex';
  
  return 'Other';
};

// الحصول على ملاحظات الفريلانسر من ردوده
const getFreelancerNotes = (responses: any[], freelancerId: string): string => {
  
  const response = responses.find(r => r.freelancerId === freelancerId);
  return response?.notes || '';
};

// دالة للحصول على معرف الفريلانسر الحالي من session
export const getCurrentFreelancerId = (): string | null => {
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

// جلب اجتماعات فريلانسر معين
export const getFreelancerMeetings = async (freelancerId: string): Promise<Meeting[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/freelancer-meetings/freelancer/${freelancerId}`, {
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
      console.log(`📅 تم جلب ${data.data.length} اجتماع للفريلانسر ${freelancerId} من API`);
      return data.data.map(transformMeetingFromAPI);
    }

    return [];
  } catch (error) {
    console.error('خطأ في جلب اجتماعات الفريلانسر:', error);
    throw error;
  }
};

// جلب الاجتماعات القادمة فقط
export const getUpcomingMeetings = async (freelancerId: string): Promise<Meeting[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/freelancer-meetings/freelancer/${freelancerId}?upcoming=true`, {
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
      console.log(`🔜 تم جلب ${data.data.length} اجتماع قادم للفريلانسر ${freelancerId}`);
      return data.data.map(transformMeetingFromAPI);
    }

    return [];
  } catch (error) {
    console.error('خطأ في جلب الاجتماعات القادمة:', error);
    throw error;
  }
};

// جلب تفاصيل اجتماع معين
export const getMeetingDetails = async (meetingId: string): Promise<Meeting | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/freelancer-meetings/${meetingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return transformMeetingFromAPI(data.data);
    }

    return null;
  } catch (error) {
    console.error('خطأ في جلب تفاصيل الاجتماع:', error);
    throw error;
  }
};

// رد الفريلانسر على الاجتماع (قبول/رفض)
export const respondToMeeting = async (
  meetingId: string, 
  freelancerId: string, 
  response: 'accepted' | 'declined', 
  notes?: string
): Promise<boolean> => {
  try {
    const apiResponse = await fetch(`${API_BASE_URL}/freelancer-meetings/${meetingId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        freelancerId,
        response,
        notes: notes || ''
      }),
    });

    if (!apiResponse.ok) {
      throw new Error(`HTTP error! status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    if (data.success) {
      const actionText = response === 'accepted' ? 'قبول' : 'رفض';
      console.log(`✅ تم ${actionText} الاجتماع بنجاح`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('خطأ في الرد على الاجتماع:', error);
    throw error;
  }
};

// إضافة/تحديث ملاحظات الاجتماع
export const addMeetingNotes = async (
  meetingId: string, 
  freelancerId: string, 
  notes: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/freelancer-meetings/${meetingId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        freelancerId,
        notes
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('📝 تم حفظ الملاحظات بنجاح');
      return true;
    }

    return false;
  } catch (error) {
    console.error('خطأ في حفظ الملاحظات:', error);
    throw error;
  }
};

// جلب إحصائيات اجتماعات الفريلانسر
export const getMeetingStats = async (freelancerId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/freelancer-meetings/stats/${freelancerId}`, {
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

    return {
      total: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      upcoming: 0
    };
  } catch (error) {
    console.error('خطأ في جلب إحصائيات الاجتماعات:', error);
    return {
      total: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      upcoming: 0
    };
  }
};

// دوال مساعدة للتوافق مع النظام الحالي
export const acceptMeeting = async (meetingId: string): Promise<void> => {
  const freelancerId = getCurrentFreelancerId();
  if (!freelancerId) {
    throw new Error('معرف الفريلانسر غير متوفر');
  }
  await respondToMeeting(meetingId, freelancerId, 'accepted');
};

export const refuseMeeting = async (meetingId: string, reason: string): Promise<void> => {
  const freelancerId = getCurrentFreelancerId();
  if (!freelancerId) {
    throw new Error('معرف الفريلانسر غير متوفر');
  }
  await respondToMeeting(meetingId, freelancerId, 'declined', reason);
};

export const updateMeetingNotes = async (meetingId: string, notes: string): Promise<void> => {
  const freelancerId = getCurrentFreelancerId();
  if (!freelancerId) {
    throw new Error('معرف الفريلانسر غير متوفر');
  }
  await addMeetingNotes(meetingId, freelancerId, notes);
};


// تصدير دالة للحصول على الاجتماعات مع fallback للبيانات المحلية
export const getMeetingsWithFallback = async (freelancerId?: string): Promise<Meeting[]> => {
  if (freelancerId) {
    try {
      const apiMeetings = await getFreelancerMeetings(freelancerId);
      if (apiMeetings && apiMeetings.length > 0) {
        return apiMeetings;
      }
    } catch (error) {
      console.error('فشل في جلب الاجتماعات من API، استخدام البيانات المحلية:', error);
    }
  }
  
  // fallback للبيانات المحلية
  const { getMeetings } = await import('./freelancerData');
  return getMeetings();
};
