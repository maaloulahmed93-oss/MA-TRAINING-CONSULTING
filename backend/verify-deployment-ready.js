#!/usr/bin/env node

/**
 * MATC Backend Deployment Verification Script
 * Verifies that the backend is ready for Render deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 MATC Backend Deployment Verification\n');

const checks = [];

// Check 1: package.json has required fields
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.start) {
    checks.push({ name: 'Start script', status: '✅', details: `"${packageJson.scripts.start}"` });
  } else {
    checks.push({ name: 'Start script', status: '❌', details: 'Missing start script' });
  }
  
  if (packageJson.engines && packageJson.engines.node) {
    checks.push({ name: 'Node.js version', status: '✅', details: packageJson.engines.node });
  } else {
    checks.push({ name: 'Node.js version', status: '❌', details: 'Missing engines specification' });
  }
  
  if (packageJson.type === 'module') {
    checks.push({ name: 'ES Modules', status: '✅', details: 'Using ES modules' });
  } else {
    checks.push({ name: 'ES Modules', status: '⚠️', details: 'Using CommonJS' });
  }
} catch (error) {
  checks.push({ name: 'package.json', status: '❌', details: 'Cannot read package.json' });
}

// Check 2: .env.example exists and has required variables
try {
  const envExample = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf8');
  const requiredVars = ['MONGODB_URI', 'PORT', 'NODE_ENV'];
  const missingVars = requiredVars.filter(varName => !envExample.includes(varName));
  
  if (missingVars.length === 0) {
    checks.push({ name: 'Environment variables', status: '✅', details: 'All required variables documented' });
  } else {
    checks.push({ name: 'Environment variables', status: '❌', details: `Missing: ${missingVars.join(', ')}` });
  }
} catch (error) {
  checks.push({ name: '.env.example', status: '❌', details: 'File not found' });
}

// Check 3: server.js exists and has proper configuration
try {
  const serverJs = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  
  if (serverJs.includes("'0.0.0.0'") || serverJs.includes('"0.0.0.0"')) {
    checks.push({ name: 'Server binding', status: '✅', details: 'Configured for 0.0.0.0' });
  } else {
    checks.push({ name: 'Server binding', status: '⚠️', details: 'May not bind to 0.0.0.0' });
  }
  
  if (serverJs.includes('process.env.PORT')) {
    checks.push({ name: 'Port configuration', status: '✅', details: 'Uses process.env.PORT' });
  } else {
    checks.push({ name: 'Port configuration', status: '❌', details: 'Missing PORT environment variable usage' });
  }
  
  if (serverJs.includes('cors') && serverJs.includes('vercel.app')) {
    checks.push({ name: 'CORS configuration', status: '✅', details: 'Configured for Vercel domains' });
  } else {
    checks.push({ name: 'CORS configuration', status: '⚠️', details: 'May need Vercel domain configuration' });
  }
  
  if (serverJs.includes('/api/health')) {
    checks.push({ name: 'Health check endpoint', status: '✅', details: '/api/health endpoint found' });
  } else {
    checks.push({ name: 'Health check endpoint', status: '❌', details: 'Missing health check endpoint' });
  }
} catch (error) {
  checks.push({ name: 'server.js', status: '❌', details: 'Cannot read server.js' });
}

// Check 4: Dependencies
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const requiredDeps = ['express', 'mongoose', 'cors', 'dotenv', 'helmet'];
  const deps = packageJson.dependencies || {};
  const missingDeps = requiredDeps.filter(dep => !deps[dep]);
  
  if (missingDeps.length === 0) {
    checks.push({ name: 'Dependencies', status: '✅', details: 'All required dependencies present' });
  } else {
    checks.push({ name: 'Dependencies', status: '❌', details: `Missing: ${missingDeps.join(', ')}` });
  }
} catch (error) {
  checks.push({ name: 'Dependencies check', status: '❌', details: 'Cannot verify dependencies' });
}

// Check 5: Models directory
try {
  const modelsDir = path.join(__dirname, 'models');
  const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));
  
  if (modelFiles.length > 0) {
    checks.push({ name: 'Database models', status: '✅', details: `${modelFiles.length} model files found` });
  } else {
    checks.push({ name: 'Database models', status: '⚠️', details: 'No model files found' });
  }
} catch (error) {
  checks.push({ name: 'Models directory', status: '❌', details: 'Models directory not found' });
}

// Check 6: Routes directory
try {
  const routesDir = path.join(__dirname, 'routes');
  const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));
  
  if (routeFiles.length > 0) {
    checks.push({ name: 'API routes', status: '✅', details: `${routeFiles.length} route files found` });
  } else {
    checks.push({ name: 'API routes', status: '⚠️', details: 'No route files found' });
  }
} catch (error) {
  checks.push({ name: 'Routes directory', status: '❌', details: 'Routes directory not found' });
}

// Display results
console.log('📋 Deployment Readiness Report:\n');
checks.forEach(check => {
  console.log(`${check.status} ${check.name}: ${check.details}`);
});

// Summary
const passed = checks.filter(c => c.status === '✅').length;
const warnings = checks.filter(c => c.status === '⚠️').length;
const failed = checks.filter(c => c.status === '❌').length;

console.log('\n📊 Summary:');
console.log(`✅ Passed: ${passed}`);
console.log(`⚠️ Warnings: ${warnings}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 Backend is ready for Render deployment!');
  console.log('\n📝 Next steps:');
  console.log('1. Push code to GitHub repository');
  console.log('2. Create new Web Service on Render');
  console.log('3. Configure environment variables');
  console.log('4. Deploy and test health endpoint');
  console.log('5. Update frontend API URLs');
} else {
  console.log('\n⚠️ Please fix the failed checks before deploying.');
}

console.log('\n📖 See RENDER_DEPLOYMENT_GUIDE.md for detailed instructions.');
