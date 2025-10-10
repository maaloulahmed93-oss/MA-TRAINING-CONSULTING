import { FreelancerMeeting } from '../types/freelancers';

import { API_BASE_URL } from '../config/api';
import { API_BASE_URL } from '../config/api';
const STORAGE_KEY = 'freelancer_meetings';

// Fallback functions for localStorage
const readAll = (): FreelancerMeeting[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as FreelancerMeeting[]; } catch { return []; }
};

const writeAll = (items: FreelancerMeeting[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

// API functions
export const listMeetings = async (): Promise<FreelancerMeeting[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/freelancer-meetings`, {
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
      console.log(`📅 تم جلب ${data.data.length} اجتماع من API`);
      return data.data;
    }

    return [];
  } catch (error) {
    console.error('خطأ في جلب الاجتماعات من API، استخدام localStorage:', error);
    return readAll().sort((a,b)=> (b.updatedAt>a.updatedAt?1:-1));
  }
};

export const getMeeting = async (id: string): Promise<FreelancerMeeting | undefined> => {
  try {
    const response = await fetch(`${API_BASE_URL}/freelancer-meetings/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return undefined;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    }

    return undefined;
  } catch (error) {
    console.error('خطأ في جلب تفاصيل الاجتماع من API، استخدام localStorage:', error);
    return readAll().find(m => m.id === id);
  }
};

export const createMeeting = async (input: Omit<FreelancerMeeting,'id'|'createdAt'|'updatedAt'>): Promise<FreelancerMeeting> => {
  try {
    const response = await fetch(`${API_BASE_URL}/freelancer-meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      console.log(`✅ تم إنشاء اجتماع جديد: ${data.data.subject}`);
      return data.data;
    }

    throw new Error('فشل في إنشاء الاجتماع');
  } catch (error) {
    console.error('خطأ في إنشاء الاجتماع عبر API، استخدام localStorage:', error);
    // Fallback to localStorage
    const now = new Date().toISOString();
    const meeting: FreelancerMeeting = { id: `MEET-${Date.now()}`, createdAt: now, updatedAt: now, ...input };
    const all = readAll();
    all.push(meeting);
    writeAll(all);
    return meeting;
  }
};

export const updateMeeting = async (id: string, patch: Partial<FreelancerMeeting>): Promise<FreelancerMeeting | undefined> => {
  try {
    const response = await fetch(`${API_BASE_URL}/freelancer-meetings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patch),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      console.log(`📝 تم تحديث الاجتماع: ${data.data.subject}`);
      return data.data;
    }

    return undefined;
  } catch (error) {
    console.error('خطأ في تحديث الاجتماع عبر API، استخدام localStorage:', error);
    // Fallback to localStorage
    const all = readAll();
    const idx = all.findIndex(m => m.id === id);
    if (idx === -1) return undefined;
    const updated: FreelancerMeeting = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
    all[idx] = updated;
    writeAll(all);
    return updated;
  }
};

export const deleteMeeting = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/freelancer-meetings/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('🗑️ تم حذف الاجتماع بنجاح');
      return true;
    }

    return false;
  } catch (error) {
    console.error('خطأ في حذف الاجتماع عبر API، استخدام localStorage:', error);
    // Fallback to localStorage
    const all = readAll();
    const next = all.filter(m => m.id !== id);
    writeAll(next);
    return next.length !== all.length;
  }
};

export const seedMeetingsIfEmpty = () => {
  if (readAll().length > 0) return;
  const now = new Date().toISOString();
  const demo: FreelancerMeeting = {
    id: 'MEET-DEMO-1',
    subject: 'Entretien technique React',
    type: 'visio',
    date: new Date().toISOString().slice(0,10),
    startTime: '10:00',
    endTime: '11:00',
    timezone: 'Africa/Tunis',
    meetingLink: 'https://meet.google.com/demo',
    withWhom: 'TechStart - Lead Eng.',
    agenda: ['Intro','React patterns','Q&A'],
    participantFreelancerIds: [],
    status: 'scheduled',
    createdAt: now,
    updatedAt: now,
  };
  writeAll([demo]);
};
