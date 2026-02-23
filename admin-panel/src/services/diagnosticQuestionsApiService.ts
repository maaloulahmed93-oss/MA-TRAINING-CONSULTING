import { API_BASE_URL } from '../config/api';

export type DiagnosticQuestionOption = {
  label: string;
  score: number;
};

export type DiagnosticQuestion = {
  _id: string;
  text: string;
  category: string;
  options: DiagnosticQuestionOption[];
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type DiagnosticQuestionInput = {
  text: string;
  category: string;
  options: DiagnosticQuestionOption[];
  isActive?: boolean;
  order?: number;
};

class DiagnosticQuestionsApiService {
  private getAuthHeaders(): Record<string, string> {
    const key =
      (import.meta as any).env?.VITE_ADMIN_API_KEY ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('admin_api_key') : null);

    const headers: Record<string, string> = {};
    if (key) headers['x-admin-key'] = String(key);
    return headers;
  }

  async list(params?: { activeOnly?: boolean }): Promise<{ success: boolean; data: DiagnosticQuestion[] }> {
    const qs = new URLSearchParams();
    if (params?.activeOnly) qs.set('activeOnly', 'true');

    const url = `${API_BASE_URL}/diagnostic-questions/admin${qs.toString() ? `?${qs.toString()}` : ''}`;
    const response = await fetch(url, { headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }

  async get(id: string): Promise<{ success: boolean; data: DiagnosticQuestion }> {
    const response = await fetch(`${API_BASE_URL}/diagnostic-questions/${id}`, { headers: this.getAuthHeaders() });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }

  async create(payload: DiagnosticQuestionInput): Promise<{ success: boolean; data: DiagnosticQuestion }> {
    const response = await fetch(`${API_BASE_URL}/diagnostic-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async update(id: string, payload: DiagnosticQuestionInput): Promise<{ success: boolean; data: DiagnosticQuestion }> {
    const response = await fetch(`${API_BASE_URL}/diagnostic-questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async remove(id: string): Promise<{ success: boolean; data?: { _id: string } }> {
    const response = await fetch(`${API_BASE_URL}/diagnostic-questions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async seed(): Promise<{ success: boolean; inserted?: number; message?: string; data?: DiagnosticQuestion[] }> {
    const response = await fetch(`${API_BASE_URL}/diagnostic-questions/seed`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export const diagnosticQuestionsApiService = new DiagnosticQuestionsApiService();
export default diagnosticQuestionsApiService;
