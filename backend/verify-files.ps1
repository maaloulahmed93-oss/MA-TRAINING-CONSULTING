# Verify Cloudinary Files Script
# PowerShell version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verify Cloudinary Files Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Use the MongoDB URI
$mongoUri = "mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db"

Write-Host "Running verification script..." -ForegroundColor Green
Write-Host ""

# Set environment variable and run in same process
$env:MONGODB_URI = $mongoUri
$env:CLOUDINARY_CLOUD_NAME = "djvtktjgc"
$env:CLOUDINARY_API_KEY = "356742572655489"
$env:CLOUDINARY_API_SECRET = "wwBzEb72vJqWsW8GmCxnNFC6dfo"

# Run the script directly with node
& node scripts/verifyCloudinaryFiles.js

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
