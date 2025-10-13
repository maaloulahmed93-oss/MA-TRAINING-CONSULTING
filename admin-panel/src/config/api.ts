// Force redeploy: 2025-10-13T21:41:07.537Z
/**
 * MATC Admin Panel API Configuration
 * NUCLEAR FIX: Zero-dependency, ultra-safe configuration
 */

// HARDCODED VALUES - NO IMPORTS, NO DEPENDENCIES
const PRODUCTION_API_URL = 'https://matc-backend.onrender.com/api';
const DEVELOPMENT_API_URL = 'http://localhost:3001/api';

// SIMPLE FUNCTION - NO COMPLEX LOGIC
function getApiUrl() {
  // Check if we're in production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
      console.log('🔗 Production API URL:', PRODUCTION_API_URL);
      return PRODUCTION_API_URL;
    }
  }
  
  // Check environment
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
    console.log('🔗 Production API URL:', PRODUCTION_API_URL);
    return PRODUCTION_API_URL;
  }
  
  // Default to production for safety
  console.log('🔗 Default API URL:', PRODUCTION_API_URL);
  return PRODUCTION_API_URL;
}

// DIRECT ASSIGNMENT - NO INITIALIZATION ISSUES
const API_BASE_URL = getApiUrl();

// SIMPLE EXPORTS
export { API_BASE_URL };
export default API_BASE_URL;

// DEBUG LOG
console.log('✅ MATC Admin Panel API initialized:', API_BASE_URL);
