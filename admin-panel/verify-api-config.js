#!/usr/bin/env node

/**
 * Verification script to ensure all service files are using centralized API configuration
 */

import fs from 'fs';
import path from 'path';

const SERVICES_DIR = './src/services';

function verifyFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  // Skip non-API service files
  if (!content.includes('fetch(') && !content.includes('axios(')) {
    return { fileName, status: 'skipped', reason: 'No API calls found' };
  }
  
  const hasConfigImport = content.includes("import { API_BASE_URL } from '../config/api'");
  const hasHardcodedUrl = content.includes('localhost:3001');
  
  if (hasHardcodedUrl) {
    return { fileName, status: 'error', reason: 'Still contains hardcoded localhost:3001' };
  }
  
  if (!hasConfigImport && (content.includes('API_BASE') || content.includes('API_URL'))) {
    return { fileName, status: 'warning', reason: 'Uses API_BASE but no centralized import found' };
  }
  
  if (hasConfigImport) {
    return { fileName, status: 'success', reason: 'Uses centralized API configuration' };
  }
  
  return { fileName, status: 'info', reason: 'No API configuration needed' };
}

function main() {
  console.log('🔍 Verifying API configuration in service files...\n');
  
  const files = fs.readdirSync(SERVICES_DIR)
    .filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts'))
    .map(file => path.join(SERVICES_DIR, file));
  
  const results = files.map(verifyFile);
  
  const success = results.filter(r => r.status === 'success').length;
  const errors = results.filter(r => r.status === 'error').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  
  // Display results
  results.forEach(result => {
    const icon = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      skipped: '⏭️'
    }[result.status];
    
    console.log(`${icon} ${result.fileName}: ${result.reason}`);
  });
  
  console.log('\n📊 Summary:');
  console.log(`   ✅ Properly configured: ${success}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   ⚠️  Warnings: ${warnings}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📁 Total files: ${files.length}`);
  
  if (errors === 0) {
    console.log('\n🎉 All service files are properly configured!');
    console.log('✅ Ready for deployment to Vercel');
  } else {
    console.log('\n⚠️  Some files still need attention');
    console.log('❌ Fix required before deployment');
  }
  
  return errors === 0;
}

// Run verification
const success = main();
process.exit(success ? 0 : 1);
