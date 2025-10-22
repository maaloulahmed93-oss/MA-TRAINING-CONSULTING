import { Project } from '../types/freelancer';

const API_BASE = 'https://matc-backend.onrender.com/api/freelancer-projects';

// جلب مشاريع الفريلانسر
export const getFreelancerProjects = async (freelancerId: string, status?: string): Promise<Project[]> => {
  try {
    const url = status 
      ? `${API_BASE}/for-freelancer/${freelancerId}?status=${status}`
      : `${API_BASE}/for-freelancer/${freelancerId}`;
      
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.success) {
      return result.data.map((project: any) => ({
        id: project._id,
        title: project.title,
        description: project.description,
        client: project.client,
        status: project.status,
        progress: project.progress || 0,
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        budget: project.budget || 0,
        teamMembers: project.teamMembers || [],
        milestones: [], // يمكن إضافتها لاحقاً
        // حقول إضافية من FreelancerProject
        priority: project.priority || 'medium',
        skills: project.skills || [],
        workMode: project.workMode || 'remote',
        estimatedHours: project.estimatedHours || 0,
        deliverables: [], // يمكن إضافتها لاحقاً
        originalOfferId: project.originalOfferId
      }));
    }
    
    return [];
    
  } catch (error) {
    console.error('خطأ في جلب مشاريع الفريلانسر:', error);
    return [];
  }
};

// جلب تفاصيل مشروع محدد
export const getProjectDetails = async (projectId: string): Promise<Project | null> => {
  try {
    const response = await fetch(`${API_BASE}/${projectId}`);
    const result = await response.json();
    
    if (result.success) {
      const project = result.data;
      return {
        id: project._id,
        title: project.title,
        description: project.description,
        client: project.client,
        status: project.status,
        progress: project.progress || 0,
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        budget: project.budget || 0,
        teamMembers: project.teamMembers || [],
        milestones: [],
        priority: project.priority || 'medium',
        skills: project.skills || [],
        workMode: project.workMode || 'remote',
        estimatedHours: project.estimatedHours || 0,
        deliverables: [],
        originalOfferId: project.originalOfferId
      };
    }
    
    return null;
    
  } catch (error) {
    console.error('خطأ في جلب تفاصيل المشروع:', error);
    return null;
  }
};

// تحديث تقدم المشروع
export const updateProjectProgress = async (projectId: string, progress: number, notes?: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${projectId}/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ progress, notes })
    });
    
    const result = await response.json();
    return result.success;
    
  } catch (error) {
    console.error('خطأ في تحديث تقدم المشروع:', error);
    return false;
  }
};

// تحديث مشروع
export const updateProject = async (projectId: string, updateData: Partial<Project>): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    const result = await response.json();
    return result.success;
    
  } catch (error) {
    console.error('خطأ في تحديث المشروع:', error);
    return false;
  }
};

// جلب إحصائيات مشاريع الفريلانسر
export const getFreelancerProjectStats = async (freelancerId: string): Promise<{
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalEarnings: number;
  averageProgress: number;
  successRate: number;
}> => {
  try {
    const response = await fetch(`${API_BASE}/stats/${freelancerId}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      onHoldProjects: 0,
      totalEarnings: 0,
      averageProgress: 0,
      successRate: 0
    };
    
  } catch (error) {
    console.error('خطأ في جلب إحصائيات المشاريع:', error);
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      onHoldProjects: 0,
      totalEarnings: 0,
      averageProgress: 0,
      successRate: 0
    };
  }
};
