import { JobOffer } from '../types/freelancer';

const API_BASE = 'https://matc-backend.onrender.com/api/freelancer-offers';

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

// جلب العروض المرئية للفريلانسر مع إصلاح مشاكل API
export const getFreelancerOffers = async (freelancerId: string): Promise<JobOffer[]> => {
  try {
    console.log(`🔄 جلب عروض المستقل: ${freelancerId}`);
    
    const response = await fetch(`${API_BASE}/for-freelancer/${freelancerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 seconds timeout
    });

    const result = await handleApiResponse(response);
    
    const offers = result.data.map((offer: any) => ({
      id: offer._id,
      title: offer.title,
      description: offer.description,
      client: offer.company,
      budget: offer.salaryMax || offer.salaryMin || 0,
      deadline: offer.deadline ? new Date(offer.deadline).toISOString().split('T')[0] : '',
      status: 'pending' as const,
      skills: offer.skills || [],
      workMode: offer.locationType || 'remote',
      estimatedHours: calculateEstimatedHours(offer.contractType),
      priority: determinePriority(offer.tags),
      // معلومات إضافية من العرض
      contractType: offer.contractType,
      seniority: offer.seniority,
      currency: offer.currency || 'TND',
      salaryMin: offer.salaryMin,
      salaryMax: offer.salaryMax,
      applicationLink: offer.applicationLink,
      contactEmail: offer.contactEmail,
      requirements: offer.requirements || [],
      benefits: offer.benefits || [],
      tags: offer.tags || [],
      // إضافة الحقول المطلوبة بوضوح
      clientName: offer.company,
      price: offer.salaryMax || offer.salaryMin || 0,
      createdAt: offer.createdAt
    }));
    
    console.log(`✅ تم جلب ${offers.length} عرض للمستقل: ${freelancerId}`);
    return offers;
    
  } catch (error) {
    console.error('❌ خطأ في جلب عروض المستقل:', error);
    
    // Return fallback data
    return getFallbackOffers(freelancerId);
  }
};

// حساب الساعات المقدرة بناءً على نوع العقد
const calculateEstimatedHours = (contractType: string): number => {
  switch (contractType) {
    case 'full-time':
      return 160; // 40 ساعة × 4 أسابيع
    case 'part-time':
      return 80;  // 20 ساعة × 4 أسابيع
    case 'contract':
      return 60;  // مشروع قصير المدى
    case 'internship':
      return 120; // تدريب
    default:
      return 40;
  }
};

// تحديد الأولوية بناءً على العلامات
const determinePriority = (tags: string[] = []): 'high' | 'medium' | 'low' => {
  const urgentTags = ['urgent', 'asap', 'priority', 'rush'];
  const highValueTags = ['senior', 'lead', 'architect', 'expert'];
  
  if (tags.some(tag => urgentTags.includes(tag.toLowerCase()))) {
    return 'high';
  }
  
  if (tags.some(tag => highValueTags.includes(tag.toLowerCase()))) {
    return 'high';
  }
  
  return 'medium';
};

// قبول عرض عمل
export const acceptFreelancerOffer = async (offerId: string, freelancerId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${offerId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        freelancerId,
        action: 'accept'
      })
    });
    
    const result = await response.json();
    return result.success;
    
  } catch (error) {
    console.error('خطأ في قبول العرض:', error);
    return false;
  }
};

// رفض عرض عمل
export const rejectFreelancerOffer = async (offerId: string, freelancerId: string, reason?: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${offerId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        freelancerId,
        action: 'reject',
        reason
      })
    });
    
    const result = await response.json();
    return result.success;
    
  } catch (error) {
    console.error('خطأ في رفض العرض:', error);
    return false;
  }
};

// جلب إحصائيات العروض للفريلانسر مع إصلاح مشاكل API
export const getFreelancerOfferStats = async (freelancerId: string): Promise<{
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}> => {
  try {
    console.log(`📊 جلب إحصائيات العروض للمستقل: ${freelancerId}`);
    
    const response = await fetch(`${API_BASE}/stats/${freelancerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    });

    const result = await handleApiResponse(response);
    
    console.log(`✅ تم جلب الإحصائيات بنجاح للمستقل: ${freelancerId}`);
    return result.data;
    
  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات العروض:', error);
    
    // Return fallback stats
    return { total: 0, pending: 0, accepted: 0, rejected: 0 };
  }
};

// Fallback offers when API fails
const getFallbackOffers = (freelancerId: string): JobOffer[] => {
  return [
    {
      id: 'fallback-1',
      title: 'عرض عمل تجريبي',
      description: 'هذا عرض عمل تجريبي للاختبار',
      client: 'شركة تجريبية',
      budget: 5000,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      skills: ['React', 'Node.js', 'TypeScript'],
      workMode: 'remote',
      estimatedHours: 160,
      priority: 'medium',
      contractType: 'full-time',
      seniority: 'mid',
      currency: 'TND',
      salaryMin: 3000,
      salaryMax: 5000,
      applicationLink: '#',
      contactEmail: 'contact@example.com',
      requirements: ['خبرة في React', 'معرفة Node.js'],
      benefits: ['تأمين صحي', 'إجازة مدفوعة'],
      tags: ['frontend', 'backend'],
      clientName: 'شركة تجريبية',
      price: 5000,
      createdAt: new Date().toISOString()
    }
  ];
};

// Test API connection
export const testFreelancerOffersConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE.replace('/freelancer-offers', '')}/health`, {
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
};
