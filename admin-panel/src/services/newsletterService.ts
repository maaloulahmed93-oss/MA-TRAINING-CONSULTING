export interface Subscriber {
  id: string;
  email: string;
  status: 'subscribed' | 'unsubscribed';
  createdAt: string;
  updatedAt: string;
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

export const setSubscriberStatus = (id: string, status: Subscriber['status']): boolean => {
  const all = read();
  const idx = all.findIndex(s => s.id === id);
  if (idx === -1) return false;
  all[idx].status = status;
  all[idx].updatedAt = new Date().toISOString();
  write(all);
  return true;
};

export const removeSubscriber = (id: string): boolean => {
  const all = read();
  const next = all.filter(s => s.id !== id);
  if (next.length === all.length) return false;
  write(next);
  return true;
};
