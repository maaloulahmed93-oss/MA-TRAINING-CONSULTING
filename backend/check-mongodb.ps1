# Check MongoDB URLs Script
# Shows actual URLs stored in database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Check MongoDB URLs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# MongoDB URI
$mongoUri = "mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db"

Write-Host "Connecting to MongoDB..." -ForegroundColor Green
Write-Host ""

# Set environment variable
$env:MONGODB_URI = $mongoUri

# Create a simple Node.js script to check URLs
$checkScript = @"
import mongoose from 'mongoose';
import Attestation from './models/Attestation.js';

const mongoUri = process.env.MONGODB_URI;

async function checkUrls() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    const attestations = await Attestation.find({ isActive: true });
    console.log('📋 Found', attestations.length, 'attestation(s)\n');
    
    for (const att of attestations) {
      console.log('📄', att.attestationId, '-', att.fullName);
      console.log('─'.repeat(80));
      
      if (att.documents.attestation) {
        console.log('  Attestation URL:');
        console.log('  ', att.documents.attestation);
        if (att.documents.attestation.includes('matc/attestations')) {
          console.log('  ❌ Contains matc/attestations (WRONG)');
        } else if (att.documents.attestation.includes('matc_attestations')) {
          console.log('  ✅ Contains matc_attestations (CORRECT)');
        }
      }
      
      if (att.documents.recommandation) {
        console.log('  Recommandation URL:');
        console.log('  ', att.documents.recommandation);
        if (att.documents.recommandation.includes('matc/attestations')) {
          console.log('  ❌ Contains matc/attestations (WRONG)');
        } else if (att.documents.recommandation.includes('matc_attestations')) {
          console.log('  ✅ Contains matc_attestations (CORRECT)');
        }
      }
      
      if (att.documents.evaluation) {
        console.log('  Evaluation URL:');
        console.log('  ', att.documents.evaluation);
        if (att.documents.evaluation.includes('matc/attestations')) {
          console.log('  ❌ Contains matc/attestations (WRONG)');
        } else if (att.documents.evaluation.includes('matc_attestations')) {
          console.log('  ✅ Contains matc_attestations (CORRECT)');
        }
      }
      
      console.log('');
    }
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUrls();
"@

# Save the script temporarily
$checkScript | Out-File -FilePath "temp-check-urls.mjs" -Encoding UTF8

# Run it
& node temp-check-urls.mjs

# Clean up
Remove-Item "temp-check-urls.mjs"

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
