// Simple client-side registration storage using localStorage
// Shared by program and pack enrollment forms

export type RegistrationType = 'program' | 'pack';

export interface RegistrationBase {
  id: string;
  type: RegistrationType;
  itemId: string; // program.id or pack.packId
  itemName: string; // program.title or pack.name
  price?: number; // numeric price at time of submission
  currency?: string; // selected currency symbol/code (€, $, DTN, ...)
  timestamp: string; // ISO string
}

export interface ProgramRegistration extends RegistrationBase {
  type: 'program';
  sessionId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    whatsapp?: string;
  };
}

export interface PackRegistration extends RegistrationBase {
  type: 'pack';
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message?: string;
  };
}

export type Registration = ProgramRegistration | PackRegistration;

const STORAGE_KEY = 'matc_registrations_v1';

export const getRegistrations = (): Registration[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Registration[];
    return [];
  } catch {
    return [];
  }
};

export const addRegistration = (entry: Registration): void => {
  const all = getRegistrations();
  all.unshift(entry); // newest first
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
};

export const clearRegistrations = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
