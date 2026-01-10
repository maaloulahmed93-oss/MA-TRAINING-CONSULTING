import { API_BASE_URL } from '../config/api';

export type ParticipationStatus = 'Complétée' | 'En cours' | 'Active';

export interface ParticipationVerificationRecord {
  _id: string;
  participationId: string;
  fullName: string;
  status: ParticipationStatus;
  servicesList?: string[];
  services: {
    service1: boolean;
    service2: boolean;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateParticipationVerificationPayload {
  participationId?: string;
  fullName: string;
  status?: ParticipationStatus;
  servicesList?: string[];
  services?: {
    service1?: boolean;
    service2?: boolean;
  };
  isActive?: boolean;
}

export interface UpdateParticipationVerificationPayload {
  fullName?: string;
  status?: ParticipationStatus;
  servicesList?: string[];
  services?: {
    service1?: boolean;
    service2?: boolean;
  };
  isActive?: boolean;
}

const getAdminKeyHeader = (): Record<string, string> => {
  const key = (import.meta as any).env?.VITE_ADMIN_API_KEY as string | undefined;
  return key ? { 'x-admin-key': key } : {};
};

class ParticipationVerificationsApiService {
  async list(q?: string): Promise<ParticipationVerificationRecord[]> {
    const params = new URLSearchParams();
    if (q && q.trim()) params.set('q', q.trim());

    const response = await fetch(`${API_BASE_URL}/participation-verifications?${params}`, {
      headers: {
        ...getAdminKeyHeader(),
      },
    });

    const json = await response.json().catch(() => null);
    if (!response.ok || !json?.success) {
      throw new Error(json?.message || 'Erreur lors de la récupération');
    }
    return Array.isArray(json.data) ? json.data : [];
  }

  async create(payload: CreateParticipationVerificationPayload): Promise<ParticipationVerificationRecord> {
    const response = await fetch(`${API_BASE_URL}/participation-verifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminKeyHeader(),
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json().catch(() => null);
    if (!response.ok || !json?.success) {
      throw new Error(json?.message || 'Erreur lors de la création');
    }
    return json.data;
  }

  async update(participationId: string, payload: UpdateParticipationVerificationPayload): Promise<ParticipationVerificationRecord> {
    const response = await fetch(`${API_BASE_URL}/participation-verifications/${encodeURIComponent(participationId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminKeyHeader(),
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json().catch(() => null);
    if (!response.ok || !json?.success) {
      throw new Error(json?.message || 'Erreur lors de la mise à jour');
    }
    return json.data;
  }

  async remove(participationId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/participation-verifications/${encodeURIComponent(participationId)}`, {
      method: 'DELETE',
      headers: {
        ...getAdminKeyHeader(),
      },
    });

    const json = await response.json().catch(() => null);
    if (!response.ok || !json?.success) {
      throw new Error(json?.message || 'Erreur lors de la suppression');
    }
  }
}

export const participationVerificationsApiService = new ParticipationVerificationsApiService();
