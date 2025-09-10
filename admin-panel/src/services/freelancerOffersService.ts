import { FreelancerOffer } from '../types/freelancers';

const STORAGE_KEY = 'freelancer_offers';

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

export const listOffers = (): FreelancerOffer[] => readAll().sort((a,b)=> (b.updatedAt>a.updatedAt?1:-1));

export const getOffer = (id: string): FreelancerOffer | undefined => readAll().find(o => o.id === id);

export const createOffer = (input: Omit<FreelancerOffer, 'id'|'createdAt'|'updatedAt'>): FreelancerOffer => {
  const now = new Date().toISOString();
  const offer: FreelancerOffer = { id: `OFF-${Date.now()}`, createdAt: now, updatedAt: now, ...input };
  const all = readAll();
  all.push(offer);
  writeAll(all);
  return offer;
};

export const updateOffer = (id: string, patch: Partial<FreelancerOffer>): FreelancerOffer | undefined => {
  const all = readAll();
  const idx = all.findIndex(o => o.id === id);
  if (idx === -1) return undefined;
  const updated: FreelancerOffer = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  all[idx] = updated;
  writeAll(all);
  return updated;
};

export const deleteOffer = (id: string): boolean => {
  const all = readAll();
  const next = all.filter(o => o.id !== id);
  writeAll(next);
  return next.length !== all.length;
};

export const seedOffersIfEmpty = () => {
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
};
