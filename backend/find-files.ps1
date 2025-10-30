# Find Files on Cloudinary
# Checks both old and new folder locations

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Find Files on Cloudinary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set Cloudinary credentials
$env:CLOUDINARY_CLOUD_NAME = "djvtktjgc"
$env:CLOUDINARY_API_KEY = "356742572655489"
$env:CLOUDINARY_API_SECRET = "wwBzEb72vJqWsW8GmCxnNFC6dfo"

Write-Host "Searching for files in both locations..." -ForegroundColor Green
Write-Host ""

# Create a Node.js script to search
$searchScript = @"
import cloudinary from './config/cloudinary.js';

async function searchFiles() {
  try {
    console.log('🔍 Searching in OLD location: matc/attestations/');
    console.log('─'.repeat(80));
    
    try {
      const oldFolder = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'raw',
        prefix: 'matc/attestations/',
        max_results: 100
      });
      
      if (oldFolder.resources && oldFolder.resources.length > 0) {
        console.log('✅ Found', oldFolder.resources.length, 'file(s) in OLD location:\n');
        oldFolder.resources.forEach(file => {
          console.log('  📄', file.public_id);
          console.log('     Size:', (file.bytes / 1024).toFixed(2), 'KB');
          console.log('     URL:', file.secure_url);
          console.log('');
        });
      } else {
        console.log('❌ No files found in OLD location\n');
      }
    } catch (error) {
      console.log('❌ Error accessing OLD location:', error.message, '\n');
    }
    
    console.log('🔍 Searching in NEW location: matc_attestations/');
    console.log('─'.repeat(80));
    
    try {
      const newFolder = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'raw',
        prefix: 'matc_attestations/',
        max_results: 100
      });
      
      if (newFolder.resources && newFolder.resources.length > 0) {
        console.log('✅ Found', newFolder.resources.length, 'file(s) in NEW location:\n');
        newFolder.resources.forEach(file => {
          console.log('  📄', file.public_id);
          console.log('     Size:', (file.bytes / 1024).toFixed(2), 'KB');
          console.log('     URL:', file.secure_url);
          console.log('');
        });
      } else {
        console.log('❌ No files found in NEW location\n');
      }
    } catch (error) {
      console.log('❌ Error accessing NEW location:', error.message, '\n');
    }
    
    console.log('💡 RECOMMENDATION:');
    console.log('─'.repeat(80));
    console.log('If files are in OLD location (matc/attestations/):');
    console.log('  → Move them to NEW location (matc_attestations/)');
    console.log('  → Or re-upload from Admin Panel');
    console.log('');
    console.log('If files are in NEW location (matc_attestations/):');
    console.log('  → They should work now!');
    console.log('  → Test: https://matc-backend.onrender.com/api/attestations/CERT-2025-M-M-004/download/attestation');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

searchFiles();
"@

# Save the script temporarily
$searchScript | Out-File -FilePath "temp-search-files.mjs" -Encoding UTF8

# Run it
& node temp-search-files.mjs

# Clean up
Remove-Item "temp-search-files.mjs"

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
