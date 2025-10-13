#!/usr/bin/env node

/**
 * نشر مباشر إلى Vercel - تجاوز GitHub Actions
 * Direct Vercel Deployment - Bypass GitHub Actions
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 نشر مباشر إلى Vercel');
console.log('🚀 DIRECT VERCEL DEPLOYMENT');
console.log('='.repeat(60));

// التحقق من وجود المجلد
if (!fs.existsSync('admin-panel')) {
  console.error('❌ مجلد admin-panel غير موجود');
  process.exit(1);
}

console.log('✅ مجلد لوحة الإدارة موجود');

// الانتقال إلى مجلد لوحة الإدارة
process.chdir('admin-panel');

console.log('📦 تثبيت التبعيات...');
try {
  execSync('npm ci', { stdio: 'inherit' });
  console.log('✅ تم تثبيت التبعيات');
} catch (error) {
  console.error('❌ فشل تثبيت التبعيات:', error.message);
  process.exit(1);
}

console.log('🏗️ بناء المشروع...');
try {
  execSync('npm run build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_API_BASE_URL: 'https://matc-backend.onrender.com/api',
      NODE_ENV: 'production'
    }
  });
  console.log('✅ تم بناء المشروع بنجاح');
} catch (error) {
  console.error('❌ فشل بناء المشروع:', error.message);
  process.exit(1);
}

console.log('🚀 نشر إلى Vercel...');
try {
  // محاولة النشر المباشر
  console.log('📤 محاولة النشر المباشر...');
  
  // إنشاء ملف vercel.json محلي
  const vercelConfig = {
    "name": "matc-admin-panel",
    "version": 2,
    "builds": [
      {
        "src": "dist/**",
        "use": "@vercel/static"
      }
    ],
    "routes": [
      {
        "src": "/(.*)",
        "dest": "/dist/index.html"
      }
    ],
    "env": {
      "VITE_API_BASE_URL": "https://matc-backend.onrender.com/api",
      "NODE_ENV": "production"
    }
  };
  
  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  console.log('✅ تم إنشاء ملف vercel.json');
  
  // محاولة النشر باستخدام npx vercel
  console.log('🚀 بدء النشر إلى Vercel...');
  
  // تثبيت vercel CLI إذا لم يكن موجوداً
  try {
    execSync('npx vercel --version', { stdio: 'pipe' });
  } catch {
    console.log('📦 تثبيت Vercel CLI...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
  }
  
  // النشر
  execSync('npx vercel --prod --yes', {
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_API_BASE_URL: 'https://matc-backend.onrender.com/api',
      NODE_ENV: 'production'
    }
  });
  
  console.log('✅ تم النشر إلى Vercel بنجاح!');
  
} catch (error) {
  console.error('❌ فشل النشر إلى Vercel:', error.message);
  console.log('');
  console.log('🔧 حلول بديلة:');
  console.log('1. تأكد من تسجيل الدخول إلى Vercel:');
  console.log('   npx vercel login');
  console.log('2. أو ارفع مجلد dist يدوياً إلى Vercel Dashboard');
  console.log('3. أو استخدم GitHub Actions بعد إضافة Secrets');
}

console.log('\n' + '='.repeat(60));
console.log('📋 ملخص النشر');
console.log('='.repeat(60));
console.log('');
console.log('✅ تم بناء المشروع محلياً');
console.log('✅ تم إنشاء ملفات الإنتاج في مجلد dist/');
console.log('');
console.log('🔗 روابط مهمة:');
console.log('   • لوحة الإدارة: https://admine-lake.vercel.app/');
console.log('   • Vercel Dashboard: https://vercel.com/dashboard');
console.log('   • GitHub Actions: https://github.com/maaloulahmed93-oss/MA-TRAINING-CONSULTING/actions');
console.log('');
console.log('💡 إذا لم يعمل النشر التلقائي:');
console.log('   1. اذهب إلى https://vercel.com/dashboard');
console.log('   2. ابحث عن مشروع admine-lake');
console.log('   3. اضغط "Redeploy" يدوياً');
console.log('   4. أو ارفع مجلد dist/ يدوياً');
console.log('');
console.log('المشروع جاهز للنشر! 🚀');
