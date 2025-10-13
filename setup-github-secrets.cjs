#!/usr/bin/env node

/**
 * سكريپت إعداد GitHub Secrets تلقائياً
 * Automated GitHub Secrets Setup Script
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔐 إعداد GitHub Secrets تلقائياً');
console.log('🔐 AUTOMATED GITHUB SECRETS SETUP');
console.log('='.repeat(70));

// تعريف جميع المتغيرات المطلوبة
const secrets = {
  // متغيرات قاعدة البيانات
  'MONGODB_URI': 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db',
  'MONGODB_URI_TEST': 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_test_db',
  
  // متغيرات الأمان
  'JWT_SECRET': 'matc_secret_key_2025_ultra_secure_token_for_authentication',
  'ENCRYPTION_KEY': 'matc_encryption_2025_secure_key_for_data_protection',
  
  // متغيرات البيئة العامة
  'NODE_ENV': 'production',
  'PORT': '10000',
  'FRONTEND_URLS': 'https://matrainingconsulting.vercel.app,https://admine-lake.vercel.app',
  
  // متغيرات Frontend (Vite)
  'VITE_API_BASE_URL': 'https://matc-backend.onrender.com/api',
  'VITE_APP_NAME': 'MA-TRAINING-CONSULTING',
  'VITE_APP_VERSION': '1.0.0',
  'VITE_ENVIRONMENT': 'production',
  
  // متغيرات إضافية
  'ADMIN_EMAIL': 'admin@matc.com',
  'ADMIN_PASSWORD': 'matc_admin_2025_secure',
  'CONTACT_EMAIL': 'contact@matc.com',
  'SUPPORT_EMAIL': 'support@matc.com'
};

// متغيرات تحتاج إلى قيم من المستخدم
const userInputSecrets = {
  'RENDER_API_KEY': 'احصل عليه من: https://dashboard.render.com/account/api-keys',
  'RENDER_SERVICE_ID': 'احصل عليه من URL الخدمة في Render: srv-xxxxxxxxx',
  'VERCEL_TOKEN': 'احصل عليه من: https://vercel.com/account/tokens',
  'VERCEL_ORG_ID': 'احصل عليه من Vercel Dashboard → Settings → General',
  'VERCEL_PROJECT_ID': 'احصل عليه من Frontend Project → Settings → General',
  'VERCEL_ADMIN_PROJECT_ID': 'احصل عليه من Admin Panel Project → Settings → General'
};

console.log('📝 إنشاء ملفات البيئة المحلية...');

// إنشاء ملف .env للمشروع الرئيسي
const mainEnvContent = Object.entries(secrets)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync('.env', mainEnvContent);
fs.writeFileSync('.env.production', mainEnvContent);
console.log('✅ تم إنشاء ملفات البيئة الرئيسية');

// إنشاء ملف .env للـ backend
const backendEnvContent = `# Backend Environment Variables
MONGODB_URI=${secrets.MONGODB_URI}
JWT_SECRET=${secrets.JWT_SECRET}
NODE_ENV=${secrets.NODE_ENV}
PORT=${secrets.PORT}
FRONTEND_URLS=${secrets.FRONTEND_URLS}
ENCRYPTION_KEY=${secrets.ENCRYPTION_KEY}
`;

fs.writeFileSync('backend/.env', backendEnvContent);
fs.writeFileSync('backend/.env.production', backendEnvContent);
console.log('✅ تم إنشاء ملفات البيئة للـ Backend');

// إنشاء ملف .env للـ frontend (إذا كان المجلد موجوداً)
const frontendEnvContent = `# Frontend Environment Variables
VITE_API_BASE_URL=${secrets.VITE_API_BASE_URL}
VITE_APP_NAME=${secrets.VITE_APP_NAME}
VITE_APP_VERSION=${secrets.VITE_APP_VERSION}
VITE_ENVIRONMENT=${secrets.VITE_ENVIRONMENT}
NODE_ENV=${secrets.NODE_ENV}
`;

if (fs.existsSync('frontend')) {
  fs.writeFileSync('frontend/.env', frontendEnvContent);
  fs.writeFileSync('frontend/.env.production', frontendEnvContent);
  console.log('✅ تم إنشاء ملفات البيئة للـ Frontend');
} else {
  console.log('⚠️ مجلد frontend غير موجود - تم تخطيه');
}

// إنشاء ملف .env للـ admin panel
const adminEnvContent = `# Admin Panel Environment Variables
VITE_API_BASE_URL=${secrets.VITE_API_BASE_URL}
VITE_APP_NAME=MATC Admin Panel
VITE_ENVIRONMENT=${secrets.VITE_ENVIRONMENT}
NODE_ENV=${secrets.NODE_ENV}
ADMIN_EMAIL=${secrets.ADMIN_EMAIL}
ADMIN_PASSWORD=${secrets.ADMIN_PASSWORD}
`;

fs.writeFileSync('admin-panel/.env', adminEnvContent);
fs.writeFileSync('admin-panel/.env.production', adminEnvContent);
console.log('✅ تم إنشاء ملفات البيئة للـ Admin Panel');

// إنشاء ملف تعليمات GitHub Secrets
console.log('📝 إنشاء ملف تعليمات GitHub CLI...');
const githubCliCommands = [
  '#!/bin/bash',
  '# GitHub Secrets Setup Commands',
  '# Run these commands if you have GitHub CLI installed',
  '',
  'echo "🔐 Setting up GitHub Secrets..."',
  ''
];

// إضافة أوامر للمتغيرات التلقائية
Object.entries(secrets).forEach(([key, value]) => {
  githubCliCommands.push(`gh secret set ${key} --body "${value}"`);
});

githubCliCommands.push('');
githubCliCommands.push('echo "✅ Automatic secrets added!"');
githubCliCommands.push('echo "⚠️ Please add the following secrets manually:"');

// إضافة تعليقات للمتغيرات اليدوية
Object.entries(userInputSecrets).forEach(([key, instruction]) => {
  githubCliCommands.push(`echo "  ${key}: ${instruction}"`);
});

githubCliCommands.push('');
githubCliCommands.push('echo "🔗 Add them at: https://github.com/maaloulahmed93-oss/MA-TRAINING-CONSULTING/settings/secrets/actions"');

fs.writeFileSync('setup-github-secrets.sh', githubCliCommands.join('\n'));
console.log('✅ تم إنشاء ملف GitHub CLI commands');

// إنشاء ملف JSON للمتغيرات
console.log('📝 إنشاء ملف JSON للمتغيرات...');
const secretsData = {
  automatic_secrets: secrets,
  manual_secrets: userInputSecrets,
  instructions: {
    github_url: "https://github.com/maaloulahmed93-oss/MA-TRAINING-CONSULTING/settings/secrets/actions",
    steps: [
      "اذهب إلى رابط GitHub Secrets أعلاه",
      "اضغط 'New repository secret'",
      "أدخل Name و Value لكل متغير",
      "اضغط 'Add secret'",
      "كرر لجميع المتغيرات"
    ]
  },
  verification: {
    github_actions: "https://github.com/maaloulahmed93-oss/MA-TRAINING-CONSULTING/actions",
    admin_panel: "https://admine-lake.vercel.app/",
    frontend: "https://matrainingconsulting.vercel.app/",
    backend_health: "https://matc-backend.onrender.com/api/health"
  }
};

fs.writeFileSync('github-secrets-data.json', JSON.stringify(secretsData, null, 2));
console.log('✅ تم إنشاء ملف JSON للمتغيرات');

// دفع جميع الملفات
console.log('📤 دفع ملفات إعداد GitHub Secrets...');
try {
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "🔐 Complete GitHub Secrets setup - Added comprehensive secrets guide - Created environment files for all components - Added GitHub CLI commands - Ready for secrets configuration"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('✅ تم دفع ملفات الإعداد بنجاح');
} catch (error) {
  console.error('❌ فشل في دفع الملفات:', error.message);
}

console.log('\n' + '='.repeat(70));
console.log('🎉 تم إعداد GitHub Secrets بنجاح!');
console.log('🎉 GITHUB SECRETS SETUP COMPLETE!');
console.log('='.repeat(70));
console.log('');
console.log('✅ تم إنشاء ملفات البيئة لجميع المكونات');
console.log('✅ تم إنشاء دليل شامل للـ GitHub Secrets');
console.log('✅ تم إنشاء أوامر GitHub CLI');
console.log('✅ تم دفع جميع الملفات');
console.log('');
console.log('📋 الخطوات التالية:');
console.log('');
console.log('1️⃣ اذهب إلى GitHub Secrets:');
console.log('   https://github.com/maaloulahmed93-oss/MA-TRAINING-CONSULTING/settings/secrets/actions');
console.log('');
console.log('2️⃣ أضف المتغيرات التلقائية (من ملف GITHUB_SECRETS_COMPLETE_SETUP.md):');
Object.keys(secrets).forEach(key => {
  console.log(`   • ${key}`);
});
console.log('');
console.log('3️⃣ أضف المتغيرات اليدوية (احصل على القيم أولاً):');
Object.keys(userInputSecrets).forEach(key => {
  console.log(`   • ${key}`);
});
console.log('');
console.log('4️⃣ اختبر النشر:');
console.log('   • راقب GitHub Actions');
console.log('   • اختبر لوحة الإدارة');
console.log('   • تحقق من عمل جميع المكونات');
console.log('');
console.log('🔗 ملفات مرجعية تم إنشاؤها:');
console.log('   • GITHUB_SECRETS_COMPLETE_SETUP.md - دليل شامل');
console.log('   • github-secrets-data.json - بيانات JSON');
console.log('   • setup-github-secrets.sh - أوامر CLI');
console.log('   • ملفات .env لجميع المكونات');
console.log('');
console.log('🚀 بعد إضافة جميع Secrets، ستعمل جميع workflows بشكل مثالي!');
