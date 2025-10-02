// Placeholder file for notifications system (disabled)
// This file exists only to prevent import errors

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'job' | 'info';
  date: string;
  isRead: boolean;
  actionUrl?: string;
  payload?: Record<string, unknown>;
}

// Empty functions to prevent errors
export const getNotifications = (): AdminNotification[] => [];
export const clearNotifications = (): void => {};
export const markAllRead = (): void => {};
export const subscribeNotifications = (callback: (notifications: AdminNotification[]) => void) => {
  // Return unsubscribe function
  return () => {};
};
