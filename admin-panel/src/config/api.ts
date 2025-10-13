// API Configuration for Admin Panel
// Centralized API URL management - Fixed initialization issue

// CORRECT Backend URL - Always use this for production
const CORRECT_BACKEND_URL = 'https://matc-backend.onrender.com/api';

// Safe API URL getter with proper initialization order
export const getApiBaseUrl = (): string => {
  try {
    // Always return correct backend URL for Vercel deployments
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      console.log('🔗 Using Vercel production URL:', CORRECT_BACKEND_URL);
      return CORRECT_BACKEND_URL;
    }
    
    // Production environment check
    if (import.meta.env.PROD) {
      const envUrl = import.meta.env.VITE_API_BASE_URL;
      const url = envUrl || CORRECT_BACKEND_URL;
      console.log('🔗 Production API URL:', url);
      return url;
    }
    
    // Environment variable check for custom deployments
    if (import.meta.env.VITE_API_BASE_URL) {
      console.log('🔗 Custom API URL:', import.meta.env.VITE_API_BASE_URL);
      return import.meta.env.VITE_API_BASE_URL;
    }
    
    // Development fallback
    console.log('🔗 Development API URL: http://localhost:3001/api');
    return 'http://localhost:3001/api';
  } catch (error) {
    // Fallback in case of any errors
    console.warn('⚠️ API URL detection failed, using fallback:', CORRECT_BACKEND_URL);
    return CORRECT_BACKEND_URL;
  }
};

// Initialize API_BASE_URL safely
let API_BASE_URL: string;
try {
  API_BASE_URL = getApiBaseUrl();
} catch (error) {
  console.error('❌ Failed to initialize API_BASE_URL, using fallback');
  API_BASE_URL = CORRECT_BACKEND_URL;
}

// Export the initialized URL
export { API_BASE_URL };

// Default export
export default API_BASE_URL;

// Debug information
console.log('🔗 Final API Configuration:', {
  baseUrl: API_BASE_URL,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server-side',
  environment: typeof import.meta !== 'undefined' ? import.meta.env?.MODE : 'unknown',
  isVercel: typeof window !== 'undefined' ? window.location.hostname.includes('vercel.app') : false,
  timestamp: new Date().toISOString()
});
