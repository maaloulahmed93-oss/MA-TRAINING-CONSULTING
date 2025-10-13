@echo off
REM MATC Full-Stack Deployment Script for Windows
REM Quick deployment command for MATC project

echo.
echo ========================================
echo 🚀 MATC Full-Stack Deployment
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ package.json not found
    echo Please run this script from the MATC project root directory
    pause
    exit /b 1
)

echo ✅ Project directory confirmed
echo.

REM Run the deployment script
echo 🚀 Starting MATC deployment...
echo.

node deploy-matc.js

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ DEPLOYMENT COMPLETED SUCCESSFULLY!
    echo ========================================
    echo.
    echo 🔗 Backend API: https://matc-backend.onrender.com/api
    echo 🔗 Frontend: https://matrainingconsulting.vercel.app
    echo 🔗 Admin Panel: https://admine-lake.vercel.app
    echo.
    echo Check matc_auto_deploy_report.json for detailed results
) else (
    echo.
    echo ========================================
    echo ❌ DEPLOYMENT FAILED
    echo ========================================
    echo.
    echo Please check the error messages above
    echo and ensure all environment variables are set
)

echo.
pause
