/**
 * خدمة إدارة القرارات للفريلانسرز
 * تتعامل مع القرارات المرسلة من Admin Panel
 */

const API_BASE = 'https://matc-backend.onrender.com/api/freelancer-decisions';

export interface FreelancerDecision {
  _id: string;
  freelancerId: string;
  freelancerName: string;
  deliverableTitle: string;
  decision: 'approved' | 'rejected';
  observation: string;
  adminId: string;
  status: 'sent' | 'read';
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  formattedTitle?: string;
  formattedDate?: string;
}

export interface DecisionStats {
  total: number;
  approved: number;
  rejected: number;
  unread: number;
  read: number;
}

/**
 * جلب القرارات للفريلانسر المحدد
 */
export const getFreelancerDecisions = async (freelancerId: string): Promise<FreelancerDecision[]> => {
  try {
    console.log(`📋 جلب القرارات للفريلانسر ${freelancerId}...`);
    
    const response = await fetch(`${API_BASE}/${freelancerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ تم جلب ${result.data.length} قرار للفريلانسر ${freelancerId}`);
      
      // إذا كانت API فارغة، استخدم localStorage fallback
      if (result.data.length === 0) {
        console.log(`📭 API فارغ، محاولة localStorage fallback...`);
        const localDecisions = getDecisionsFromLocalStorage(freelancerId);
        if (localDecisions.length > 0) {
          console.log(`💾 تم جلب ${localDecisions.length} قرار من localStorage fallback`);
          return localDecisions;
        }
      }
      
      return result.data;
    } else {
      throw new Error(result.message || 'فشل في جلب القرارات');
    }
  } catch (error) {
    console.error('خطأ في جلب القرارات:', error);
    
    // Fallback إلى localStorage
    return getDecisionsFromLocalStorage(freelancerId);
  }
};

/**
 * إرسال قرار جديد (من Admin Panel)
 */
export const sendDecision = async (decisionData: {
  freelancerId: string;
  freelancerName: string;
  deliverableTitle: string;
  decision: 'approved' | 'rejected';
  observation: string;
  adminId?: string;
}): Promise<FreelancerDecision> => {
  try {
    console.log(`📤 إرسال قرار للفريلانسر ${decisionData.freelancerId}...`);
    
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(decisionData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ تم إرسال القرار بنجاح للفريلانسر ${decisionData.freelancerId}`);
      
      // حفظ في localStorage كـ backup
      saveDecisionToLocalStorage(result.data);
      
      return result.data;
    } else {
      throw new Error(result.message || 'فشل في إرسال القرار');
    }
  } catch (error) {
    console.error('خطأ في إرسال القرار:', error);
    
    // Fallback إلى localStorage
    const localDecision = createLocalDecision(decisionData);
    saveDecisionToLocalStorage(localDecision);
    
    return localDecision;
  }
};

/**
 * تحديد القرار كمقروء
 */
export const markDecisionAsRead = async (decisionId: string, freelancerId: string): Promise<void> => {
  try {
    console.log(`📖 تحديد القرار ${decisionId} كمقروء...`);
    
    const response = await fetch(`${API_BASE}/${decisionId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ freelancerId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ تم تحديد القرار ${decisionId} كمقروء`);
      
      // تحديث localStorage
      updateDecisionInLocalStorage(decisionId, { status: 'read', readAt: new Date().toISOString() });
    } else {
      throw new Error(result.message || 'فشل في تحديث القرار');
    }
  } catch (error) {
    console.error('خطأ في تحديث القرار:', error);
    
    // Fallback إلى localStorage
    updateDecisionInLocalStorage(decisionId, { status: 'read', readAt: new Date().toISOString() });
  }
};

/**
 * جلب إحصائيات القرارات
 */
export const getDecisionStats = async (freelancerId: string): Promise<DecisionStats> => {
  try {
    console.log(`📊 جلب إحصائيات القرارات للفريلانسر ${freelancerId}...`);
    
    const response = await fetch(`${API_BASE}/${freelancerId}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ تم جلب إحصائيات القرارات للفريلانسر ${freelancerId}`);
      return result.data;
    } else {
      throw new Error(result.message || 'فشل في جلب الإحصائيات');
    }
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error);
    
    // Fallback إلى localStorage
    return getStatsFromLocalStorage(freelancerId);
  }
};

/**
 * حذف قرار (للاختبار)
 */
export const deleteDecision = async (decisionId: string, freelancerId: string): Promise<void> => {
  try {
    console.log(`🗑️ حذف القرار ${decisionId}...`);
    
    const response = await fetch(`${API_BASE}/${decisionId}?freelancerId=${freelancerId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ تم حذف القرار ${decisionId}`);
      
      // حذف من localStorage
      deleteDecisionFromLocalStorage(decisionId);
    } else {
      throw new Error(result.message || 'فشل في حذف القرار');
    }
  } catch (error) {
    console.error('خطأ في حذف القرار:', error);
    
    // Fallback إلى localStorage
    deleteDecisionFromLocalStorage(decisionId);
  }
};

// ==================== localStorage Fallback Functions ====================

/**
 * جلب القرارات من localStorage
 */
const getDecisionsFromLocalStorage = (freelancerId: string): FreelancerDecision[] => {
  try {
    const key = `freelancerDecisions_${freelancerId}`;
    const decisions = localStorage.getItem(key);
    
    if (!decisions) {
      console.log(`📭 لا توجد قرارات محفوظة للفريلانسر ${freelancerId}`);
      return [];
    }
    
    const parsedDecisions = JSON.parse(decisions);
    console.log(`📦 تم جلب ${parsedDecisions.length} قرار من localStorage للفريلانسر ${freelancerId}`);
    
    return parsedDecisions;
  } catch (error) {
    console.error('خطأ في جلب القرارات من localStorage:', error);
    return [];
  }
};

/**
 * حفظ قرار في localStorage
 */
const saveDecisionToLocalStorage = (decision: FreelancerDecision): void => {
  try {
    const key = `freelancerDecisions_${decision.freelancerId}`;
    const existingDecisions = getDecisionsFromLocalStorage(decision.freelancerId);
    
    // إضافة القرار الجديد في المقدمة
    const updatedDecisions = [decision, ...existingDecisions];
    
    localStorage.setItem(key, JSON.stringify(updatedDecisions));
    console.log(`💾 تم حفظ القرار في localStorage للفريلانسر ${decision.freelancerId}`);
  } catch (error) {
    console.error('خطأ في حفظ القرار في localStorage:', error);
  }
};

/**
 * تحديث قرار في localStorage
 */
const updateDecisionInLocalStorage = (decisionId: string, updates: Partial<FreelancerDecision>): void => {
  try {
    // البحث في جميع الفريلانسرز
    const keys = Object.keys(localStorage).filter(key => key.startsWith('freelancerDecisions_'));
    
    for (const key of keys) {
      const decisions = JSON.parse(localStorage.getItem(key) || '[]');
      const updatedDecisions = decisions.map((decision: FreelancerDecision) => 
        decision._id === decisionId ? { ...decision, ...updates } : decision
      );
      
      if (JSON.stringify(decisions) !== JSON.stringify(updatedDecisions)) {
        localStorage.setItem(key, JSON.stringify(updatedDecisions));
        console.log(`💾 تم تحديث القرار ${decisionId} في localStorage`);
        break;
      }
    }
  } catch (error) {
    console.error('خطأ في تحديث القرار في localStorage:', error);
  }
};

/**
 * حذف قرار من localStorage
 */
const deleteDecisionFromLocalStorage = (decisionId: string): void => {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('freelancerDecisions_'));
    
    for (const key of keys) {
      const decisions = JSON.parse(localStorage.getItem(key) || '[]');
      const filteredDecisions = decisions.filter((decision: FreelancerDecision) => decision._id !== decisionId);
      
      if (decisions.length !== filteredDecisions.length) {
        localStorage.setItem(key, JSON.stringify(filteredDecisions));
        console.log(`🗑️ تم حذف القرار ${decisionId} من localStorage`);
        break;
      }
    }
  } catch (error) {
    console.error('خطأ في حذف القرار من localStorage:', error);
  }
};

/**
 * إنشاء قرار محلي
 */
const createLocalDecision = (decisionData: any): FreelancerDecision => {
  return {
    _id: `local-${Date.now()}`,
    freelancerId: decisionData.freelancerId,
    freelancerName: decisionData.freelancerName,
    deliverableTitle: decisionData.deliverableTitle,
    decision: decisionData.decision,
    observation: decisionData.observation || '',
    adminId: decisionData.adminId || 'admin',
    status: 'sent',
    readAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * جلب إحصائيات من localStorage
 */
const getStatsFromLocalStorage = (freelancerId: string): DecisionStats => {
  try {
    const decisions = getDecisionsFromLocalStorage(freelancerId);
    
    const stats: DecisionStats = {
      total: decisions.length,
      approved: decisions.filter(d => d.decision === 'approved').length,
      rejected: decisions.filter(d => d.decision === 'rejected').length,
      unread: decisions.filter(d => d.status === 'sent').length,
      read: decisions.filter(d => d.status === 'read').length,
    };
    
    console.log(`📊 إحصائيات localStorage للفريلانسر ${freelancerId}:`, stats);
    return stats;
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات من localStorage:', error);
    return { total: 0, approved: 0, rejected: 0, unread: 0, read: 0 };
  }
};

/**
 * تنسيق تاريخ القرار
 */
export const formatDecisionDate = (timestamp: string): string => {
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
 * إنشاء قرار تجريبي (للاختبار)
 */
export const createTestDecision = async (freelancerId: string): Promise<void> => {
  const testDecision = {
    freelancerId,
    freelancerName: 'Test Freelancer',
    deliverableTitle: 'Test Deliverable',
    decision: 'approved' as const,
    observation: 'هذا قرار تجريبي للاختبار',
    adminId: 'test-admin'
  };
  
  await sendDecision(testDecision);
  console.log('🧪 تم إنشاء قرار تجريبي:', testDecision);
};
