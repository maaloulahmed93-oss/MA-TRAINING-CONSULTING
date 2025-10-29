import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Attestation from '../models/Attestation.js';

dotenv.config();

/**
 * Script to fix Cloudinary path mismatch
 * Changes 'matc/attestations' to 'matc_attestations' in URLs
 */

const fixCloudinaryPaths = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔧 FIXING CLOUDINARY PATHS');
    console.log('='.repeat(80));
    console.log('');

    const attestations = await Attestation.find({ isActive: true });
    console.log(`📋 Found ${attestations.length} active attestation(s)\n`);

    let fixedCount = 0;
    let alreadyCorrect = 0;
    let noCloudinaryUrl = 0;

    for (const attestation of attestations) {
      console.log(`\n📄 ${attestation.attestationId} - ${attestation.fullName}`);
      console.log('-'.repeat(80));

      let needsUpdate = false;
      const updates = {};

      for (const docType of ['attestation', 'recommandation', 'evaluation']) {
        const docUrl = attestation.documents[docType];

        if (!docUrl) {
          console.log(`  ⏭️  ${docType}: No file`);
          continue;
        }

        // Check if it's a Cloudinary URL
        if (!docUrl.includes('cloudinary.com')) {
          console.log(`  📁 ${docType}: Not a Cloudinary URL`);
          noCloudinaryUrl++;
          continue;
        }

        // Check if it has the wrong path
        if (docUrl.includes('/matc/attestations/')) {
          console.log(`  🔧 ${docType}: Found incorrect path 'matc/attestations'`);
          console.log(`     Old: ${docUrl.substring(0, 100)}...`);
          
          // Fix the path
          const fixedUrl = docUrl.replace('/matc/attestations/', '/matc_attestations/');
          updates[`documents.${docType}`] = fixedUrl;
          
          console.log(`     New: ${fixedUrl.substring(0, 100)}...`);
          console.log(`  ✅ ${docType}: Will be fixed`);
          
          needsUpdate = true;
          fixedCount++;
        } else if (docUrl.includes('/matc_attestations/')) {
          console.log(`  ✅ ${docType}: Already correct (matc_attestations)`);
          alreadyCorrect++;
        } else {
          console.log(`  ⚠️  ${docType}: Unknown path format`);
          console.log(`     URL: ${docUrl.substring(0, 100)}...`);
        }
      }

      // Update if needed
      if (needsUpdate) {
        await Attestation.updateOne(
          { _id: attestation._id },
          { $set: updates }
        );
        console.log(`  💾 Updated in MongoDB`);
      }
    }

    // Summary
    console.log('\n');
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Fixed: ${fixedCount} document(s)`);
    console.log(`✓  Already correct: ${alreadyCorrect} document(s)`);
    console.log(`📁 Non-Cloudinary: ${noCloudinaryUrl} document(s)`);
    console.log('');

    if (fixedCount > 0) {
      console.log('🎉 Path fix completed successfully!');
      console.log('   URLs have been updated from "matc/attestations" to "matc_attestations"');
      console.log('');
      console.log('💡 NEXT STEPS:');
      console.log('   1. Test download again');
      console.log('   2. Run: npm run verify-cloudinary');
      console.log('   3. Check if files are now accessible');
    } else if (alreadyCorrect > 0) {
      console.log('✅ All paths are already correct!');
      console.log('   The issue might be something else.');
      console.log('');
      console.log('💡 TROUBLESHOOTING:');
      console.log('   1. Check if files actually exist on Cloudinary');
      console.log('   2. Go to: https://cloudinary.com/console/c-djvtktjgc/media_library');
      console.log('   3. Search for folder: matc_attestations');
      console.log('   4. Verify files are there');
    } else {
      console.log('⚠️  No Cloudinary URLs found.');
      console.log('   All documents use local paths or have no files.');
    }

    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

// Check MongoDB config
const checkMongoConfig = () => {
  console.log('🔍 Checking MongoDB configuration...\n');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.error('\nAdd it to your .env file');
    process.exit(1);
  }

  console.log('✅ MongoDB configuration OK');
  console.log('');
};

// Run script
console.log('');
console.log('╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║   FIX CLOUDINARY PATHS (matc/attestations → matc_attestations)            ║');
console.log('╚════════════════════════════════════════════════════════════════════════════╝');
console.log('');

checkMongoConfig();
fixCloudinaryPaths();
