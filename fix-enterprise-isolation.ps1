# Script PowerShell pour corriger l'isolation Enterprise
# Exécuter: .\fix-enterprise-isolation.ps1

Write-Host "🔒 CORRECTION DE L'ISOLATION ENTERPRISE - MATC SYSTEM" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

$basePath = "c:\Users\ahmed\Desktop\MATC SITE"
$servicesPath = "$basePath\admin-panel\src\services"

try {
    # Étape 1: Vérifier les fichiers
    Write-Host "`n1️⃣ Vérification des fichiers..." -ForegroundColor Yellow
    
    $originalFile = "$servicesPath\partnersApiService.ts"
    $fixedFile = "$servicesPath\partnersApiService-fixed.ts"
    $backupFile = "$servicesPath\partnersApiService-backup.ts"
    
    if (-not (Test-Path $originalFile)) {
        Write-Host "❌ Fichier original non trouvé: $originalFile" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Test-Path $fixedFile)) {
        Write-Host "❌ Fichier corrigé non trouvé: $fixedFile" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Fichiers trouvés" -ForegroundColor Green
    
    # Étape 2: Sauvegarde
    Write-Host "`n2️⃣ Sauvegarde de l'ancien service..." -ForegroundColor Yellow
    
    if (Test-Path $backupFile) {
        Write-Host "⚠️ Backup existant trouvé, création d'un nouveau..." -ForegroundColor Yellow
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $backupFile = "$servicesPath\partnersApiService-backup-$timestamp.ts"
    }
    
    Copy-Item $originalFile $backupFile
    Write-Host "✅ Sauvegarde créée: $(Split-Path $backupFile -Leaf)" -ForegroundColor Green
    
    # Étape 3: Remplacement
    Write-Host "`n3️⃣ Remplacement par le service corrigé..." -ForegroundColor Yellow
    
    Copy-Item $fixedFile $originalFile -Force
    Write-Host "✅ Service remplacé avec succès" -ForegroundColor Green
    
    # Étape 4: Vérification
    Write-Host "`n4️⃣ Vérification du remplacement..." -ForegroundColor Yellow
    
    $content = Get-Content $originalFile -Raw
    if ($content -match "getEnterpriseProjects") {
        Write-Host "✅ Méthodes Enterprise détectées" -ForegroundColor Green
    } else {
        Write-Host "❌ Méthodes Enterprise non trouvées" -ForegroundColor Red
        Write-Host "🔄 Restauration de la sauvegarde..." -ForegroundColor Yellow
        Copy-Item $backupFile $originalFile -Force
        exit 1
    }
    
    # Étape 5: Instructions suivantes
    Write-Host "`n🎉 CORRECTION APPLIQUÉE AVEC SUCCÈS!" -ForegroundColor Green
    Write-Host "=" * 60 -ForegroundColor Gray
    
    Write-Host "`n📋 PROCHAINES ÉTAPES:" -ForegroundColor Cyan
    Write-Host "1. Redémarrer le serveur de développement Admin Panel" -ForegroundColor White
    Write-Host "2. Ouvrir: test-enterprise-isolation-final.html" -ForegroundColor White
    Write-Host "3. Cliquer: 'Lancer Test Complet'" -ForegroundColor White
    Write-Host "4. Vérifier que l'isolation fonctionne" -ForegroundColor White
    
    Write-Host "`n🔧 COMMANDES UTILES:" -ForegroundColor Cyan
    Write-Host "cd admin-panel; npm run dev  # Redemarrer Admin Panel" -ForegroundColor Gray
    Write-Host "node validate-enterprise-isolation.js  # Test backend" -ForegroundColor Gray
    
    Write-Host "`n💾 FICHIERS CRÉÉS:" -ForegroundColor Cyan
    Write-Host "- Sauvegarde: $(Split-Path $backupFile -Leaf)" -ForegroundColor Gray
    Write-Host "- Service corrigé: partnersApiService.ts (remplacé)" -ForegroundColor Gray
    Write-Host "- Guide: GUIDE-IMPLEMENTATION-FINALE.md" -ForegroundColor Gray
    Write-Host "- Tests: test-enterprise-isolation-final.html" -ForegroundColor Gray
    
    Write-Host "`n🎯 RÉSULTAT ATTENDU:" -ForegroundColor Cyan
    Write-Host "Chaque partenaire ne verra que ses propres données" -ForegroundColor Green
    Write-Host "Fin du problème de données partagées" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔄 Aucune modification appliquée" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ Script terminé avec succès!" -ForegroundColor Green
