import {
  JobOffer,
  Meeting,
  Project,
  Deliverable,
  FreelancerStats,
  ProjectStatus,
} from "../types/freelancer";
// Admin notifications system disabled
// New freelancer offers service
import { getFreelancerOffers } from "./freelancerOffersService";

// Email de l'administrateur pour les communications
const ADMIN_EMAIL = "admin@siteen.com";

// Données mock pour les offres d'emploi
export const mockJobOffers: JobOffer[] = [
  {
    id: "1",
    title: "Développeur Frontend React",
    client: "TechCorp",
    description: "Nous recherchons un développeur React expérimenté...",
    budget: 45000,
    deadline: "2024-02-15",
    status: "available",
    skills: ["React", "TypeScript", "JavaScript"],
    requirements: ["React", "TypeScript", "3+ ans d'expérience"],
    workMode: "remote",
    estimatedHours: 160,
    priority: "high"
  },
  {
    id: "2", 
    title: "Designer UX/UI",
    client: "DesignStudio",
    description: "Mission de 6 mois pour refonte d'application mobile...",
    budget: 24000,
    deadline: "2024-02-01",
    status: "available",
    skills: ["Figma", "Adobe Creative Suite", "UX Design"],
    requirements: ["Figma", "Adobe Creative Suite", "Portfolio requis"],
    workMode: "hybrid",
    estimatedHours: 120,
    priority: "medium"
  }
];

// Données mock pour les réunions
export const mockMeetings: Meeting[] = [
  {
    id: "1",
    title: "Réunion de kick-off",
    client: "TechCorp",
    date: "2024-02-01",
    time: "14:00",
    duration: 60,
    type: "project_kickoff",
    status: "scheduled",
    meetingLink: "https://meet.google.com/abc-def-ghi",
    agenda: "Présentation du projet et définition des objectifs",
    notes: ""
  }
];

// Données mock pour les projets
export const mockProjects: Project[] = [
  {
    id: "1",
    title: "Application E-commerce",
    client: "ShopCorp",
    status: "in_progress",
    progress: 65,
    startDate: "2024-01-01",
    endDate: "2024-03-15",
    budget: 15000,
    description: "Développement d'une application e-commerce complète",
    teamMembers: ["freelancer-001"],
    skills: ["React", "Node.js", "MongoDB"],
    workMode: "remote",
    estimatedHours: 200,
    priority: "high",
    originalOfferId: "1"
  }
];

// Historique des projets terminés
export const mockProjectHistory: Project[] = [];

// Données mock pour les livrables
export const mockDeliverables: Deliverable[] = [];

// Fonction pour obtenir les statistiques du freelancer
export const getFreelancerStats = (): FreelancerStats => {
  const activeProjects = mockProjects.length;
  const completedProjects = mockProjectHistory.length;
  const totalEarnings = mockProjectHistory.reduce((sum, project) => sum + (project.budget || 0), 0);
  const averageRating = 4.8; // Mock rating

  return {
    totalProjects: activeProjects + completedProjects,
    activeProjects,
    completedProjects,
    totalEarnings,
    monthlyEarnings: totalEarnings / 12,
    averageRating,
    totalHours: 1600, // Mock hours
    successRate: 95, // Mock success rate
    responseTime: "2h", // Mock response time
    clientSatisfaction: 98 // Mock satisfaction
  };
};

// Export mock stats for components that expect this specific export name
export const mockFreelancerStats = getFreelancerStats();

// Accepter une offre d'emploi et la convertir en projet
export const acceptJobOffer = async (
  offerId: string, 
  teamMembers?: string[], 
  freelancerId?: string
): Promise<void> => {
  // البحث في العروض الحالية
  const currentOffers = await getJobOffers(freelancerId);
  const acceptedOffer = currentOffers.find(o => o.id === offerId);
  
  if (acceptedOffer) {
    // إنشاء مشروع جديد من العرض المقبول
    const newProject: Project = {
      id: `project-${Date.now()}`,
      title: acceptedOffer.title,
      client: acceptedOffer.client,
      status: "in_progress",
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: acceptedOffer.deadline,
      budget: acceptedOffer.budget || 0,
      description: acceptedOffer.description,
      teamMembers: teamMembers || ["freelancer-001"],
      skills: acceptedOffer.skills || [],
      workMode: acceptedOffer.workMode || "remote",
      estimatedHours: acceptedOffer.estimatedHours || 40,
      priority: acceptedOffer.priority || "medium",
      originalOfferId: offerId
    };
    
    // إضافة المشروع الجديد
    mockProjects.push(newProject);
    
    // حفظ المشاريع في localStorage للاحتفاظ بها بعد التحديث
    try {
      const existingProjects = JSON.parse(localStorage.getItem('freelancerProjects') || '[]');
      existingProjects.push(newProject);
      localStorage.setItem('freelancerProjects', JSON.stringify(existingProjects));
      console.log(`💾 Projet sauvegardé dans localStorage`);
    } catch (error) {
      console.error('خطأ في حفظ المشروع في localStorage:', error);
    }
    
    // حذف العرض من mock data
    const offerIndex = mockJobOffers.findIndex((o) => o.id === offerId);
    if (offerIndex !== -1) {
      mockJobOffers.splice(offerIndex, 1);
    }
    
    // إنشاء قائمة "العروض المقبولة" لاستبعادها من العرض
    try {
      const acceptedOffers = JSON.parse(localStorage.getItem('acceptedOffers') || '[]');
      if (!acceptedOffers.includes(offerId)) {
        acceptedOffers.push(offerId);
        localStorage.setItem('acceptedOffers', JSON.stringify(acceptedOffers));
        console.log(`📝 Offre ${offerId} ajoutée à la liste des acceptées`);
      }
    } catch (error) {
      console.error('خطأ في حفظ العروض المقبولة:', error);
    }
    
    // حفظ العروض المحدثة في localStorage
    try {
      localStorage.setItem('freelancerOffers', JSON.stringify(mockJobOffers));
      console.log(`💾 Offres mises à jour dans localStorage`);
    } catch (error) {
      console.error('خطأ في حفظ العروض في localStorage:', error);
    }
    
    console.log(`✅ Offre acceptée et convertie en projet: ${acceptedOffer.title}`);
    console.log(`📊 Nouveau projet créé avec ID: ${newProject.id}`);
    console.log(`🚫 Offre ${offerId} ne sera plus affichée dans les offres`);
  }
  
  if (freelancerId) {
    try {
      // API call pour marquer l'offre comme acceptée
      console.log(`📡 Offre ${offerId} acceptée via API pour ${freelancerId}`);
    } catch (error) {
      console.error('خطأ في قبول العرض، استخدام البيانات المحلية:', error);
    }
  }
};

export const refuseJobOffer = async (
  offerId: string, 
  reason: string, 
  freelancerId?: string
): Promise<void> => {
  // البحث في العروض الحالية
  const currentOffers = await getJobOffers(freelancerId);
  const refusedOffer = currentOffers.find(o => o.id === offerId);
  
  if (refusedOffer) {
    // حذف العرض من mock data
    const offerIndex = mockJobOffers.findIndex((o) => o.id === offerId);
    if (offerIndex !== -1) {
      mockJobOffers.splice(offerIndex, 1);
    }
    
    // إضافة العرض إلى قائمة العروض المرفوضة
    try {
      const rejectedOffers = JSON.parse(localStorage.getItem('rejectedOffers') || '[]');
      if (!rejectedOffers.includes(offerId)) {
        rejectedOffers.push(offerId);
        localStorage.setItem('rejectedOffers', JSON.stringify(rejectedOffers));
        console.log(`📝 Offre ${offerId} ajoutée à la liste des refusées`);
      }
    } catch (error) {
      console.error('خطأ في حفظ العروض المرفوضة:', error);
    }
    
    // حفظ العروض المحدثة في localStorage
    try {
      localStorage.setItem('freelancerOffers', JSON.stringify(mockJobOffers));
      console.log(`💾 Offres mises à jour après refus dans localStorage`);
    } catch (error) {
      console.error('خطأ في حفظ العروض في localStorage:', error);
    }
    
    console.log(`❌ Offre refusée: ${refusedOffer.title}`);
    console.log(`📝 Raison: ${reason || 'Aucune raison spécifiée'}`);
    console.log(`🚫 Offre ${offerId} ne sera plus affichée dans les offres`);
  }
  
  if (freelancerId) {
    try {
      // API call pour marquer l'offre comme refusée
      console.log(`📡 Offre ${offerId} refusée via API: ${reason}`);
    } catch (error) {
      console.error('خطأ في رفض العرض، استخدام البيانات المحلية:', error);
    }
  }
};

export const updateMeetingNotes = async (meetingId: string, notes: string): Promise<void> => {
  try {
    const { updateMeetingNotes: apiUpdateNotes } = await import('./freelancerMeetingsService');
    await apiUpdateNotes(meetingId, notes);
    console.log('Notes de réunion mises à jour via API');
  } catch (error) {
    console.error('خطأ في تحديث ملاحظات الاجتماع، استخدام البيانات المحلية:', error);
    const meeting = mockMeetings.find((m) => m.id === meetingId);
    if (meeting) {
      meeting.notes = notes;
      console.log(`Notes de réunion mises à jour: ${meeting.title}`);
    }
  }
};

export const addMeetingNotes = updateMeetingNotes;

export const acceptMeeting = async (meetingId: string): Promise<void> => {
  try {
    const { acceptMeeting: apiAcceptMeeting } = await import('./freelancerMeetingsService');
    await apiAcceptMeeting(meetingId);
    console.log('Réunion acceptée via API');
  } catch (error) {
    console.error('خطأ في قبول الاجتماع، استخدام البيانات المحلية:', error);
    const meeting = mockMeetings.find((m) => m.id === meetingId);
    if (meeting) {
      meeting.notes = meeting.notes ? meeting.notes : "Acceptée par le freelancer.";
      console.log(`Réunion acceptée: ${meeting.title}`);
    }
  }
};

export const refuseMeeting = async (meetingId: string, reason: string): Promise<void> => {
  try {
    const { refuseMeeting: apiRefuseMeeting } = await import('./freelancerMeetingsService');
    await apiRefuseMeeting(meetingId, reason);
    console.log(`Réunion refusée via API: ${reason}`);
  } catch (error) {
    console.error('خطأ في رفض الاجتماع، استخدام البيانات المحلية:', error);
    const meeting = mockMeetings.find((m) => m.id === meetingId);
    if (meeting) {
      const prefix = meeting.notes ? `${meeting.notes}\n` : "";
      meeting.notes = `${prefix}Refusée: ${reason}`;
      console.log(`Réunion refusée: ${meeting.title}, Raison: ${reason}`);
    }
  }
};

export const removeMeeting = (meetingId: string): void => {
  const index = mockMeetings.findIndex((m) => m.id === meetingId);
  if (index !== -1) {
    const removed = mockMeetings[index];
    mockMeetings.splice(index, 1);
    console.log(`Réunion retirée: ${removed.title}`);
  }
};

const mockProjectStatus: ProjectStatus[] = mockProjects.map(project => ({
  id: project.id,
  title: project.title,
  client: project.client,
  status: project.status,
  progress: project.progress,
  startDate: project.startDate,
  endDate: project.endDate,
  budget: project.budget,
  description: project.description,
  teamMembers: project.teamMembers,
  lastUpdate: new Date().toISOString()
}));

export const getProjectStatus = (): ProjectStatus[] => {
  return mockProjectStatus;
};

const sendDeliverableNotification = (deliverable: Deliverable) => {
  console.log(`📧 Email envoyé à ${ADMIN_EMAIL}:`);
  console.log(`Sujet: Nouveau livrable soumis - ${deliverable.title}`);
  console.log(`Projet: ${deliverable.projectId}`);
  console.log(`Fichier: ${deliverable.fileUrl}`);
};

export const submitDeliverable = (
  projectId: string,
  title: string,
  description: string,
  fileUrl: string,
  rating?: number
): Deliverable => {
  const newDeliverable: Deliverable = {
    id: `deliverable-${Date.now()}`,
    projectId,
    title,
    type: "file",
    description,
    fileUrl,
    dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
    submittedDate: new Date().toISOString(),
    status: "pending",
    feedback: "",
    rating: rating || 0
  };

  mockDeliverables.push(newDeliverable);

  const project = mockProjects.find(p => p.id === projectId);
  const projectIndex = mockProjects.findIndex(p => p.id === projectId);
  
  if (projectIndex !== -1) {
    const removed = mockProjects.splice(projectIndex, 1)[0];
    if (removed) {
      mockProjectHistory.unshift(removed);
    }
  }

  sendDeliverableNotification(newDeliverable);
  console.log(`Livrable soumis: ${title} pour le projet ${project?.title || projectId}`);

  if (project) {
    console.log(`Projet retiré après livraison: ${project.title}`);
  }

  return newDeliverable;
};

export const getJobOffers = async (freelancerId?: string): Promise<JobOffer[]> => {
  let offers: JobOffer[] = [];
  
  if (freelancerId) {
    try {
      offers = await getFreelancerOffers(freelancerId);
    } catch (error) {
      console.error('خطأ في جلب العروض من API، استخدام البيانات المحلية:', error);
      
      // تحميل العروض من localStorage إذا وجدت
      try {
        const savedOffers = JSON.parse(localStorage.getItem('freelancerOffers') || '[]');
        if (savedOffers.length > 0) {
          offers = savedOffers;
        } else {
          offers = mockJobOffers;
        }
      } catch (error) {
        console.error('خطأ في تحميل العروض من localStorage:', error);
        offers = mockJobOffers;
      }
    }
  } else {
    // تحميل العروض من localStorage إذا وجدت
    try {
      const savedOffers = JSON.parse(localStorage.getItem('freelancerOffers') || '[]');
      if (savedOffers.length > 0) {
        offers = savedOffers;
      } else {
        offers = mockJobOffers;
      }
    } catch (error) {
      console.error('خطأ في تحميل العروض من localStorage:', error);
      offers = mockJobOffers;
    }
  }
  
  // استبعاد العروض المقبولة
  try {
    const acceptedOffers = JSON.parse(localStorage.getItem('acceptedOffers') || '[]');
    const rejectedOffers = JSON.parse(localStorage.getItem('rejectedOffers') || '[]');
    
    const filteredOffers = offers.filter(offer => 
      !acceptedOffers.includes(offer.id) && !rejectedOffers.includes(offer.id)
    );
    
    console.log(`📋 تم تحميل ${offers.length} عروض، تم استبعاد ${offers.length - filteredOffers.length} عروض مقبولة/مرفوضة`);
    return filteredOffers;
  } catch (error) {
    console.error('خطأ في فلترة العروض:', error);
    return offers;
  }
};

export const getMeetings = async (freelancerId?: string): Promise<Meeting[]> => {
  try {
    // أولاً: تحميل من localStorage (أولوية عالية للبيانات المحفوظة محلياً)
    let localMeetings: any[] = [];
    try {
      localMeetings = JSON.parse(localStorage.getItem('freelancerMeetings') || '[]');
      if (localMeetings.length > 0) {
        console.log(`📅 تم تحميل ${localMeetings.length} اجتماعات من localStorage (أولوية)`);
        
        // محاولة تحديث من API في الخلفية (بدون انتظار)
        if (freelancerId) {
          updateMeetingsFromAPI(freelancerId, localMeetings);
        }
        
        return localMeetings;
      }
    } catch (storageError) {
      console.error('خطأ في تحميل الاجتماعات من localStorage:', storageError);
    }

    // ثانياً: محاولة تحميل من API إذا لم توجد بيانات محلية
    if (freelancerId) {
      try {
        const response = await fetch(`https://matc-backend.onrender.com/api/freelancer-meetings/freelancer/${freelancerId}`);
        if (response.ok) {
          const apiResponse = await response.json();
          console.log(`📅 API Response:`, apiResponse);
          
          // التحقق من format الـ response
          let meetings = [];
          if (apiResponse.success && Array.isArray(apiResponse.data)) {
            meetings = apiResponse.data;
          } else if (Array.isArray(apiResponse)) {
            meetings = apiResponse;
          } else {
            console.warn('Unexpected API response format:', apiResponse);
            meetings = [];
          }
          
          console.log(`📅 تم تحميل ${meetings.length} اجتماعات من API للفريلانسر ${freelancerId}`);
          
          // تحويل البيانات من Backend format إلى Freelancer format
          const transformedMeetings = meetings.map((meeting: any) => ({
            id: meeting._id || meeting.id,
            title: meeting.subject || meeting.title,
            client: meeting.withWhom || 'Client',
            date: meeting.date,
            time: meeting.startTime || meeting.time,
            duration: meeting.durationMinutes || 60,
            type: meeting.type === 'visio' ? 'video_call' : 'client_meeting',
            status: meeting.status || 'scheduled',
            meetingLink: meeting.meetingLink || '',
            platform: detectPlatform(meeting.meetingLink),
            participants: meeting.participants || [],
            agenda: meeting.agenda || '',
            notes: meeting.notes || ''
          }));
          
          // حفظ في localStorage للاستخدام المستقبلي
          try {
            localStorage.setItem('freelancerMeetings', JSON.stringify(transformedMeetings));
          } catch (storageError) {
            console.warn('خطأ في حفظ الاجتماعات في localStorage:', storageError);
          }
          
          return transformedMeetings;
        }
      } catch (apiError) {
        console.warn('خطأ في تحميل الاجتماعات من API، استخدام البيانات المحلية:', apiError);
      }
    }

    // ثالثاً: إرجاع mock meetings كـ fallback
    console.log(`📅 تم تحميل ${mockMeetings.length} اجتماعات من mock data`);
    return mockMeetings;
    
  } catch (error) {
    console.error('خطأ عام في تحميل الاجتماعات:', error);
    return mockMeetings;
  }
};

// دالة مساعدة لتحديث البيانات من API في الخلفية
const updateMeetingsFromAPI = async (freelancerId: string, currentMeetings: any[]) => {
  try {
    const response = await fetch(`https://matc-backend.onrender.com/api/freelancer-meetings/freelancer/${freelancerId}`);
    if (response.ok) {
      const apiResponse = await response.json();
      let meetings = [];
      if (apiResponse.success && Array.isArray(apiResponse.data)) {
        meetings = apiResponse.data;
      } else if (Array.isArray(apiResponse)) {
        meetings = apiResponse;
      }
      
      if (meetings.length > 0) {
        // دمج البيانات: الاحتفاظ بالتحديثات المحلية وإضافة الجديد من API
        const mergedMeetings = [...currentMeetings];
        meetings.forEach((apiMeeting: any) => {
          const existingIndex = mergedMeetings.findIndex(m => m.id === (apiMeeting._id || apiMeeting.id));
          if (existingIndex === -1) {
            // اجتماع جديد من API
            const transformedMeeting = {
              id: apiMeeting._id || apiMeeting.id,
              title: apiMeeting.subject || apiMeeting.title,
              client: apiMeeting.withWhom || 'Client',
              date: apiMeeting.date,
              time: apiMeeting.startTime || apiMeeting.time,
              duration: apiMeeting.durationMinutes || 60,
              type: apiMeeting.type === 'visio' ? 'video_call' : 'client_meeting',
              status: apiMeeting.status || 'scheduled',
              meetingLink: apiMeeting.meetingLink || '',
              platform: detectPlatform(apiMeeting.meetingLink),
              participants: apiMeeting.participants || [],
              agenda: apiMeeting.agenda || '',
              notes: apiMeeting.notes || ''
            };
            mergedMeetings.push(transformedMeeting);
          }
        });
        
        // حفظ البيانات المدمجة
        localStorage.setItem('freelancerMeetings', JSON.stringify(mergedMeetings));
        console.log(`🔄 تم تحديث البيانات في الخلفية: ${mergedMeetings.length} اجتماعات`);
      }
    }
  } catch (error) {
    console.warn('خطأ في تحديث البيانات من API في الخلفية:', error);
  }
};

// دالة مساعدة لاكتشاف منصة الاجتماع
const detectPlatform = (meetingLink?: string): string => {
  if (!meetingLink) return 'Unknown';
  
  if (meetingLink.includes('meet.google.com')) return 'Google Meet';
  if (meetingLink.includes('zoom.us')) return 'Zoom';
  if (meetingLink.includes('teams.microsoft.com')) return 'Teams';
  if (meetingLink.includes('webex.com')) return 'Webex';
  
  return 'Other';
};
export const getProjects = (): Project[] => {
  try {
    // تحميل المشاريع من localStorage
    const savedProjects = JSON.parse(localStorage.getItem('freelancerProjects') || '[]');
    
    // دمج المشاريع المحفوظة مع mock projects (بدون تكرار)
    const allProjects = [...mockProjects];
    savedProjects.forEach((savedProject: Project) => {
      if (!allProjects.find(p => p.id === savedProject.id)) {
        allProjects.push(savedProject);
      }
    });
    
    console.log(`📊 تم تحميل ${allProjects.length} مشاريع (${savedProjects.length} من localStorage)`);
    return allProjects;
  } catch (error) {
    console.error('خطأ في تحميل المشاريع من localStorage:', error);
    return mockProjects;
  }
};
export const getDeliverables = (): Deliverable[] => mockDeliverables;
export const getProjectHistory = (): Project[] => mockProjectHistory;
