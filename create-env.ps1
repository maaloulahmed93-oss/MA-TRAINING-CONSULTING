# PowerShell Script to Create .env File
# Run this with: .\create-env.ps1

$envContent = @"
# MongoDB
MONGODB_URI=mongodb+srv://your-connection-string-here

# Server
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://rkdchtqalnigwdekbmeu.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrZGNodHFhbG5pZ3dkZWtibWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjUwODYsImV4cCI6MjA3NzM0MTA4Nn0.2OqpRvjyQR5QSYpjjqIir78tpGGUJENYY68rDsF07iY
"@

$envPath = ".\backend\.env"

Write-Host "📝 Creating .env file..." -ForegroundColor Cyan
Write-Host "📍 Path: $envPath" -ForegroundColor Gray

# Create the file
$envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline

if (Test-Path $envPath) {
    Write-Host "✅ .env file created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 File contents:" -ForegroundColor Yellow
    Get-Content $envPath
    Write-Host ""
    Write-Host "🧪 Test the connection with:" -ForegroundColor Cyan
    Write-Host "   node backend/scripts/testSupabaseConnection.js" -ForegroundColor White
} else {
    Write-Host "❌ Failed to create .env file" -ForegroundColor Red
}
