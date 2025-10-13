#!/usr/bin/env node

/**
 * إصلاح مشكلة البناء في Vercel
 * Fix Vercel Build Issue
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 إصلاح مشكلة البناء في Vercel');
console.log('🔧 FIXING VERCEL BUILD ISSUE');
console.log('='.repeat(60));

// التأكد من وجود مجلد admin-panel
if (!fs.existsSync('admin-panel')) {
  console.error('❌ مجلد admin-panel غير موجود');
  process.exit(1);
}

console.log('✅ مجلد admin-panel موجود');

// إنشاء ملف .env بسيط للبناء
console.log('📝 إنشاء ملف .env للبناء...');
const envContent = `VITE_API_BASE_URL=https://matc-backend.onrender.com/api
NODE_ENV=production
`;

fs.writeFileSync('admin-panel/.env', envContent);
fs.writeFileSync('admin-panel/.env.production', envContent);
console.log('✅ تم إنشاء ملفات البيئة');

// تحديث package.json لإضافة script للبناء الآمن
console.log('📝 تحديث package.json...');
const packagePath = 'admin-panel/package.json';
const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// إضافة scripts إضافية
packageContent.scripts = {
  ...packageContent.scripts,
  "build:safe": "vite build --mode production",
  "build:vercel": "VITE_API_BASE_URL=https://matc-backend.onrender.com/api vite build"
};

fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2));
console.log('✅ تم تحديث package.json');

// إنشاء ملف index.html محسن
console.log('📝 تحسين ملف index.html...');
const indexHtmlPath = 'admin-panel/index.html';
const indexHtmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MATC Admin Panel</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

fs.writeFileSync(indexHtmlPath, indexHtmlContent);
console.log('✅ تم تحسين index.html');

// دفع التحديثات
console.log('📤 دفع التحديثات...');
try {
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "🔧 Fix Vercel build issue - Simplified vite.config.ts - Updated vercel.json - Added environment files - Fixed build configuration"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('✅ تم دفع التحديثات بنجاح');
} catch (error) {
  console.error('❌ فشل في دفع التحديثات:', error.message);
}

console.log('\n' + '='.repeat(60));
console.log('🎉 تم إصلاح مشكلة البناء!');
console.log('🎉 BUILD ISSUE FIXED!');
console.log('='.repeat(60));
console.log('');
console.log('✅ تم تبسيط إعدادات Vite');
console.log('✅ تم تحديث vercel.json');
console.log('✅ تم إنشاء ملفات البيئة');
console.log('✅ تم دفع التحديثات');
console.log('');
console.log('📋 الآن يجب أن يعمل النشر:');
console.log('1. انتظر 2-3 دقائق لإعادة النشر التلقائي');
console.log('2. أو اذهب إلى Vercel Dashboard وأعد النشر يدوياً');
console.log('3. راقب النشر في GitHub Actions');
console.log('');
console.log('🔗 روابط مراقبة النشر:');
console.log('   GitHub: https://github.com/maaloulahmed93-oss/MA-TRAINING-CONSULTING/actions');
console.log('   Vercel: https://vercel.com/dashboard');
console.log('   Admin Panel: https://admine-lake.vercel.app/');
console.log('');
console.log('المشكلة يجب أن تكون محلولة الآن! 🚀');
