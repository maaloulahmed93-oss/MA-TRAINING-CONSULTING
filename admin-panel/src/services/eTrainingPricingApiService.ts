import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/e-training-pricing`;

export type ETrainingPricingSettings = {
  _id?: string;
  totalPrice: number;
  currency: string;
  defaultDisplayCurrency?: string;
  exchangeRates?: Record<string, number>;
  service1Price: number;
  service2Price: number;
  service3Price: number;
  service1Duration?: string;
  service2Duration?: string;
  service3Duration?: string;
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

function getAuthHeaders(): Record<string, string> {
  const key =
    (import.meta as any).env?.VITE_ADMIN_API_KEY ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('admin_api_key') : null);

  const headers: Record<string, string> = {};
  if (key) headers['x-admin-key'] = String(key);
  return headers;
}

class ETrainingPricingApiService {
  async getSettings(): Promise<ETrainingPricingSettings | null> {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = (await response.json()) as ApiResponse<ETrainingPricingSettings>;
      if (result.success && result.data) return result.data;
      return null;
    } catch {
      return null;
    }
  }

  async updateSettings(payload: Omit<ETrainingPricingSettings, '_id' | 'createdAt' | 'updatedAt'>): Promise<ETrainingPricingSettings | null> {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          ...payload,
          updatedBy: 'admin-panel',
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = (await response.json()) as ApiResponse<ETrainingPricingSettings>;
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

export const eTrainingPricingApiService = new ETrainingPricingApiService();
export default ETrainingPricingApiService;
