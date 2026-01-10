import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/consulting-operationnel-settings`;

export type ConsultingOperationnelSettings = {
  _id?: string;
  posteIntitule: string;
  entrepriseSecteur: string;
  element1: string;
  element2: string;
  difficulte1: string;
  difficulte2: string;
  demandeDirection: string;
  session1DateTime?: string;
  session1VideoUrl?: string;
  session2DateTime?: string;
  session2VideoUrl?: string;
  session3DateTime?: string;
  session3VideoUrl?: string;
  updatedBy?: string;
  updatedAt?: string;
  createdAt?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

class ConsultingOperationnelSettingsApiService {
  async getSettings(): Promise<ConsultingOperationnelSettings | null> {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = (await response.json()) as ApiResponse<ConsultingOperationnelSettings>;
      if (result.success && result.data) return result.data;
      return null;
    } catch {
      return null;
    }
  }

  async updateSettings(
    payload: Omit<ConsultingOperationnelSettings, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<ConsultingOperationnelSettings | null> {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          updatedBy: 'admin-panel',
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = (await response.json()) as ApiResponse<ConsultingOperationnelSettings>;
      if (result.success && result.data) return result.data;
      return null;
    } catch {
      return null;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const consultingOperationnelSettingsApiService = new ConsultingOperationnelSettingsApiService();
export default ConsultingOperationnelSettingsApiService;
