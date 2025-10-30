import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Attestation from '../models/Attestation.js';

dotenv.config();

/**
 * Quick fix: Replace matc/attestations with matc_attestations in all URLs
 */

const quickFix = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const attestations = await Attestation.find({ isActive: true });
    console.log(`📋 Found ${attestations.length} attestation(s)\n`);

    let fixedCount = 0;

    for (const attestation of attestations) {
      console.log(`📄 ${attestation.attestationId} - ${attestation.fullName}`);
      
      let needsUpdate = false;
      const updates = {};

      // Check each document type
      for (const docType of ['attestation', 'recommandation', 'evaluation']) {
        const url = attestation.documents[docType];
        
        if (url && url.includes('matc/attestations')) {
          console.log(`  🔧 Fixing ${docType}...`);
          console.log(`     Old: ${url.substring(0, 80)}...`);
          
          const newUrl = url.replace(/matc\/attestations/g, 'matc_attestations');
          updates[`documents.${docType}`] = newUrl;
          
          console.log(`     New: ${newUrl.substring(0, 80)}...`);
          needsUpdate = true;
          fixedCount++;
        } else if (url) {
          console.log(`  ✅ ${docType}: Already correct`);
        }
      }

      if (needsUpdate) {
        await Attestation.updateOne(
          { _id: attestation._id },
          { $set: updates }
        );
        console.log(`  💾 Updated in MongoDB`);
      }
      
      console.log('');
    }

    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Fixed ${fixedCount} URL(s)`);
    console.log('');

    if (fixedCount > 0) {
      console.log('🎉 URLs have been fixed!');
      console.log('   Test download now: https://matc-backend.onrender.com/api/attestations/CERT-2025-M-M-004/download/attestation');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
};

quickFix();
