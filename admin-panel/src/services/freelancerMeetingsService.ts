import { FreelancerMeeting } from '../types/freelancers';

const STORAGE_KEY = 'freelancer_meetings';

const readAll = (): FreelancerMeeting[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as FreelancerMeeting[]; } catch { return []; }
};

const writeAll = (items: FreelancerMeeting[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const listMeetings = (): FreelancerMeeting[] => readAll().sort((a,b)=> (b.updatedAt>a.updatedAt?1:-1));
export const getMeeting = (id: string): FreelancerMeeting | undefined => readAll().find(m => m.id === id);

export const createMeeting = (input: Omit<FreelancerMeeting,'id'|'createdAt'|'updatedAt'>): FreelancerMeeting => {
  const now = new Date().toISOString();
  const meeting: FreelancerMeeting = { id: `MEET-${Date.now()}`, createdAt: now, updatedAt: now, ...input };
  const all = readAll();
  all.push(meeting);
  writeAll(all);
  return meeting;
};

export const updateMeeting = (id: string, patch: Partial<FreelancerMeeting>): FreelancerMeeting | undefined => {
  const all = readAll();
  const idx = all.findIndex(m => m.id === id);
  if (idx === -1) return undefined;
  const updated: FreelancerMeeting = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  all[idx] = updated;
  writeAll(all);
  return updated;
};

export const deleteMeeting = (id: string): boolean => {
  const all = readAll();
  const next = all.filter(m => m.id !== id);
  writeAll(next);
  return next.length !== all.length;
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
