import { Participant, ParticipantStats } from '../types/participant';

// Mock comprehensive participant data - DISABLED FOR PRODUCTION
// تم تعطيل جميع البيانات التجريبية لمنع ظهورها في الإنتاج
export const mockParticipantsData: Participant[] = [
  // جميع البيانات التجريبية معطلة - مصفوفة فارغة
];

// Mock participant statistics - DISABLED
export const mockParticipantStats: ParticipantStats = {
  total: 0,
  active: 0,
  graduated: 0,
  suspended: 0,
  newThisMonth: 0,
  averageProgress: 0
};

// Helper functions - DISABLED
export const getParticipantById = (id: string): Participant | undefined => {
  return undefined; // تم تعطيل البحث
};

export const getParticipantsByStatus = (status: Participant['status']): Participant[] => {
  return []; // تم تعطيل البحث
};

export const searchParticipants = (query: string): Participant[] => {
  return []; // تم تعطيل البحث
};
