@echo off
echo ========================================
echo    MATC Deployment Execution Script
echo ========================================
echo.

echo [1/6] Replacing Vite configurations...
copy /Y vite.config.optimized.ts vite.config.ts
cd admin-panel
copy /Y vite.config.optimized.ts vite.config.ts
cd ..
echo ✅ Vite configs replaced

echo.
echo [2/6] Installing dependencies...
echo Installing frontend dependencies...
npm install
echo Installing admin panel dependencies...
cd admin-panel
npm install
cd ..
echo ✅ Dependencies installed

echo.
echo [3/6] Testing builds...
echo Testing frontend build...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo Testing admin panel build...
cd admin-panel
npm run build
if %errorlevel% neq 0 (
    echo ❌ Admin panel build failed!
    pause
    exit /b 1
)
cd ..
echo ✅ Both builds successful

echo.
echo [4/6] Testing preview servers...
echo Starting frontend preview (will open in background)...
start /B npm run preview
timeout /t 5 /nobreak > nul

echo Starting admin panel preview (will open in background)...
cd admin-panel
start /B npm run preview
cd ..
timeout /t 5 /nobreak > nul
echo ✅ Preview servers started

echo.
echo [5/6] Git operations...
git add .
git status
echo.
echo Committing changes...
git commit -m "chore: add optimized vite config & switch preview to serve"
echo.
echo Pushing to main branch...
git push origin main
if %errorlevel% neq 0 (
    echo ⚠️ Git push failed - check your git configuration
    echo Continue anyway? (Y/N)
    set /p continue=
    if /i "%continue%" neq "Y" exit /b 1
)
echo ✅ Git operations completed

echo.
echo [6/6] Opening test pages...
echo Opening deployment test page...
start vercel-deployment-test.html
echo Opening QA test pages...
start qa-connectivity-test.html
echo ✅ Test pages opened

echo.
echo ========================================
echo     DEPLOYMENT SCRIPT COMPLETED!
echo ========================================
echo.
echo Next steps:
echo 1. Set environment variables in Vercel Dashboard
echo 2. Trigger redeployments for both projects
echo 3. Run the test pages that just opened
echo 4. Execute cURL commands for verification
echo.
echo Environment Variables to set in Vercel:
echo Frontend: VITE_API_BASE_URL=https://matc-backend.onrender.com/api
echo Admin: VITE_API_BASE_URL=https://matc-backend.onrender.com/api
echo.
pause
