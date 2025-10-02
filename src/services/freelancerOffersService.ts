import { JobOffer } from '../types/freelancer';

const API_BASE = 'http://localhost:3001/api/freelancer-offers';

// جلب العروض المرئية للفريلانسر
export const getFreelancerOffers = async (freelancerId: string): Promise<JobOffer[]> => {
  try {
    const response = await fetch(`${API_BASE}/for-freelancer/${freelancerId}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data.map((offer: any) => ({
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
    }
    
    return [];
    
  } catch (error) {
    console.error('خطأ في جلب عروض الفريلانسر:', error);
    return [];
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

// جلب إحصائيات العروض للفريلانسر
export const getFreelancerOfferStats = async (freelancerId: string): Promise<{
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
}> => {
  try {
    const response = await fetch(`${API_BASE}/stats/${freelancerId}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    return { total: 0, pending: 0, accepted: 0, rejected: 0 };
    
  } catch (error) {
    console.error('خطأ في جلب إحصائيات العروض:', error);
    return { total: 0, pending: 0, accepted: 0, rejected: 0 };
  }
};
