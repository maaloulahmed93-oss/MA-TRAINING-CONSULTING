export interface Subscriber {
  id: string;
  email: string;
  status: 'subscribed' | 'unsubscribed';
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

const STORAGE_KEY = 'matc_newsletter_subscribers_v1';

const read = (): Subscriber[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as Subscriber[]) : [];
  } catch {
    return [];
  }
};

const write = (arr: Subscriber[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
};

export const getSubscribers = (): Subscriber[] => read();

export const addSubscriber = (email: string): Subscriber => {
  const now = new Date().toISOString();
  const all = read();
  const lower = email.toLowerCase();
  const existing = all.find(s => s.email.toLowerCase() === lower);
  if (existing) {
    if (existing.status === 'unsubscribed') {
      existing.status = 'subscribed';
      existing.updatedAt = now;
      write(all);
    }
    return existing;
  }
  const s: Subscriber = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    email,
    status: 'subscribed',
    createdAt: now,
    updatedAt: now,
  };
  all.unshift(s);
  write(all);
  return s;
};

export const unsubscribeByEmail = (email: string): boolean => {
  const all = read();
  const lower = email.toLowerCase();
  const item = all.find(s => s.email.toLowerCase() === lower);
  if (!item) return false;
  item.status = 'unsubscribed';
  item.updatedAt = new Date().toISOString();
  write(all);
  return true;
};

export const setSubscriberStatus = (id: string, status: Subscriber['status']): boolean => {
  const all = read();
  const idx = all.findIndex(s => s.id === id);
  if (idx === -1) return false;
  all[idx].status = status;
  all[idx].updatedAt = new Date().toISOString();
  write(all);
  return true;
};
