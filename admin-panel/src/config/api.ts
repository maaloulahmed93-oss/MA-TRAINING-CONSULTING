// API Configuration for Admin Panel
// Centralized API URL management

export const getApiBaseUrl = (): string => {
  // CORRECT Backend URL - Fixed!
  const CORRECT_BACKEND_URL = 'https://matc-backend.onrender.com/api';
  
  // Production environment - use correct backend URL
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL || CORRECT_BACKEND_URL;
  }
  
  // Force correct backend URL for any Vercel deployment
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return CORRECT_BACKEND_URL;
  }
  
  // Environment variable (for custom deployments)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Development fallback to localhost
  return 'http://localhost:3001/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Log for debugging
console.log('🔗 API Configuration:', {
  baseUrl: API_BASE_URL,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
  environment: import.meta.env.MODE,
  isVercel: typeof window !== 'undefined' ? window.location.hostname.includes('vercel.app') : false
});

export default API_BASE_URL;
