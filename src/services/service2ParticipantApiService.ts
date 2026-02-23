import { API_BASE_URL } from '../config/api';
import { getSession } from './consultingOperationnelParticipantService';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
};

function authHeaders(): Record<string, string> {
  const session = getSession();
  const token = session?.token;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function authOnlyHeaders(): Record<string, string> {
  const session = getSession();
  const token = session?.token;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

const API_URL = `${API_BASE_URL}/service2`;

export type Service2Exam = {
  id: string;
  title: string;
  scenarioBrief: string;
  constraints: string[];
  successCriteria: string[];
  tasks: { id: string; title?: string; prompt?: string }[];
  verdictRules: any[];
  assignedAccountId: string | null;
  isActive: boolean;
};

export type Service2AiAnalysis = {
  score: number;
  summary: string;
  warnings: any[];
  tips: any[];
  constraintViolations: any[];
  successCriteria: any[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
};

export type Service2FinalReport = {
  _id: string;
  examId: string;
  accountId: string;
  globalScore: number;
  constraintViolationsCount: number;
  status: string;
  message: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  reportText: string;
};

export type Service2FinishSlot = {
  _id: string;
  title: string;
  startAt: string;
  endAt?: string;
  isActive: boolean;
};

export type Service2PlanTaskFeedback = {
  score: number;
  summary: string;
  warnings: any[];
  tips: any[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  analyzedAt?: string | null;
};

export type Service2PlanTask = {
  id: string;
  title: string;
  dueAt: string | null;
  status: 'todo' | 'done' | string;
  completedAt: string | null;
  aiFeedback: Service2PlanTaskFeedback | null;
};

export type Service2ActionPlan = {
  id: string;
  examId: string;
  accountId: string;
  tasks: Service2PlanTask[];
};

export async function getMyExam(): Promise<Service2Exam | null> {
  const response = await fetch(`${API_URL}/my-exam`, { headers: authHeaders() });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = (await response.json()) as ApiResponse<{ exam: Service2Exam }>;
  if (!result.success || !result.data?.exam) throw new Error(result.message || 'API error');
  return result.data.exam;
}

export async function submitTask(payload: {
  examId: string;
  taskId?: string;
  submissionText: string;
}): Promise<{ submissionId: string }>{
  const response = await fetch(`${API_URL}/submit-task`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
  const result = JSON.parse(text) as ApiResponse<{ submissionId: string }>;
  if (!result.success || !result.data?.submissionId) throw new Error(result.message || 'API error');
  return { submissionId: result.data.submissionId };
}

export async function analyzeTask(payload: {
  examId: string;
  taskId?: string;
  submissionText: string;
  submissionId?: string;
}): Promise<{ analysis: Service2AiAnalysis; submissionId: string }>{
  const response = await fetch(`${API_URL}/analyze-task`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
  const result = JSON.parse(text) as ApiResponse<{ analysis: Service2AiAnalysis; submissionId: string }>;
  if (!result.success || !result.data?.analysis) throw new Error(result.message || 'API error');
  return { analysis: result.data.analysis, submissionId: result.data.submissionId };
}

export async function generateFinalVerdict(payload: { examId: string }): Promise<Service2FinalReport> {
  const response = await fetch(`${API_URL}/generate-final-verdict`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
  const result = JSON.parse(text) as ApiResponse<{ report: Service2FinalReport }>;
  if (!result.success || !result.data?.report) throw new Error(result.message || 'API error');
  return result.data.report;
}

export async function getFinalReport(examId: string): Promise<Service2FinalReport | null> {
  const response = await fetch(`${API_URL}/final-report/${encodeURIComponent(examId)}`, { headers: authHeaders() });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = (await response.json()) as ApiResponse<{ report: Service2FinalReport }>;
  if (!result.success) throw new Error(result.message || 'API error');
  return result.data?.report ?? null;
}

export async function getFinishSlots(): Promise<Service2FinishSlot[]> {
  const response = await fetch(`${API_URL}/finish-slots`, { headers: authHeaders() });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = (await response.json()) as ApiResponse<{ slots: Service2FinishSlot[] }>;
  if (!result.success || !result.data?.slots) throw new Error(result.message || 'API error');
  return result.data.slots;
}

export async function getMyPlan(examId: string): Promise<Service2ActionPlan | null> {
  const response = await fetch(`${API_URL}/my-plan?examId=${encodeURIComponent(examId)}`, { headers: authHeaders() });
  if (response.status === 404) return null;
  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
  const result = JSON.parse(text) as ApiResponse<{ plan: Service2ActionPlan }>;
  if (!result.success || !result.data?.plan) throw new Error(result.message || 'API error');
  return result.data.plan;
}

export async function upsertMyPlan(payload: {
  examId: string;
  tasks: { title: string; dueAt?: string | null }[];
}): Promise<Service2ActionPlan> {
  const response = await fetch(`${API_URL}/my-plan`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
  const result = JSON.parse(text) as ApiResponse<{ plan: Service2ActionPlan }>;
  if (!result.success || !result.data?.plan) throw new Error(result.message || 'API error');
  return result.data.plan;
}

export async function analyzePlanTask(payload: {
  planId: string;
  taskId: string;
  reportText: string;
  pdf: File;
}): Promise<{ task: Service2PlanTask }>{
  const fd = new FormData();
  fd.append('reportText', payload.reportText);
  fd.append('pdf', payload.pdf);

  const response = await fetch(`${API_URL}/my-plan/${encodeURIComponent(payload.planId)}/tasks/${encodeURIComponent(payload.taskId)}/analyze`, {
    method: 'POST',
    headers: authOnlyHeaders(),
    body: fd,
  });

  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
  const result = JSON.parse(text) as ApiResponse<{ task: Service2PlanTask }>;
  if (!result.success || !result.data?.task) throw new Error(result.message || 'API error');
  return { task: result.data.task };
}
