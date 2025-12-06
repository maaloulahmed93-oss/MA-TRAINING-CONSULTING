@echo off
REM Automated Backend Deployment Script for Render
REM This script commits changes and pushes to GitHub for auto-deployment

echo.
echo ========================================
echo  MATC Backend Deployment Script
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com
    pause
    exit /b 1
)

REM Navigate to project root
cd /d "%~dp0"

echo 📁 Current directory: %cd%
echo.

REM Check git status
echo 🔍 Checking git status...
git status
echo.

REM Ask for confirmation
set /p confirm="Do you want to deploy these changes? (y/n): "
if /i not "%confirm%"=="y" (
    echo ❌ Deployment cancelled
    exit /b 0
)

echo.
echo 📦 Staging changes...
git add -A
if errorlevel 1 (
    echo ❌ Failed to stage changes
    pause
    exit /b 1
)

echo ✅ Changes staged

echo.
echo 💬 Enter commit message (or press Enter for default):
set /p message="Commit message: "

if "%message%"=="" (
    set message=🚀 Performance optimization: Fix N+1 queries, add caching, optimize partnerships endpoint
)

echo.
echo 📝 Committing changes with message: "%message%"
git commit -m "%message%"
if errorlevel 1 (
    echo ❌ Failed to commit changes
    pause
    exit /b 1
)

echo ✅ Changes committed

echo.
echo 🚀 Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo ❌ Failed to push to GitHub
    echo Please check your internet connection and try again
    pause
    exit /b 1
)

echo ✅ Pushed to GitHub

echo.
echo ========================================
echo  ✅ Deployment Initiated!
echo ========================================
echo.
echo 📊 Next Steps:
echo   1. Render will auto-deploy your changes
echo   2. Monitor progress at: https://dashboard.render.com
echo   3. Check health endpoint: https://matc-backend.onrender.com/api/health
echo   4. Verify partnerships endpoint: https://matc-backend.onrender.com/api/partnerships
echo.
echo 📝 Deployment typically takes 2-5 minutes
echo.
pause
