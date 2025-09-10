// Admin notifications store with localStorage persistence
// Shared by user-facing actions via relative import

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'job' | 'info';
  date: string; // ISO string
  isRead: boolean;
  actionUrl?: string;
  payload?: Record<string, unknown>;
}

const STORAGE_KEY = 'admin_notifications';

const load = (): AdminNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: AdminNotification[] = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const save = (list: AdminNotification[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
};

const notifications: AdminNotification[] = load();

export const getNotifications = (): AdminNotification[] => notifications;

export const addAdminNotification = (n: Omit<AdminNotification, 'id' | 'date' | 'isRead'> & Partial<Pick<AdminNotification, 'actionUrl'>>): void => {
  notifications.unshift({
    id: Date.now().toString(),
    title: n.title,
    message: n.message,
    type: n.type,
    date: new Date().toISOString(),
    isRead: false,
    actionUrl: n.actionUrl,
    payload: n.payload,
  });
  save(notifications);
};

export const markAllRead = (): void => {
  notifications.forEach(n => (n.isRead = true));
  save(notifications);
};

export const clearNotifications = (): void => {
  notifications.splice(0, notifications.length);
  save(notifications);
};

// Optional: simple subscribers for live UI updates
type Listener = (all: AdminNotification[]) => void;
const listeners = new Set<Listener>();
export const subscribeNotifications = (cb: Listener): (() => void) => {
  listeners.add(cb);
  // immediate push
  cb([...notifications]);
  return () => listeners.delete(cb);
};

// Notify listeners on mutations
const _origAdd = addAdminNotification;
export { _origAdd as _internal_addAdminNotificationDoNotUse };
// Re-define add to also notify listeners
export const addAdminNotificationWithBroadcast = (
  n: Omit<AdminNotification, 'id' | 'date' | 'isRead'> & Partial<Pick<AdminNotification, 'actionUrl'>>
): void => {
  addAdminNotification(n);
  listeners.forEach(l => l([...notifications]));
};
