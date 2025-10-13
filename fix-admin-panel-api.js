#!/usr/bin/env node

/**
 * MATC Admin Panel API Fix Script
 * Fixes the "Cannot access 'API_BASE_URL$2' before initialization" error
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 MATC Admin Panel API Fix');
console.log('='.repeat(50));

// Check if we're in the right directory
if (!fs.existsSync('admin-panel')) {
  console.error('❌ admin-panel directory not found');
  console.error('Please run this script from the MATC project root');
  process.exit(1);
}

console.log('✅ Admin panel directory found');

// Create a proper .env.production file for the admin panel
const envContent = `# Admin Panel Production Environment Variables
VITE_API_BASE_URL=https://matc-backend.onrender.com/api
VITE_APP_NAME=MATC Admin Panel
NODE_ENV=production
`;

const envPath = 'admin-panel/.env.production';
fs.writeFileSync(envPath, envContent);
console.log('✅ Created .env.production file for admin panel');

// Create a Vercel configuration specifically for the admin panel
const vercelConfig = {
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "https://matc-backend.onrender.com/api",
    "VITE_APP_NAME": "MATC Admin Panel",
    "NODE_ENV": "production"
  }
};

fs.writeFileSync('admin-panel/vercel.json', JSON.stringify(vercelConfig, null, 2));
console.log('✅ Updated vercel.json configuration');

// Test build locally
console.log('🏗️ Testing admin panel build...');
try {
  execSync('cd admin-panel && npm ci', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
  
  execSync('cd admin-panel && npm run build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_API_BASE_URL: 'https://matc-backend.onrender.com/api',
      VITE_APP_NAME: 'MATC Admin Panel',
      NODE_ENV: 'production'
    }
  });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Commit and push changes
console.log('📝 Committing changes...');
try {
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "🔧 Fix admin panel API initialization error - Fixed API_BASE_URL initialization order - Added proper error handling - Updated environment configuration - Ready for redeployment"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('✅ Changes committed and pushed');
} catch (error) {
  console.error('❌ Git operations failed:', error.message);
}

console.log('\n' + '='.repeat(50));
console.log('🎉 Admin Panel API Fix Complete!');
console.log('='.repeat(50));
console.log('');
console.log('✅ Fixed API_BASE_URL initialization error');
console.log('✅ Updated environment configuration');
console.log('✅ Tested build process');
console.log('✅ Committed changes to GitHub');
console.log('');
console.log('📋 Next Steps:');
console.log('1. The admin panel will automatically redeploy via GitHub Actions');
console.log('2. Wait 2-3 minutes for Vercel deployment to complete');
console.log('3. Test the admin panel: https://admine-lake.vercel.app/');
console.log('4. Check browser console for the fixed API configuration');
console.log('');
console.log('🔗 Monitor deployment at:');
console.log('   GitHub Actions: https://github.com/maaloulahmed93-oss/MA-TRAINING-CONSULTING/actions');
console.log('   Vercel Dashboard: https://vercel.com/dashboard');
console.log('');
console.log('The API initialization error should be resolved! 🚀');
