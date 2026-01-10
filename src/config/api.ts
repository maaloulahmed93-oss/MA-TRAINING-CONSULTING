// API Configuration for MATC Application
// Resolve API base URL with safety override to avoid localhost in production builds
const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
const isLocalhostEnv = envBase && /localhost|127\.0\.0\.1/i.test(envBase);
const isDev = import.meta.env.DEV;
const runningOnVercel = typeof window !== 'undefined' && /vercel\.app$/i.test(window.location.hostname);
export const API_BASE_URL = isDev
  ? (envBase || 'http://localhost:3001/api')
  : ((!runningOnVercel || !isLocalhostEnv)
      ? (envBase || 'https://matc-backend.onrender.com/api')
      : 'https://matc-backend.onrender.com/api');

// API Endpoints
export const API_ENDPOINTS = {
  // Health check
  HEALTH: '/health',
  
  // Partners
  PARTNERS: '/partners',
  PARTNER_LOGIN: (id: string) => `/partners/${id}/login`,
  
  // Formateur Sessions
  FORMATEUR_SESSIONS: '/formateur-sessions',
  FORMATEUR_SESSION_BY_ID: (id: string) => `/formateur-sessions/${id}`,
  FORMATEUR_STATS: (id: string) => `/formateur-sessions/${id}/stats`,
  
  // Commercial Deals
  COMMERCIAL_DEALS: '/commercial-deals',
  COMMERCIAL_DEALS_BY_ID: (commercialId: string) => `/commercial-deals/${commercialId}`,
  COMMERCIAL_DEAL_NOTES: (dealId: string) => `/commercial-deals/${dealId}/notes`,
  COMMERCIAL_DEAL_DOCUMENTS: (dealId: string) => `/commercial-deals/${dealId}/documents`,
  COMMERCIAL_STATS: (commercialId: string) => `/commercial-deals/${commercialId}/stats`,
  COMMERCIAL_CLIENTS: (commercialId: string) => `/commercial-deals/${commercialId}/clients`,
  
  // Programs
  PROGRAMS: '/programs',
  PROGRAM_BY_ID: (id: string) => `/programs/${id}`,
  
  // Categories
  CATEGORIES: '/categories',
  
  // Attestations
  ATTESTATIONS: '/attestations',
  ATTESTATION_BY_ID: (id: string) => `/attestations/${id}`,
  ATTESTATION_DOWNLOAD: (id: string, type: string) => `/attestations/${id}/download/${type}`,
  ATTESTATION_VERIFY: (id: string) => `/attestations/verify/${id}`,
} as const;

// Request timeout configuration
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Default headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const;

// Environment check
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// API URL validation
export const validateApiUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Build full API URL
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  REQUEST_TIMEOUT,
  DEFAULT_HEADERS,
  isDevelopment,
  isProduction,
  validateApiUrl,
  buildApiUrl,
};
