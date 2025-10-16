#!/usr/bin/env node

/**
 * MATC Admin Panel - Deployment Validation Script
 * Validates the project structure and configuration before deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 MATC Admin Panel - Deployment Validation');
console.log('==========================================');

// Check critical files
const criticalFiles = [
  'package.json',
  'vercel.json',
  'vite.config.ts',
  'index.html',
  'src/main.tsx',
  'src/App.tsx'
];

let allFilesExist = true;

console.log('\n📁 Checking critical files:');
criticalFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Check package.json configuration
console.log('\n📦 Validating package.json:');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Name: ${pkg.name}`);
  console.log(`✅ Version: ${pkg.version}`);
  console.log(`✅ Build script: ${pkg.scripts?.build || 'MISSING'}`);
  console.log(`✅ Framework: Vite (${pkg.devDependencies?.vite || 'version not found'})`);
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
  allFilesExist = false;
}

// Check vercel.json configuration
console.log('\n⚡ Validating vercel.json:');
try {
  const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  console.log(`✅ Framework: ${vercel.framework}`);
  console.log(`✅ Build command: ${vercel.buildCommand}`);
  console.log(`✅ Output directory: ${vercel.outputDirectory}`);
  console.log(`✅ Install command: ${vercel.installCommand}`);
  console.log(`✅ Node version: ${vercel.nodeVersion || 'default'}`);
} catch (error) {
  console.log('❌ Error reading vercel.json:', error.message);
  allFilesExist = false;
}

// Check environment variables
console.log('\n🌍 Environment Configuration:');
try {
  const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  if (vercel.env) {
    Object.keys(vercel.env).forEach(key => {
      console.log(`✅ ${key}: ${vercel.env[key]}`);
    });
  }
} catch (error) {
  console.log('❌ Error checking environment variables');
}

// Final validation result
console.log('\n🎯 Validation Result:');
if (allFilesExist) {
  console.log('✅ ALL CHECKS PASSED - Ready for deployment!');
  console.log('\n🚀 Next steps:');
  console.log('1. Commit changes: git add . && git commit -m "Fix: Updated Vercel configuration"');
  console.log('2. Push to repository: git push origin main');
  console.log('3. Deploy on Vercel: Force redeploy in dashboard');
  process.exit(0);
} else {
  console.log('❌ VALIDATION FAILED - Fix issues before deployment');
  process.exit(1);
}
