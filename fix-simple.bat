@echo off
echo 🔧 اصلاح مشكلة اضافة المشاريع
echo ================================

cd /d "c:\Users\ahmed\Desktop\MATC SITE"

echo 📁 نسخ الملف المصحح...
copy "admin-panel\src\services\partnersApiService-fixed.ts" "admin-panel\src\services\partnersApiService.ts" >nul 2>&1

if %errorlevel% equ 0 (
    echo ✅ تم نسخ الملف بنجاح
) else (
    echo ❌ فشل في نسخ الملف
    pause
    exit /b 1
)

echo 🧪 اختبار الاصلاح...
node fix-project-creation.js

echo.
echo 🎉 الاصلاح مكتمل!
echo 📋 الخطوات التالية:
echo 1. اعد تشغيل Admin Panel
echo 2. جرب اضافة مشروع جديد
echo 3. تاكد من ان المشروع يظهر للشريك المحدد فقط

pause
