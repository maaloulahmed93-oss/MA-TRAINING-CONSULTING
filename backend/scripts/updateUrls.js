import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Attestation from '../models/Attestation.js';
import cloudinary from '../config/cloudinary.js';

dotenv.config();

/**
 * Update URLs for CERT-2025-M-M-004 with correct Cloudinary paths
 */

const updateUrls = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const attestationId = 'CERT-2025-M-M-004';
    
    console.log(`🔍 Searching for attestation: ${attestationId}`);
    const attestation = await Attestation.findOne({ attestationId });
    
    if (!attestation) {
      console.log('❌ Attestation not found!');
      return;
    }
    
    console.log('✅ Found attestation\n');
    console.log('📋 Current URLs:');
    console.log('  Attestation:', attestation.documents.attestation);
    console.log('  Recommandation:', attestation.documents.recommandation);
    console.log('  Evaluation:', attestation.documents.evaluation);
    console.log('');
    
    // Search for files in Cloudinary
    console.log('🔍 Searching for files on Cloudinary...\n');
    
    const newUrls = {};
    
    // Search in matc_attestations folder
    try {
      const resources = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'raw',
        prefix: 'matc_attestations/',
        max_results: 100
      });
      
      console.log(`✅ Found ${resources.resources.length} file(s) in matc_attestations/\n`);
      
      for (const resource of resources.resources) {
        const publicId = resource.public_id;
        
        if (publicId.includes('CERT-2025-M-M-004')) {
          console.log(`📄 Found: ${publicId}`);
          console.log(`   URL: ${resource.secure_url}`);
          
          if (publicId.includes('attestation') && !publicId.includes('recommandation') && !publicId.includes('evaluation')) {
            newUrls.attestation = resource.secure_url;
            console.log('   → Will use for: attestation');
          } else if (publicId.includes('recommandation')) {
            newUrls.recommandation = resource.secure_url;
            console.log('   → Will use for: recommandation');
          } else if (publicId.includes('evaluation')) {
            newUrls.evaluation = resource.secure_url;
            console.log('   → Will use for: evaluation');
          }
          console.log('');
        }
      }
      
      if (Object.keys(newUrls).length === 0) {
        console.log('❌ No files found for CERT-2025-M-M-004 in matc_attestations/');
        console.log('');
        console.log('💡 Please re-upload the files from Admin Panel');
        return;
      }
      
      console.log('📊 New URLs to update:');
      console.log('  Attestation:', newUrls.attestation || '(not found)');
      console.log('  Recommandation:', newUrls.recommandation || '(not found)');
      console.log('  Evaluation:', newUrls.evaluation || '(not found)');
      console.log('');
      
      // Update MongoDB
      const updates = {};
      if (newUrls.attestation) updates['documents.attestation'] = newUrls.attestation;
      if (newUrls.recommandation) updates['documents.recommandation'] = newUrls.recommandation;
      if (newUrls.evaluation) updates['documents.evaluation'] = newUrls.evaluation;
      
      if (Object.keys(updates).length > 0) {
        await Attestation.updateOne(
          { attestationId },
          { $set: updates }
        );
        
        console.log('✅ MongoDB updated successfully!');
        console.log('');
        console.log('🎉 Test download now:');
        console.log('   https://matc-backend.onrender.com/api/attestations/CERT-2025-M-M-004/download/attestation');
      }
      
    } catch (error) {
      console.error('❌ Error searching Cloudinary:', error.message);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
};

updateUrls();
