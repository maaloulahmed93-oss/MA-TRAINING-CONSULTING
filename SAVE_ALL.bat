@echo off
echo ========================================
echo    SAUVEGARDE AUTOMATIQUE GITHUB
echo ========================================
echo.

cd /d "C:\Users\ahmed\Desktop\ss1\MA-TRAINING-CONSULTING"

echo [1/4] Ajout des fichiers...
git add .

echo.
echo [2/4] Commit...
git commit -m "feat: Bouton Modifier + Scripts Debug + Documentation complete"

echo.
echo [3/4] Push vers GitHub...
git push origin main

echo.
echo [4/4] Verification...
git log --oneline -1

echo.
echo ========================================
echo    SAUVEGARDE TERMINEE !
echo ========================================
echo.
pause
