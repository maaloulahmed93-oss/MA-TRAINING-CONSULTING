@echo off
echo ========================================
echo    MATC Backend Fix Tool
echo ========================================
echo.

cd /d "C:\Users\ahmed\Desktop\MATC SITE\backend"

echo 🔍 Checking if backend directory exists...
if not exist "server.js" (
    echo ❌ Backend directory not found!
    echo Please make sure you're in the correct directory.
    pause
    exit /b 1
)

echo ✅ Backend directory found!
echo.

echo 🔍 Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js found!
echo.

echo 🔍 Installing dependencies...
npm install

echo.
echo 🚀 Starting Backend Server...
echo.
echo Backend will start on: http://localhost:3001
echo Health check: http://localhost:3001/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
