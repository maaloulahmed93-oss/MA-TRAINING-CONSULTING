// Mirror of site registration service for admin panel consumption via localStorage
export type RegistrationType = 'program' | 'pack';

export interface RegistrationBase {
  id: string;
  type: RegistrationType;
  itemId: string;
  itemName: string;
  price?: number;
  currency?: string;
  timestamp: string;
}

export interface ProgramRegistration extends RegistrationBase {
  type: 'program';
  sessionId: string;
  user: { firstName: string; lastName: string; email: string; whatsapp?: string };
}

export interface PackRegistration extends RegistrationBase {
  type: 'pack';
  user: { firstName: string; lastName: string; email: string; phone: string; message?: string };
}

export type Registration = ProgramRegistration | PackRegistration;

const STORAGE_KEY = 'matc_registrations_v1';

export const getRegistrations = (): Registration[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as Registration[]) : [];
  } catch {
    return [];
  }
};
