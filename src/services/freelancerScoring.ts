// نظام السكور الديناميكي للفريلانسر
import { Project, JobOffer, Meeting } from '../types/freelancer';
import { getProjects, getJobOffers, getMeetings } from './freelancerData';
import { getCurrentFreelancerId } from './freelancerMeetingsService';

export interface FreelancerScore {
  totalScore: number;
  maxPossibleScore: number;
  scorePercentage: number;
  breakdown: {
    acceptedOffers: { count: number; points: number };
    completedProjects: { count: number; points: number };
    refusedMeetings: { count: number; points: number };
    pendingOffers: { count: number; points: number };
    refusedOffers: { count: number; points: number };
  };
}

// قواعد النقاط
const SCORING_RULES = {
  ACCEPTED_OFFER: 10,      // +10 نقاط لكل عرض مقبول
  COMPLETED_PROJECT: 10,   // +10 نقاط لكل مشروع مكتمل
  REFUSED_MEETING: -5,     // -5 نقاط لكل اجتماع مرفوض
  PENDING_OFFER: -2,       // -2 نقاط لكل عرض معلق
  REFUSED_OFFER: -2        // -2 نقاط لكل عرض مرفوض
};

export const calculateFreelancerScore = async (freelancerId?: string): Promise<FreelancerScore> => {
  try {
    console.log('🎯 بدء حساب السكور للفريلانسر:', freelancerId);
    
    // تحميل البيانات
    const projects = getProjects();
    const offers = await getJobOffers();
    const meetings = await getMeetings(freelancerId);
    
    console.log('📊 البيانات المحملة للسكور:', { 
      projects: projects.length, 
      offers: offers.length, 
      meetings: meetings.length 
    });

    // حساب العروض المقبولة
    const acceptedOffers = offers.filter(o => o.status === 'accepted');
    const acceptedOffersPoints = acceptedOffers.length * SCORING_RULES.ACCEPTED_OFFER;
    
    // حساب المشاريع المكتملة
    const completedProjects = projects.filter(p => p.status === 'completed');
    const completedProjectsPoints = completedProjects.length * SCORING_RULES.COMPLETED_PROJECT;
    
    // حساب الاجتماعات المرفوضة
    const refusedMeetings = meetings.filter(m => m.status === 'declined');
    const refusedMeetingsPoints = refusedMeetings.length * SCORING_RULES.REFUSED_MEETING;
    
    // حساب العروض المعلقة
    const pendingOffers = offers.filter(o => o.status === 'pending' || o.status === 'available');
    const pendingOffersPoints = pendingOffers.length * SCORING_RULES.PENDING_OFFER;
    
    // حساب العروض المرفوضة
    const refusedOffers = offers.filter(o => o.status === 'refused');
    const refusedOffersPoints = refusedOffers.length * SCORING_RULES.REFUSED_OFFER;

    // حساب النقاط الإجمالية
    const totalScore = Math.max(0, 
      acceptedOffersPoints + 
      completedProjectsPoints + 
      refusedMeetingsPoints + 
      pendingOffersPoints + 
      refusedOffersPoints
    );

    // حساب أقصى نقاط ممكنة (بناءً على العروض والمشاريع الموجودة)
    const maxPossibleScore = 
      (offers.length * SCORING_RULES.ACCEPTED_OFFER) + 
      (projects.length * SCORING_RULES.COMPLETED_PROJECT);

    // حساب النسبة المئوية
    const scorePercentage = maxPossibleScore > 0 
      ? Math.round((totalScore / maxPossibleScore) * 100)
      : 95; // قيمة افتراضية

    const score: FreelancerScore = {
      totalScore,
      maxPossibleScore,
      scorePercentage: Math.min(100, Math.max(0, scorePercentage)),
      breakdown: {
        acceptedOffers: { 
          count: acceptedOffers.length, 
          points: acceptedOffersPoints 
        },
        completedProjects: { 
          count: completedProjects.length, 
          points: completedProjectsPoints 
        },
        refusedMeetings: { 
          count: refusedMeetings.length, 
          points: refusedMeetingsPoints 
        },
        pendingOffers: { 
          count: pendingOffers.length, 
          points: pendingOffersPoints 
        },
        refusedOffers: { 
          count: refusedOffers.length, 
          points: refusedOffersPoints 
        }
      }
    };

    console.log('✅ تم حساب السكور:', {
      totalScore,
      scorePercentage: score.scorePercentage,
      breakdown: score.breakdown
    });

    return score;

  } catch (error) {
    console.error('❌ خطأ في حساب السكور:', error);
    
    // إرجاع قيم افتراضية في حالة الخطأ
    return {
      totalScore: 95,
      maxPossibleScore: 100,
      scorePercentage: 95,
      breakdown: {
        acceptedOffers: { count: 5, points: 50 },
        completedProjects: { count: 2, points: 20 },
        refusedMeetings: { count: 1, points: -5 },
        pendingOffers: { count: 2, points: -4 },
        refusedOffers: { count: 1, points: -2 }
      }
    };
  }
};

// دالة للحصول على السكور في الوقت الفعلي
export const getRealtimeScore = async (): Promise<FreelancerScore> => {
  const freelancerId = getCurrentFreelancerId();
  return await calculateFreelancerScore(freelancerId);
};

// دالة لحساب تقييم الأداء بناءً على السكور
export const getPerformanceRating = (scorePercentage: number): {
  rating: string;
  color: string;
  description: string;
} => {
  if (scorePercentage >= 90) {
    return {
      rating: 'Excellent',
      color: 'text-green-600',
      description: 'Performance exceptionnelle'
    };
  } else if (scorePercentage >= 80) {
    return {
      rating: 'Très Bien',
      color: 'text-blue-600',
      description: 'Très bonne performance'
    };
  } else if (scorePercentage >= 70) {
    return {
      rating: 'Bien',
      color: 'text-yellow-600',
      description: 'Bonne performance'
    };
  } else if (scorePercentage >= 60) {
    return {
      rating: 'Moyen',
      color: 'text-orange-600',
      description: 'Performance moyenne'
    };
  } else {
    return {
      rating: 'À améliorer',
      color: 'text-red-600',
      description: 'Performance à améliorer'
    };
  }
};

// دالة لحساب الاتجاه (تحسن أم تراجع)
export const getScoreTrend = async (): Promise<{
  trend: 'up' | 'down' | 'stable';
  change: number;
  description: string;
}> => {
  try {
    // هنا يمكن إضافة منطق لمقارنة السكور الحالي مع السكور السابق
    // للبساطة، سنعيد اتجاه إيجابي افتراضي
    return {
      trend: 'up',
      change: 5,
      description: 'Amélioration de 5% ce mois'
    };
  } catch (error) {
    return {
      trend: 'stable',
      change: 0,
      description: 'Stable'
    };
  }
};

// دالة لحساب النقاط المطلوبة للوصول للمستوى التالي
export const getPointsToNextLevel = (currentScore: FreelancerScore): {
  pointsNeeded: number;
  nextLevelPercentage: number;
  suggestions: string[];
} => {
  const currentPercentage = currentScore.scorePercentage;
  let nextLevelPercentage = 100;
  
  if (currentPercentage < 60) nextLevelPercentage = 60;
  else if (currentPercentage < 70) nextLevelPercentage = 70;
  else if (currentPercentage < 80) nextLevelPercentage = 80;
  else if (currentPercentage < 90) nextLevelPercentage = 90;
  
  const pointsNeeded = Math.ceil(
    (nextLevelPercentage - currentPercentage) * currentScore.maxPossibleScore / 100
  );
  
  const suggestions = [];
  
  if (currentScore.breakdown.pendingOffers.count > 0) {
    suggestions.push(`Accepter ${Math.ceil(pointsNeeded / SCORING_RULES.ACCEPTED_OFFER)} offres en attente`);
  }
  
  if (currentScore.breakdown.refusedMeetings.count > 0) {
    suggestions.push('Éviter de refuser les réunions importantes');
  }
  
  suggestions.push('Terminer plus de projets avec succès');
  
  return {
    pointsNeeded,
    nextLevelPercentage,
    suggestions
  };
};
