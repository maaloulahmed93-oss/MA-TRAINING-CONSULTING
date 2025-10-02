@echo off
echo ========================================
echo  MATC - Système Commercial
echo  Démarrage de tous les services
echo ========================================

echo.
echo 1. Démarrage du Backend (Port 3001)...
start "MATC Backend" cmd /k "cd /d \"%~dp0backend\" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo 2. Démarrage du Site Principal (Port 5173)...
start "MATC Main Site" cmd /k "cd /d \"%~dp0\" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo 3. Démarrage de l'Admin Panel (Port 8536)...
start "MATC Admin Panel" cmd /k "cd /d \"%~dp0admin-panel\" && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo  Tous les services sont démarrés!
echo ========================================
echo.
echo Backend API:     http://localhost:3001
echo Site Principal:  http://localhost:5173
echo Admin Panel:     http://localhost:8536
echo.
echo Espace Commercial: http://localhost:5173/espace-commercial-new
echo Services Commerciaux Admin: http://localhost:8536/commercial-services
echo.
echo Test System: file:///%~dp0test-commercial-new-system.html
echo.
echo Appuyez sur une touche pour ouvrir les URLs...
pause >nul

start http://localhost:3001/api/health
start http://localhost:5173/espace-commercial-new
start http://localhost:8536/commercial-services
start file:///%~dp0test-commercial-new-system.html

echo.
echo Système Commercial prêt!
echo Appuyez sur une touche pour fermer...
pause >nul
