// Force redeploy: 2025-10-25T11:16:00.000Z
// CRITICAL FIX: Force production API to resolve backend connectivity
/**
 * MATC Admin Panel API Configuration
 * NUCLEAR FIX: Zero-dependency, ultra-safe configuration
 */

// HARDCODED VALUES - NO IMPORTS, NO DEPENDENCIES
const PRODUCTION_API_URL = 'https://matc-backend.onrender.com/api';

// SIMPLE FUNCTION - FORCE PRODUCTION API
function getApiUrl() {
  // ALWAYS use production API to fix connectivity issues
  console.log('🔗 FORCED Production API URL:', PRODUCTION_API_URL);
  return PRODUCTION_API_URL;
}

// DIRECT ASSIGNMENT - NO INITIALIZATION ISSUES
const API_BASE_URL = getApiUrl();

// SIMPLE EXPORTS
export { API_BASE_URL };
export default API_BASE_URL;

// DEBUG LOG
console.log('✅ MATC Admin Panel API initialized:', API_BASE_URL);
