#!/usr/bin/env node

/**
 * نشر يدوي للوحة الإدارة - حل مباشر
 * Manual Admin Panel Deployment - Direct Solution
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 نشر يدوي للوحة الإدارة');
console.log('🚀 MANUAL ADMIN PANEL DEPLOYMENT');
console.log('='.repeat(60));

// التحقق من وجود المجلد
if (!fs.existsSync('admin-panel')) {
  console.error('❌ مجلد admin-panel غير موجود');
  process.exit(1);
}

console.log('✅ مجلد لوحة الإدارة موجود');

// إنشاء تغيير صغير لإجبار النشر
const timestamp = new Date().toISOString();
const deployTrigger = `// Deploy trigger: ${timestamp}
console.log('🚀 MATC Admin Panel - Force Deploy: ${timestamp}');
`;

// إضافة تغيير في ملف API
const currentApiContent = fs.readFileSync('admin-panel/src/config/api.ts', 'utf8');
const newApiContent = deployTrigger + '\n' + currentApiContent;
fs.writeFileSync('admin-panel/src/config/api.ts', newApiContent);

console.log('✅ تم إضافة trigger للنشر');

// إنشاء ملف package.json محدث إذا لزم الأمر
console.log('📝 تحديث package.json...');
const packagePath = 'admin-panel/package.json';
if (fs.existsSync(packagePath)) {
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageContent.version = `1.0.${Date.now()}`;
  fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2));
  console.log('✅ تم تحديث رقم الإصدار');
}

// بناء المشروع محلياً للتأكد
console.log('🏗️ بناء المشروع محلياً...');
try {
  execSync('cd admin-panel && npm run build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_API_BASE_URL: 'https://matc-backend.onrender.com/api',
      NODE_ENV: 'production'
    }
  });
  console.log('✅ البناء المحلي نجح');
} catch (error) {
  console.error('❌ فشل البناء المحلي:', error.message);
  process.exit(1);
}

// حفظ ودفع التغييرات
console.log('📤 دفع التغييرات...');
try {
  execSync('git add .', { stdio: 'inherit' });
  execSync(`git commit -m "🚀 Force admin panel deployment - ${timestamp} - Manual deployment trigger - Updated API configuration - Force rebuild and redeploy"`, { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('✅ تم دفع التغييرات بنجاح');
} catch (error) {
  console.error('❌ فشل في دفع التغييرات:', error.message);
  process.exit(1);
}

// محاولة تشغيل workflow يدوياً
console.log('⚡ محاولة تشغيل GitHub Actions...');
try {
  // إنشاء ملف workflow بسيط للنشر اليدوي
  const simpleWorkflow = `name: 🚀 Manual Admin Panel Deploy

on:
  workflow_dispatch:
  push:
    branches: [main]
    paths: ['admin-panel/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install and Build
        run: |
          cd admin-panel
          npm ci
          npm run build
        env:
          VITE_API_BASE_URL: https://matc-backend.onrender.com/api
          NODE_ENV: production
      - name: Deploy to Vercel
        run: |
          cd admin-panel
          npx vercel --prod --yes --token=\${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: \${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: \${{ secrets.VERCEL_ADMIN_PROJECT_ID }}
`;

  fs.writeFileSync('.github/workflows/manual-admin-deploy.yml', simpleWorkflow);
  console.log('✅ تم إنشاء workflow بسيط للنشر');
  
  // دفع workflow الجديد
  execSync('git add .github/workflows/manual-admin-deploy.yml', { stdio: 'inherit' });
  execSync('git commit -m "Add manual admin panel deployment workflow"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('✅ تم دفع workflow الجديد');
  
} catch (error) {
  console.warn('⚠️ تحذير في إنشاء workflow:', error.message);
}

console.log('\n' + '='.repeat(60));
console.log('🎉 تم تشغيل النشر اليدوي!');
console.log('🎉 MANUAL DEPLOYMENT TRIGGERED!');
console.log('='.repeat(60));
console.log('');
console.log('✅ تم إضافة trigger للنشر');
console.log('✅ تم بناء المشروع محلياً');
console.log('✅ تم دفع التغييرات إلى GitHub');
console.log('✅ تم إنشاء workflow بسيط');
console.log('');
console.log('📋 الخطوات التالية:');
console.log('1. اذهب إلى GitHub Actions:');
console.log('   https://github.com/maaloulahmed93-oss/MA-TRAINING-CONSULTING/actions');
console.log('2. ابحث عن "Manual Admin Panel Deploy"');
console.log('3. اضغط "Run workflow" إذا لم يبدأ تلقائياً');
console.log('4. انتظر 3-5 دقائق لإكمال النشر');
console.log('5. اختبر لوحة الإدارة: https://admine-lake.vercel.app/');
console.log('');
console.log('🔍 إذا لم يعمل GitHub Actions:');
console.log('   • تحقق من GitHub Secrets');
console.log('   • تأكد من وجود VERCEL_TOKEN');
console.log('   • تأكد من وجود VERCEL_ORG_ID');
console.log('   • تأكد من وجود VERCEL_ADMIN_PROJECT_ID');
console.log('');
console.log('النشر يجب أن يحدث الآن! 🚀');
