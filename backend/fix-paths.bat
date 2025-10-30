@echo off
chcp 65001 >nul
echo ========================================
echo Fix Cloudinary Paths Script
echo ========================================
echo.
echo Please paste your MONGODB_URI from Render:
echo (Go to: Render Dashboard ^> Environment ^> Copy MONGODB_URI)
echo.
set /p MONGODB_URI="MONGODB_URI: "
echo.
echo Running fix script...
echo.

REM Run the script with the environment variable
node scripts/fixCloudinaryPaths.js

echo.
echo ========================================
echo Script completed!
echo ========================================
pause
