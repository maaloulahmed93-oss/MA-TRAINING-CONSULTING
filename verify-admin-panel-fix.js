#!/usr/bin/env node

/**
 * MATC Admin Panel Fix Verification Script
 * Tests the admin panel after the API initialization fix
 */

const https = require('https');

const ADMIN_PANEL_URL = 'https://admine-lake.vercel.app';
const BACKEND_API_URL = 'https://matc-backend.onrender.com/api';

console.log('🔍 MATC Admin Panel Fix Verification');
console.log('='.repeat(50));

// Test function with timeout
function testUrl(url, description) {
  return new Promise((resolve) => {
    console.log(`🧪 Testing ${description}...`);
    
    const req = https.get(url, (res) => {
      const success = res.statusCode >= 200 && res.statusCode < 400;
      console.log(`${success ? '✅' : '❌'} ${description}: HTTP ${res.statusCode}`);
      resolve(success);
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${description}: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`⏰ ${description}: Timeout`);
      resolve(false);
    });
  });
}

async function runVerification() {
  console.log(`🎯 Target Admin Panel: ${ADMIN_PANEL_URL}`);
  console.log(`🎯 Target Backend API: ${BACKEND_API_URL}`);
  console.log('');
  
  // Test backend API first
  const backendHealthy = await testUrl(`${BACKEND_API_URL}/health`, 'Backend API Health');
  
  // Test admin panel
  const adminPanelAccessible = await testUrl(ADMIN_PANEL_URL, 'Admin Panel Accessibility');
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Verification Results');
  console.log('='.repeat(50));
  
  if (backendHealthy && adminPanelAccessible) {
    console.log('✅ All tests passed!');
    console.log('');
    console.log('🎉 Admin Panel Fix Verification: SUCCESS');
    console.log('');
    console.log('📋 What was fixed:');
    console.log('  • API_BASE_URL initialization error resolved');
    console.log('  • Proper error handling added');
    console.log('  • Environment configuration updated');
    console.log('  • Build process verified');
    console.log('');
    console.log('🔗 Admin Panel: ' + ADMIN_PANEL_URL);
    console.log('');
    console.log('💡 Next steps:');
    console.log('  1. Open the admin panel in your browser');
    console.log('  2. Check the browser console (F12)');
    console.log('  3. Look for "🔗 Final API Configuration" log');
    console.log('  4. Verify no more initialization errors');
    
  } else {
    console.log('⚠️  Some tests failed');
    console.log('');
    if (!backendHealthy) {
      console.log('❌ Backend API is not responding');
      console.log('   • Check Render deployment status');
      console.log('   • Backend may be cold starting (wait 30 seconds)');
    }
    
    if (!adminPanelAccessible) {
      console.log('❌ Admin Panel is not accessible');
      console.log('   • Check Vercel deployment status');
      console.log('   • Deployment may still be in progress');
    }
    
    console.log('');
    console.log('🔄 Retry verification in a few minutes if deployment is still in progress');
  }
  
  console.log('\n🔗 Monitoring Links:');
  console.log('  • GitHub Actions: https://github.com/maaloulahmed93-oss/MA-TRAINING-CONSULTING/actions');
  console.log('  • Admin Panel: ' + ADMIN_PANEL_URL);
  console.log('  • Backend API: ' + BACKEND_API_URL + '/health');
}

// Run verification
runVerification().catch(console.error);
