import { FreelancerOffer } from '../types/freelancers';

import { API_BASE_URL } from '../config/api';
const API_BASE = `${API_BASE_URL}/freelancer-offers`;
const STORAGE_KEY = 'freelancer_offers';

// Fallback functions للـ localStorage (للتوافق مع النسخة القديمة)
const readAll = (): FreelancerOffer[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FreelancerOffer[];
  } catch {
    return [];
  }
};

const writeAll = (items: FreelancerOffer[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

// New API-based functions
export const listOffers = async (): Promise<FreelancerOffer[]> => {
  try {
    const response = await fetch(API_BASE);
    const result = await response.json();
    
    if (result.success) {
      return result.data.map((offer: any) => ({
        ...offer,
        id: offer._id, // تحويل MongoDB _id إلى id
        createdAt: offer.createdAt || new Date().toISOString(),
        updatedAt: offer.updatedAt || new Date().toISOString()
      }));
    }
    
    // Fallback إلى localStorage في حالة فشل API
    console.warn('فشل في جلب العروض من API، استخدام localStorage');
    return readAll().sort((a,b)=> (b.updatedAt>a.updatedAt?1:-1));
    
  } catch (error) {
    console.error('خطأ في الاتصال بـ API:', error);
    // Fallback إلى localStorage
    return readAll().sort((a,b)=> (b.updatedAt>a.updatedAt?1:-1));
  }
};

export const getOffer = async (id: string): Promise<FreelancerOffer | undefined> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`);
    const result = await response.json();
    
    if (result.success) {
      return {
        ...result.data,
        id: result.data._id
      };
    }
    
    // Fallback إلى localStorage
    return readAll().find(o => o.id === id);
    
  } catch (error) {
    console.error('خطأ في جلب العرض:', error);
    return readAll().find(o => o.id === id);
  }
};

export const createOffer = async (input: Omit<FreelancerOffer, 'id'|'createdAt'|'updatedAt'>): Promise<FreelancerOffer> => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input)
    });
    
    const result = await response.json();
    
    if (result.success) {
      return {
        ...result.data,
        id: result.data._id
      };
    } else {
      throw new Error(result.message || 'فشل في إنشاء العرض');
    }
    
  } catch (error) {
    console.error('خطأ في إنشاء العرض:', error);
    
    // Fallback إلى localStorage
    const now = new Date().toISOString();
    const offer: FreelancerOffer = { id: `OFF-${Date.now()}`, createdAt: now, updatedAt: now, ...input };
    const all = readAll();
    all.push(offer);
    writeAll(all);
    return offer;
  }
};

export const updateOffer = async (id: string, patch: Partial<FreelancerOffer>): Promise<FreelancerOffer | undefined> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patch)
    });
    
    const result = await response.json();
    
    if (result.success) {
      return {
        ...result.data,
        id: result.data._id
      };
    } else {
      throw new Error(result.message || 'فشل في تحديث العرض');
    }
    
  } catch (error) {
    console.error('خطأ في تحديث العرض:', error);
    
    // Fallback إلى localStorage
    const all = readAll();
    const idx = all.findIndex(o => o.id === id);
    if (idx === -1) return undefined;
    const updated: FreelancerOffer = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
    all[idx] = updated;
    writeAll(all);
    return updated;
  }
};

export const deleteOffer = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      return true;
    } else {
      throw new Error(result.message || 'فشل في حذف العرض');
    }
    
  } catch (error) {
    console.error('خطأ في حذف العرض:', error);
    
    // Fallback إلى localStorage
    const all = readAll();
    const next = all.filter(o => o.id !== id);
    writeAll(next);
    return next.length !== all.length;
  }
};

export const seedOffersIfEmpty = async () => {
  try {
    // تحقق من وجود عروض في API أولاً
    const offers = await listOffers();
    if (offers.length > 0) return;
    
    // إنشاء عرض تجريبي
    const demo = {
      title: 'Frontend React Developer',
      company: 'TechStart',
      locationType: 'remote' as const,
      contractType: 'full-time' as const,
      description: 'Build UI features and collaborate with the team.',
      skills: ['React','TypeScript','Tailwind'],
      visibility: 'all' as const,
      status: 'published' as const,
      currency: 'TND' as const,
      salaryMin: 2500,
      salaryMax: 3500,
      tags: ['remote','urgent'],
    };
    
    await createOffer(demo);
    
  } catch (error) {
    console.error('خطأ في إنشاء البيانات التجريبية:', error);
    
    // Fallback إلى localStorage
    if (readAll().length > 0) return;
    const now = new Date().toISOString();
    const demo: FreelancerOffer = {
      id: 'OFF-DEMO-1',
      title: 'Frontend React Developer',
      company: 'TechStart',
      locationType: 'remote',
      contractType: 'full-time',
      description: 'Build UI features and collaborate with the team.',
      skills: ['React','TypeScript','Tailwind'],
      visibility: 'all',
      status: 'published',
      currency: 'TND',
      salaryMin: 2500,
      salaryMax: 3500,
      tags: ['remote','urgent'],
      createdAt: now,
      updatedAt: now,
    };
    writeAll([demo]);
  }
};

// دالة جديدة لجلب قائمة الفريلانسرز المتاحين
export const getAvailableFreelancers = async (): Promise<{id: string, name: string, email: string}[]> => {
  try {
    const response = await fetch(`${API_BASE}/available-freelancers`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    }
    
    return [];
    
  } catch (error) {
    console.error('خطأ في جلب قائمة الفريلانسرز:', error);
    return [];
  }
};
