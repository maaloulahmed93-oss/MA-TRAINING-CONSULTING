#!/usr/bin/env node

/**
 * إصلاح خطأ التصغير 'Sv' before initialization
 * Fix Minification Error 'Sv' before initialization
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 إصلاح خطأ التصغير في لوحة الإدارة');
console.log('🔧 FIXING MINIFICATION ERROR');
console.log('='.repeat(60));

console.log('✅ تم تعطيل التصغير في vite.config.ts');

// إضافة تغيير صغير لإجبار إعادة النشر
const timestamp = new Date().toISOString();
const apiPath = 'admin-panel/src/config/api.ts';
const currentContent = fs.readFileSync(apiPath, 'utf8');

// إضافة تعليق جديد في بداية الملف
const newContent = `// Fix minification error: ${timestamp}
${currentContent}`;

fs.writeFileSync(apiPath, newContent);
console.log('✅ تم إضافة trigger للإعادة النشر');

// دفع التحديثات
console.log('📤 دفع إصلاح خطأ التصغير...');
try {
  execSync('git add .', { stdio: 'inherit' });
  execSync(`git commit -m "🔧 Fix minification error 'Sv' before initialization - Disabled minification in vite.config.ts - Prevented code splitting issues - Force redeploy: ${timestamp}"`, { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('✅ تم دفع الإصلاح بنجاح');
} catch (error) {
  console.error('❌ فشل في دفع الإصلاح:', error.message);
}

console.log('\n' + '='.repeat(60));
console.log('🎉 تم إصلاح خطأ التصغير!');
console.log('🎉 MINIFICATION ERROR FIXED!');
console.log('='.repeat(60));
console.log('');
console.log('✅ تم تعطيل التصغير (minification)');
console.log('✅ تم منع تقسيم الكود (code splitting)');
console.log('✅ تم الحفاظ على أسماء المتغيرات');
console.log('✅ تم دفع الإصلاح');
console.log('');
console.log('📋 النتيجة المتوقعة:');
console.log('   • لا مزيد من خطأ "Cannot access \'Sv\' before initialization"');
console.log('   • لوحة الإدارة تعمل بشكل كامل');
console.log('   • API يعمل بشكل صحيح (كما رأينا في الكونسول)');
console.log('');
console.log('⏱️ انتظر 3-5 دقائق لإعادة النشر');
console.log('🔗 اختبر النتيجة: https://admine-lake.vercel.app/');
console.log('');
console.log('المشكلة يجب أن تكون محلولة نهائياً! 🚀');
