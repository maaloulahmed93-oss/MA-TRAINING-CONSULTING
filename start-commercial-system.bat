@echo off
title MATC - Système Commercial Complet
color 0A

echo.
echo ========================================
echo    MATC - Système Commercial Complet
echo ========================================
echo.
echo Démarrage de tous les services...
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Node.js n'est pas installé ou pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js détecté
echo.

REM Démarrer le Backend
echo [1/3] Démarrage du Backend (Port 3001)...
start "MATC Backend" cmd /k "cd /d backend && echo Démarrage Backend MATC... && npm run dev"
timeout /t 3 >nul

REM Démarrer le Frontend
echo [2/3] Démarrage du Frontend (Port 5173)...
start "MATC Frontend" cmd /k "echo Démarrage Frontend MATC... && npm run dev"
timeout /t 3 >nul

REM Démarrer l'Admin Panel
echo [3/3] Démarrage de l'Admin Panel (Port 8536)...
start "MATC Admin Panel" cmd /k "cd /d admin-panel && echo Démarrage Admin Panel MATC... && npm run dev"
timeout /t 5 >nul

echo.
echo ========================================
echo           Services Démarrés!
echo ========================================
echo.
echo 🌐 URLs d'accès:
echo.
echo   Frontend Principal:
echo   http://localhost:5173
echo.
echo   Espace Commercial:
echo   http://localhost:5173/espace-commercial-new
echo.
echo   Admin Panel:
echo   http://localhost:8536
echo.
echo   API Backend:
echo   http://localhost:3001/api/health
echo.
echo ========================================
echo           Informations Système
echo ========================================
echo.
echo 🔐 Code Secret Admin: 20388542
echo 👤 ID Commercial Test: COMM-123456
echo 📊 Dashboard: 3 onglets (Dashboard, Ventes, Clients)
echo 🎯 Niveaux: Apprenti → Confirmé → Partenaire
echo.
echo ========================================
echo              Tests Disponibles
echo ========================================
echo.
echo 🧪 Test Complet: test-commercial-complete-system.html
echo 🚀 Test Avancé: test-commercial-advanced.html
echo 📋 Documentation: COMMERCIAL-SYSTEM-README.md
echo.
echo Appuyez sur une touche pour ouvrir les tests...
pause >nul

REM Ouvrir les fichiers de test
start "" "test-commercial-complete-system.html"
timeout /t 2 >nul
start "" "http://localhost:5173/espace-commercial-new"
timeout /t 2 >nul
start "" "http://localhost:8536/commercial-services"

echo.
echo ✅ Système Commercial MATC démarré avec succès!
echo.
echo Pour arrêter les services, fermez les fenêtres de commande.
echo.
pause
