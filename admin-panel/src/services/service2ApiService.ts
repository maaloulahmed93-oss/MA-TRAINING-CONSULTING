import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/service2`;

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
};

function getAuthHeaders(): Record<string, string> {
  const key =
    (import.meta as any).env?.VITE_ADMIN_API_KEY ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('admin_api_key') : null);

  const headers: Record<string, string> = {};
  if (key) headers['x-admin-key'] = String(key);
  return headers;
}

export type Service2ExamDto = {
  id: string;
  title: string;
  scenarioBrief: string;
  constraints: string[];
  successCriteria: string[];
  tasks: { id: string; title?: string; prompt?: string }[];
  verdictRules: any[];
  assignedAccountId: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Service2FinishSlotDto = {
  _id: string;
  title: string;
  startAt: string;
  endAt?: string;
  isActive: boolean;
  assignedAccountId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Service2SubmissionDto = {
  id: string;
  taskId: string;
  attempt: number;
  submissionText: string;
  aiAnalysis: any;
  createdAt?: string;
};

export type Service2AccountHistoryDto = {
  account: {
    id: string;
    participantId: string;
    isActive: boolean;
    notesAdmin: string;
    createdAt?: string;
  };
  exam: Service2ExamDto;
  submissions: Service2SubmissionDto[];
  actionPlan: any;
  finalReport: any;
};

export async function listService2Exams(): Promise<Service2ExamDto[]> {
  const response = await fetch(`${API_URL}/exams`, { headers: { ...getAuthHeaders() } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = (await response.json()) as ApiResponse<Service2ExamDto[]>;
  if (!result.success || !Array.isArray(result.data)) throw new Error(result.message || 'API error');
  return result.data;
}

export async function createService2Exam(payload: {
  title?: string;
  scenarioBrief: string;
  constraints?: string[];
  successCriteria?: string[];
  tasks?: { id: string; title?: string; prompt?: string }[];
  verdictRules?: any[];
  assignedAccountId?: string;
  isActive?: boolean;
}): Promise<Service2ExamDto> {
  const response = await fetch(`${API_URL}/create-exam`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
  const result = JSON.parse(text) as ApiResponse<{ exam: Service2ExamDto }>;
  if (!result.success || !result.data?.exam) throw new Error(result.message || 'API error');
  return result.data.exam;
}

export async function listAdminFinishSlots(): Promise<Service2FinishSlotDto[]> {
  const response = await fetch(`${API_URL}/admin/finish-slots`, { headers: { ...getAuthHeaders() } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = (await response.json()) as ApiResponse<{ slots: Service2FinishSlotDto[] }>;
  if (!result.success || !result.data?.slots) throw new Error(result.message || 'API error');
  return result.data.slots;
}

export async function createFinishSlot(payload: {
  title?: string;
  startAt: string;
  endAt?: string;
  isActive?: boolean;
  assignedAccountId: string;
}): Promise<Service2FinishSlotDto> {
  const response = await fetch(`${API_URL}/finish-slots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
  const result = JSON.parse(text) as ApiResponse<{ slot: Service2FinishSlotDto }>;
  if (!result.success || !result.data?.slot) throw new Error(result.message || 'API error');
  return result.data.slot;
}

export async function deleteFinishSlot(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/finish-slots/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });

  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
}

export async function getService2AccountHistory(params: {
  assignedAccountId: string;
  examId?: string;
}): Promise<Service2AccountHistoryDto> {
  const query = new URLSearchParams();
  query.set('assignedAccountId', params.assignedAccountId);
  if (params.examId) query.set('examId', params.examId);

  const response = await fetch(`${API_URL}/admin/account-history?${query.toString()}`, {
    headers: { ...getAuthHeaders() },
  });

  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
  const result = JSON.parse(text) as ApiResponse<Service2AccountHistoryDto>;
  if (!result.success || !result.data) throw new Error(result.message || 'API error');
  return result.data;
}

export async function generateService2AccountReport(payload: {
  assignedAccountId: string;
  examId?: string;
}): Promise<any> {
  const response = await fetch(`${API_URL}/admin/generate-account-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
  const result = JSON.parse(text) as ApiResponse<{ report: any }>;
  if (!result.success || !result.data?.report) throw new Error(result.message || 'API error');
  return result.data.report;
}
