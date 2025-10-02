@echo off
echo 🚀 تشغيل Backend مع نظام القرارات...
echo.

cd /d "C:\Users\ahmed\Desktop\MATC SITE\backend"

echo 📋 التحقق من وجود node_modules...
if not exist "node_modules" (
    echo ⚠️ node_modules غير موجود، تثبيت المكتبات...
    npm install
)

echo.
echo 🚀 بدء تشغيل Backend...
echo 🔗 Backend سيعمل على: http://localhost:3001
echo 📊 API endpoint: http://localhost:3001/api/freelancer-decisions
echo.
echo ⏹️ لإيقاف Backend اضغط Ctrl+C
echo.

npm start

pause
