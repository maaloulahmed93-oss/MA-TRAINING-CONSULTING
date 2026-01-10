import { API_BASE_URL } from '../config/api';
import type {
  ApiResponse,
  EspaceProDossier,
  EspaceProDocumentCategory,
  EspaceProDocumentVisibility,
  EspaceProPhaseStatus,
} from '../types/espaceProDossier';

class EspaceProDossiersApiService {
  private getAuthHeaders(): Record<string, string> {
    const key =
      (import.meta as any).env?.VITE_ADMIN_API_KEY ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('admin_api_key') : null);

    const headers: Record<string, string> = {};
    if (key) headers['x-admin-key'] = String(key);
    return headers;
  }

  async getDossier(accountId: string): Promise<ApiResponse<EspaceProDossier>> {
    const response = await fetch(`${API_BASE_URL}/espace-pro-dossiers/${accountId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async updateSituation(accountId: string, payload: { levelLabel: string; statusLabel: string }): Promise<ApiResponse<EspaceProDossier>> {
    const response = await fetch(`${API_BASE_URL}/espace-pro-dossiers/${accountId}/situation`, {
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

  async updateNotesVisible(accountId: string, payload: { notesVisibleToParticipant: string }): Promise<ApiResponse<EspaceProDossier>> {
    const response = await fetch(`${API_BASE_URL}/espace-pro-dossiers/${accountId}/notes-visible`, {
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

  async updatePhase(
    accountId: string,
    phaseId: number,
    payload: {
      status: EspaceProPhaseStatus;
      shortDescription: string;
      externalLinkUrl: string;
      setAsCurrent?: boolean;
    }
  ): Promise<ApiResponse<EspaceProDossier>> {
    const response = await fetch(`${API_BASE_URL}/espace-pro-dossiers/${accountId}/phases/${phaseId}`, {
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

  async addDecision(
    accountId: string,
    payload: { date: string; decisionType: string; phaseId: number; noteInternal?: string }
  ): Promise<ApiResponse<EspaceProDossier>> {
    const response = await fetch(`${API_BASE_URL}/espace-pro-dossiers/${accountId}/decisions`, {
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

  async addDocument(
    accountId: string,
    payload: {
      title: string;
      category: EspaceProDocumentCategory;
      phaseId?: number;
      documentUrl: string;
      visibility: EspaceProDocumentVisibility;
    }
  ): Promise<ApiResponse<EspaceProDossier>> {
    const response = await fetch(`${API_BASE_URL}/espace-pro-dossiers/${accountId}/documents`, {
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

  async deleteDocument(accountId: string, docId: string): Promise<ApiResponse<EspaceProDossier>> {
    const response = await fetch(`${API_BASE_URL}/espace-pro-dossiers/${accountId}/documents/${docId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export const espaceProDossiersApiService = new EspaceProDossiersApiService();
export default espaceProDossiersApiService;
