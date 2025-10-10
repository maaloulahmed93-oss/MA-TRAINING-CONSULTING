// API Configuration for Admin Panel
// Centralized API URL management

export const getApiBaseUrl = (): string => {
  // Production environment - use environment variable or default to Render URL
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL || 'https://ma-training-consulting.onrender.com/api';
  }
  
  // Force production URL for any Vercel deployment
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://ma-training-consulting.onrender.com/api';
  }
  
  // Environment variable (for custom deployments)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Development fallback
  return '/api';
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
