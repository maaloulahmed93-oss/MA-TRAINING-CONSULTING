import type { EspaceProAccount } from "../types/espaceProAccount";
import { API_BASE_URL } from "../config/api";

const STORAGE_KEY = "matc_espace_pro_accounts";

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

export function getAllLocal(): EspaceProAccount[] {
  const parsed = safeParse(localStorage.getItem(STORAGE_KEY));
  if (!Array.isArray(parsed)) return [];
  return (parsed as any[]).map((x) => ({
    id: String(x.id ?? x._id ?? ""),
    firstName: String(x.firstName ?? ""),
    lastName: String(x.lastName ?? ""),
    phone: String(x.phone ?? ""),
    isActive: typeof x.isActive === "boolean" ? x.isActive : true,
    createdAt: String(x.createdAt ?? new Date().toISOString()),
    updatedAt: String(x.updatedAt ?? new Date().toISOString()),
  })).filter((x) => x.id && x.firstName && x.lastName && x.phone);
}

export function saveAllLocal(list: EspaceProAccount[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function getAll(): Promise<EspaceProAccount[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/espace-pro-accounts`, {
      headers: { ...getAuthHeaders() },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = (await response.json()) as ApiResponse<EspaceProAccount[]>;
    if (!result.success || !Array.isArray(result.data)) throw new Error(result.message || "API error");
    saveAllLocal(result.data);
    return result.data;
  } catch {
    return getAllLocal();
  }
}

export async function createAccount(payload: {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  isActive?: boolean;
}): Promise<EspaceProAccount> {
  const response = await fetch(`${API_BASE_URL}/espace-pro-accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
  const result = JSON.parse(text) as ApiResponse<EspaceProAccount>;
  if (!result.success || !result.data) throw new Error(result.message || "API error");
  return result.data;
}

export async function updateAccount(
  id: string,
  payload: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    password?: string;
    isActive?: boolean;
  }
): Promise<EspaceProAccount> {
  const response = await fetch(`${API_BASE_URL}/espace-pro-accounts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
  const result = JSON.parse(text) as ApiResponse<EspaceProAccount>;
  if (!result.success || !result.data) throw new Error(result.message || "API error");
  return result.data;
}

export async function remove(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/espace-pro-accounts/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() },
  });

  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
}

export function getByIdLocal(id: string): EspaceProAccount | undefined {
  return getAllLocal().find((x) => x.id === id);
}
