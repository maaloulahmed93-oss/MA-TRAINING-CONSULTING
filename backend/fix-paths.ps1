# Fix Cloudinary Paths Script
# PowerShell version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix Cloudinary Paths Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "MongoDB URI detected from previous command!" -ForegroundColor Green
Write-Host ""

# Use the MongoDB URI that was already set
$mongoUri = "mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db"

Write-Host "Running fix script..." -ForegroundColor Green
Write-Host ""

# Set environment variable and run in same process
$env:MONGODB_URI = $mongoUri

# Run the script directly with node
& node scripts/fixCloudinaryPaths.js

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Script completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
