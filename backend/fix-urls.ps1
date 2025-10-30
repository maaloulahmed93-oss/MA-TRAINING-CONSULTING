# Fix Cloudinary URLs Script
# Changes matc/attestations to matc_attestations in MongoDB

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix Cloudinary URLs in MongoDB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# MongoDB URI
$mongoUri = "mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db"

Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "  1. Find all URLs with 'matc/attestations'" -ForegroundColor Gray
Write-Host "  2. Replace with 'matc_attestations'" -ForegroundColor Gray
Write-Host "  3. Update MongoDB records" -ForegroundColor Gray
Write-Host ""

$confirmation = Read-Host "Continue? (Y/N)"

if ($confirmation -ne 'Y' -and $confirmation -ne 'y') {
    Write-Host "Operation cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Running fix script..." -ForegroundColor Green
Write-Host ""

# Set environment variable
$env:MONGODB_URI = $mongoUri

# Run the fix script
& node scripts/fixCloudinaryPaths.js

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now let's verify the fix..." -ForegroundColor Yellow
Write-Host ""

# Set Cloudinary credentials
$env:CLOUDINARY_CLOUD_NAME = "djvtktjgc"
$env:CLOUDINARY_API_KEY = "356742572655489"
$env:CLOUDINARY_API_SECRET = "wwBzEb72vJqWsW8GmCxnNFC6dfo"

# Run verification
& node scripts/verifyCloudinaryFiles.js

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
