@echo off
echo 🚀 تشغيل Backend مع نظام القرارات...
echo.

cd /d "C:\Users\ahmed\Desktop\MATC SITE\backend"

echo 📋 التحقق من وجود node_modules...
if not exist "node_modules" (
    echo ⚠️ node_modules غير موجود، تثبيت المكتبات...
    npm install
)

echo [2/3] Navigating to backend directory...
cd backend

echo [3/3] Starting Backend server...
echo.
echo Backend will start on: http://localhost:3001
echo Press Ctrl+C to stop the server
echo.
npm start

pause
