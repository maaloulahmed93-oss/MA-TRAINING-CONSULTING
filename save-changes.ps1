# Script de sauvegarde automatique
Write-Host "🚀 SAUVEGARDE DES MODIFICATIONS" -ForegroundColor Cyan
Write-Host ""

# Ajouter tous les fichiers modifiés
Write-Host "📦 Ajout des fichiers..." -ForegroundColor Yellow
git add admin-panel/src/pages/AttestationsPage.tsx
git add admin-panel/src/components/attestations/AttestationForm.tsx
git add BOUTON_MODIFIER_ATTESTATIONS.md
git add backend/scripts/debugAttestations.js
git add backend/scripts/cleanOrphanedAttestations.js
git add DIAGNOSTIC_COMPLET_404.md
git add TESTS_VALIDATION_CURL.md
git add SOLUTION_ERREUR_404_ATTESTATIONS.md
git add GUIDE_RAPIDE_ERREUR_404.md

Write-Host "✅ Fichiers ajoutés" -ForegroundColor Green
Write-Host ""

# Commit
Write-Host "💾 Commit..." -ForegroundColor Yellow
git commit -m "feat: Bouton Modifier + Scripts Debug + Documentation 404

Modifications principales:
- Bouton Modifier attestations visible et fonctionnel
- Upload optionnel en mode edition
- Message informatif en mode edition
- Scripts debug et nettoyage attestations
- Documentation complete erreur 404
- Guide de tests avec curl

Ameliorations:
- UX amelioree pour modification attestations
- Fichiers existants conserves automatiquement
- Re-upload partiel supporte
- Analyse complete cause erreur 404
"

Write-Host "✅ Commit effectué" -ForegroundColor Green
Write-Host ""

# Push
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ SAUVEGARDE TERMINÉE" -ForegroundColor Green
Write-Host ""
