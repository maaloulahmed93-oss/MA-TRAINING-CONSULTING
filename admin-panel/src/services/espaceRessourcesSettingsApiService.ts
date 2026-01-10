import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/espace-ressources-settings`;

export type EspaceRessourcesSettings = {
  _id?: string;
  accessCode: string;
  bonusCode: string;
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

class EspaceRessourcesSettingsApiService {
  async getSettings(): Promise<EspaceRessourcesSettings | null> {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = (await response.json()) as ApiResponse<EspaceRessourcesSettings>;
      if (result.success && result.data) return result.data;
      return null;
    } catch {
      return null;
    }
  }

  async updateSettings(
    payload: Omit<EspaceRessourcesSettings, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<EspaceRessourcesSettings | null> {
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

      const result = (await response.json()) as ApiResponse<EspaceRessourcesSettings>;
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

export const espaceRessourcesSettingsApiService =
  new EspaceRessourcesSettingsApiService();
export default EspaceRessourcesSettingsApiService;
