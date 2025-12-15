// Force redeploy: 2025-10-25T11:16:00.000Z
// CRITICAL FIX: Force production API to resolve backend connectivity
/**
 * MATC Admin Panel API Configuration
 * NUCLEAR FIX: Zero-dependency, ultra-safe configuration
 */

// HARDCODED VALUES - NO IMPORTS, NO DEPENDENCIES
const PRODUCTION_API_URL = 'https://matc-backend.onrender.com/api';
const LOCAL_API_URL = 'http://localhost:3001/api';

// SIMPLE FUNCTION - USE LOCAL API IN DEVELOPMENT
function getApiUrl() {
  // Use local API for development, production API for deployment
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const apiUrl = isDevelopment ? LOCAL_API_URL : PRODUCTION_API_URL;
  console.log('🔗 API URL:', apiUrl, '(Development:', isDevelopment, ')');
  return apiUrl;
}

// DIRECT ASSIGNMENT - NO INITIALIZATION ISSUES
const API_BASE_URL = getApiUrl();

// SIMPLE EXPORTS
export { API_BASE_URL };
export default API_BASE_URL;

// DEBUG LOG
console.log('✅ MATC Admin Panel API initialized:', API_BASE_URL);
