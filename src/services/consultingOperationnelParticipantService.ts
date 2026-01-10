import { API_BASE_URL } from '../config/api';

export type ConsultingOperationnelSession = {
  accountId: string;
  participantId: string;
  token: string;
  createdAt: number;
};

export type ConsultingOperationnelSituation = {
  posteIntitule: string;
  entrepriseSecteur: string;
  element1: string;
  element2: string;
  difficulte1: string;
  difficulte2: string;
  demandeDirection: string;
  session1DateTime: string;
  session1VideoUrl: string;
  session2DateTime: string;
  session2VideoUrl: string;
  session3DateTime: string;
  session3VideoUrl: string;
};

const SESSION_STORAGE_KEY = 'consultingOperationnelSession_v1';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
};

export function getSession(): ConsultingOperationnelSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsultingOperationnelSession;
  } catch {
    return null;
  }
}

export async function getSituation(token: string): Promise<ConsultingOperationnelSituation | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/consulting-operationnel-accounts/situation`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;

    const result = (await response.json()) as ApiResponse<{ situation: ConsultingOperationnelSituation }>;
    if (!result.success) return null;

    return result.data?.situation ?? null;
  } catch {
    return null;
  }
}

export function saveSession(session: ConsultingOperationnelSession): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function login(payload: {
  participantId: string;
  password: string;
}): Promise<ConsultingOperationnelSession> {
  const response = await fetch(`${API_BASE_URL}/consulting-operationnel-accounts/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);

  const result = JSON.parse(text) as ApiResponse<{
    account: { id: string; participantId: string };
    token: string;
  }>;

  if (!result.success || !result.data) throw new Error(result.message || 'Login error');

  const session: ConsultingOperationnelSession = {
    accountId: String(result.data.account.id),
    participantId: String(result.data.account.participantId),
    token: String(result.data.token),
    createdAt: Date.now(),
  };

  saveSession(session);
  return session;
}

export async function me(token: string): Promise<{ accountId: string; participantId: string } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/consulting-operationnel-accounts/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;

    const result = (await response.json()) as ApiResponse<{ account: { id: string; participantId: string } }>;
    if (!result.success || !result.data?.account) return null;

    return {
      accountId: String(result.data.account.id),
      participantId: String(result.data.account.participantId),
    };
  } catch {
    return null;
  }
}

export async function getAnswers(token: string): Promise<Record<string, any> | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/consulting-operationnel-accounts/answers`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;

    const result = (await response.json()) as ApiResponse<Record<string, any>>;
    if (!result.success) return null;

    return result.data ?? {};
  } catch {
    return null;
  }
}

export async function saveAnswers(token: string, answers: Record<string, any>): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/consulting-operationnel-accounts/answers`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ answers }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export function answersStorageKeyForParticipant(participantId: string): string {
  const safe = String(participantId || '').trim().toUpperCase() || 'anonymous';
  return `consultingOperationnelAnswers_v1:${safe}`;
}
