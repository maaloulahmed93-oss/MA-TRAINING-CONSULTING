# Update CERT-2025-M-M-004 URLs
# Simple PowerShell script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Update CERT-2025-M-M-004 URLs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set all environment variables
$env:MONGODB_URI = "mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db"
$env:CLOUDINARY_CLOUD_NAME = "djvtktjgc"
$env:CLOUDINARY_API_KEY = "356742572655489"
$env:CLOUDINARY_API_SECRET = "wwBzEb72vJqWsW8GmCxnNFC6dfo"

Write-Host "Running update script..." -ForegroundColor Green
Write-Host ""

# Run the update script
& node scripts/updateUrls.js

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Update completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
