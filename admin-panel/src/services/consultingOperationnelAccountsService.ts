import { API_BASE_URL } from "../config/api";
import type {
  ConsultingOperationnelAccount,
  ConsultingOperationnelSituation,
} from "../types/consultingOperationnelAccount";

const STORAGE_KEY = "matc_consulting_operationnel_accounts";
const API_URL = `${API_BASE_URL}/consulting-operationnel-accounts`;

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
};

function safeParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getAuthHeaders(): Record<string, string> {
  const key =
    (import.meta as any).env?.VITE_ADMIN_API_KEY ||
    (typeof localStorage !== "undefined" ? localStorage.getItem("admin_api_key") : null);

  const headers: Record<string, string> = {};
  if (key) headers["x-admin-key"] = String(key);
  return headers;
}

export function getAllLocal(): ConsultingOperationnelAccount[] {
  const parsed = safeParse(localStorage.getItem(STORAGE_KEY));
  if (!Array.isArray(parsed)) return [];
  return (parsed as any[])
    .map((x) => ({
      id: String(x.id ?? x._id ?? ""),
      participantId: String(x.participantId ?? ""),
      isActive: typeof x.isActive === "boolean" ? x.isActive : true,
      firstName: String(x.firstName ?? ""),
      lastName: String(x.lastName ?? ""),
      email: String(x.email ?? ""),
      entreprise: String(x.entreprise ?? ""),
      notesAdmin: String(x.notesAdmin ?? ""),
      situation: (x.situation && typeof x.situation === "object" ? (x.situation as ConsultingOperationnelSituation) : undefined),
      createdAt: String(x.createdAt ?? new Date().toISOString()),
      updatedAt: String(x.updatedAt ?? new Date().toISOString()),
    }))
    .filter((x) => x.id && x.participantId);
}

export function saveAllLocal(list: ConsultingOperationnelAccount[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function getAll(): Promise<ConsultingOperationnelAccount[]> {
  try {
    const response = await fetch(API_URL, {
      headers: { ...getAuthHeaders() },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = (await response.json()) as ApiResponse<ConsultingOperationnelAccount[]>;
    if (!result.success || !Array.isArray(result.data)) throw new Error(result.message || "API error");
    saveAllLocal(result.data);
    return result.data;
  } catch {
    return getAllLocal();
  }
}

export async function createAccount(payload: {
  participantId: string;
  password?: string;
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  entreprise?: string;
  notesAdmin?: string;
  situation?: ConsultingOperationnelSituation;
}): Promise<{ account: ConsultingOperationnelAccount; generatedPassword?: string }>{
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
  const result = JSON.parse(text) as ApiResponse<{ account: ConsultingOperationnelAccount; generatedPassword?: string }>;
  if (!result.success || !result.data) throw new Error(result.message || "API error");
  return result.data;
}

export async function updateAccount(
  id: string,
  payload: {
    participantId?: string;
    password?: string;
    isActive?: boolean;
    firstName?: string;
    lastName?: string;
    email?: string;
    entreprise?: string;
    notesAdmin?: string;
    situation?: ConsultingOperationnelSituation;
  }
): Promise<{ account: ConsultingOperationnelAccount }>{
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
  const result = JSON.parse(text) as ApiResponse<{ account: ConsultingOperationnelAccount }>;
  if (!result.success || !result.data) throw new Error(result.message || "API error");
  return result.data;
}

export async function remove(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });

  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
}
