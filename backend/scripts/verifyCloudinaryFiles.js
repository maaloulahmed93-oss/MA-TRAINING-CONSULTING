import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Attestation from '../models/Attestation.js';
import cloudinaryHelper from '../utils/cloudinaryHelper.js';

dotenv.config();

/**
 * Script to verify Cloudinary files and detect orphaned documents
 * Checks if files referenced in MongoDB actually exist on Cloudinary
 */

const verifyCloudinaryFiles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔍 CLOUDINARY FILES VERIFICATION');
    console.log('='.repeat(80));
    console.log('');

    // Fetch all attestations
    const attestations = await Attestation.find({ isActive: true });
    console.log(`📋 Found ${attestations.length} active attestation(s)\n`);

    const stats = {
      totalDocuments: 0,
      cloudinaryDocuments: 0,
      localDocuments: 0,
      validCloudinaryFiles: 0,
      missingCloudinaryFiles: 0,
      invalidUrls: 0,
      orphanedDocuments: []
    };

    for (const attestation of attestations) {
      console.log(`\n📄 ${attestation.attestationId} - ${attestation.fullName}`);
      console.log('-'.repeat(80));

      for (const docType of ['attestation', 'recommandation', 'evaluation']) {
        const docUrl = attestation.documents[docType];

        if (!docUrl) {
          console.log(`  ⏭️  ${docType}: No file`);
          continue;
        }

        stats.totalDocuments++;

        // Check if it's a URL
        if (!/^https?:\/\//i.test(docUrl)) {
          console.log(`  📁 ${docType}: Local file`);
          console.log(`     Path: ${docUrl}`);
          stats.localDocuments++;
          continue;
        }

        // Check if it's a Cloudinary URL
        if (!docUrl.includes('cloudinary.com')) {
          console.log(`  🌐 ${docType}: External URL (non-Cloudinary)`);
          console.log(`     URL: ${docUrl}`);
          stats.cloudinaryDocuments++;
          continue;
        }

        stats.cloudinaryDocuments++;
        console.log(`  ☁️  ${docType}: Cloudinary URL`);
        console.log(`     URL: ${docUrl.substring(0, 80)}...`);

        // Extract public_id
        const extraction = cloudinaryHelper.extractPublicId(docUrl);

        if (!extraction.success) {
          console.log(`  ❌ Invalid URL format: ${extraction.error}`);
          stats.invalidUrls++;
          stats.orphanedDocuments.push({
            attestationId: attestation.attestationId,
            fullName: attestation.fullName,
            docType,
            url: docUrl,
            issue: 'Invalid URL format',
            error: extraction.error
          });
          continue;
        }

        console.log(`     Public ID: ${extraction.publicId}`);
        console.log(`     Resource Type: ${extraction.resourceType}`);

        // Verify file exists on Cloudinary
        console.log(`     Verifying...`);
        const verification = await cloudinaryHelper.verifyCloudinaryFile(
          extraction.publicId,
          extraction.resourceType
        );

        if (verification.exists) {
          console.log(`  ✅ File exists on Cloudinary`);
          console.log(`     Size: ${(verification.details.bytes / 1024).toFixed(2)} KB`);
          console.log(`     Access: ${verification.details.accessMode}`);
          console.log(`     Created: ${new Date(verification.details.createdAt).toLocaleString()}`);
          stats.validCloudinaryFiles++;
        } else {
          console.log(`  ❌ File NOT found on Cloudinary`);
          console.log(`     Error: ${verification.error}`);
          stats.missingCloudinaryFiles++;
          stats.orphanedDocuments.push({
            attestationId: attestation.attestationId,
            fullName: attestation.fullName,
            docType,
            url: docUrl,
            publicId: extraction.publicId,
            resourceType: extraction.resourceType,
            issue: 'File missing on Cloudinary',
            error: verification.error
          });
        }
      }
    }

    // Summary
    console.log('\n');
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total documents: ${stats.totalDocuments}`);
    console.log(`  - Cloudinary URLs: ${stats.cloudinaryDocuments}`);
    console.log(`  - Local files: ${stats.localDocuments}`);
    console.log('');
    console.log('Cloudinary files:');
    console.log(`  ✅ Valid: ${stats.validCloudinaryFiles}`);
    console.log(`  ❌ Missing: ${stats.missingCloudinaryFiles}`);
    console.log(`  ⚠️  Invalid URLs: ${stats.invalidUrls}`);
    console.log('');

    // Orphaned documents report
    if (stats.orphanedDocuments.length > 0) {
      console.log('⚠️  ORPHANED DOCUMENTS (exist in MongoDB but missing on Cloudinary)');
      console.log('='.repeat(80));
      console.log('');

      stats.orphanedDocuments.forEach((orphan, index) => {
        console.log(`${index + 1}. ${orphan.attestationId} - ${orphan.fullName}`);
        console.log(`   Document: ${orphan.docType}`);
        console.log(`   Issue: ${orphan.issue}`);
        if (orphan.publicId) {
          console.log(`   Public ID: ${orphan.publicId}`);
        }
        console.log(`   Error: ${orphan.error}`);
        console.log(`   URL: ${orphan.url.substring(0, 100)}...`);
        console.log('');
      });

      console.log('💡 RECOMMENDED ACTIONS:');
      console.log('='.repeat(80));
      console.log('1. Re-upload missing files from Admin Panel');
      console.log('2. Or update MongoDB records to remove broken URLs');
      console.log('3. Or restore files from backup if available');
      console.log('');
      console.log('To fix automatically, run:');
      console.log('  node scripts/repairOrphanedDocuments.js');
      console.log('');
    } else {
      console.log('✅ No orphaned documents found!');
      console.log('   All Cloudinary URLs in MongoDB point to existing files.');
      console.log('');
    }

    // Health check
    const healthScore = stats.cloudinaryDocuments > 0
      ? (stats.validCloudinaryFiles / stats.cloudinaryDocuments * 100).toFixed(1)
      : 100;

    console.log('🏥 SYSTEM HEALTH');
    console.log('='.repeat(80));
    console.log(`Cloudinary files health: ${healthScore}%`);
    
    if (healthScore === 100) {
      console.log('Status: 🟢 Excellent - All files are accessible');
    } else if (healthScore >= 90) {
      console.log('Status: 🟡 Good - Minor issues detected');
    } else if (healthScore >= 70) {
      console.log('Status: 🟠 Warning - Several files missing');
    } else {
      console.log('Status: 🔴 Critical - Many files missing or broken');
    }
    console.log('');

    // Export report to JSON
    const report = {
      timestamp: new Date().toISOString(),
      stats,
      orphanedDocuments: stats.orphanedDocuments,
      healthScore: parseFloat(healthScore)
    };

    const fs = await import('fs');
    const reportPath = './cloudinary-verification-report.json';
    fs.default.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Full report saved to: ${reportPath}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Check Cloudinary config
const checkCloudinaryConfig = () => {
  console.log('🔍 Checking Cloudinary configuration...\n');
  
  const requiredVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nAdd these variables to your .env file');
    process.exit(1);
  }

  console.log('✅ Cloudinary configuration OK');
  console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY.substring(0, 8)}...`);
  console.log('');
};

// Run script
console.log('');
console.log('╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║   CLOUDINARY FILES VERIFICATION & ORPHAN DETECTION                         ║');
console.log('╚════════════════════════════════════════════════════════════════════════════╝');
console.log('');

checkCloudinaryConfig();
verifyCloudinaryFiles();
