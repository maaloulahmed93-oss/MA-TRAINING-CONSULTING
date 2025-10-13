// Fix minification error: 2025-10-13T17:28:11.781Z
// Deploy trigger: 2025-10-13T17:15:01.303Z
console.log('🚀 MATC Admin Panel - Force Deploy: 2025-10-13T17:15:01.303Z');

/**
 * MATC Admin Panel API Configuration
 * EMERGENCY FIX: Completely rewritten to avoid initialization errors
 */

// HARDCODED BACKEND URL - NO DYNAMIC IMPORTS TO AVOID CIRCULAR DEPENDENCY
const API_BASE_URL = 'https://matc-backend.onrender.com/api';

// Simple function to get API URL - NO COMPLEX LOGIC
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

// Direct export - NO DYNAMIC INITIALIZATION
export { API_BASE_URL };

// Default export
export default API_BASE_URL;

// Simple debug log
console.log('✅ MATC Admin Panel API URL:', API_BASE_URL);
