import supabase from './supabaseClient.js';
import path from 'path';
import fs from 'fs';

const BUCKET_NAME = 'attestations';

/**
 * Ensure the attestations bucket exists
 */
export const ensureBucketExists = async () => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error listing buckets:', error);
      return false;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log(`📦 Creating bucket: ${BUCKET_NAME}`);
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createError) {
        console.error('❌ Error creating bucket:', createError);
        return false;
      }
      
      console.log(`✅ Bucket created: ${BUCKET_NAME}`);
    } else {
      console.log(`✅ Bucket exists: ${BUCKET_NAME}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error in ensureBucketExists:', error);
    return false;
  }
};

/**
 * Upload a file to Supabase Storage
 * @param {string} filePath - Local file path
 * @param {string} attestationId - Attestation ID for naming
 * @param {string} docType - Document type (attestation, recommandation, evaluation)
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export const uploadToSupabase = async (filePath, attestationId, docType) => {
  try {
    console.log(`📤 Uploading ${docType} to Supabase Storage...`);
    console.log(`📁 File path: ${filePath}`);
    console.log(`🆔 Attestation ID: ${attestationId}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    console.log(`📊 File size: ${fileBuffer.length} bytes`);
    
    const fileName = `${attestationId}-${docType}.pdf`;
    const filePath_storage = `${attestationId}/${fileName}`;
    
    console.log(`📦 Storage path: ${filePath_storage}`);
    console.log(`🪣 Bucket: ${BUCKET_NAME}`);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath_storage, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true // Replace if exists
      });
    
    if (error) {
      console.error(`❌ Supabase upload error:`, {
        message: error.message,
        statusCode: error.statusCode,
        error: error
      });
      
      // Provide more helpful error message
      if (error.message?.includes('not found')) {
        throw new Error(`Bucket '${BUCKET_NAME}' not found. Please create it in Supabase Dashboard.`);
      } else if (error.message?.includes('permission')) {
        throw new Error(`Permission denied. Check bucket policies in Supabase Dashboard.`);
      } else {
        throw new Error(`Supabase upload failed: ${error.message || 'Unknown error'}`);
      }
    }
    
    console.log(`✅ Upload successful, getting public URL...`);
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath_storage);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('Failed to get public URL from Supabase');
    }
    
    console.log(`✅ ${docType} uploaded successfully:`, publicUrlData.publicUrl);
    
    // Delete local file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Local file deleted: ${filePath}`);
    }
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error(`❌ Error in uploadToSupabase for ${docType}:`, {
      message: error.message,
      stack: error.stack
    });
    
    // Clean up local file on error
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Local file deleted after error: ${filePath}`);
      } catch (cleanupError) {
        console.error(`⚠️  Failed to delete local file:`, cleanupError);
      }
    }
    
    throw error;
  }
};

/**
 * Delete a file from Supabase Storage
 * @param {string} fileUrl - Public URL of the file
 * @returns {Promise<boolean>}
 */
export const deleteFromSupabase = async (fileUrl) => {
  try {
    // Extract file path from URL
    const urlParts = fileUrl.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) {
      throw new Error('Invalid Supabase URL format');
    }
    
    const filePath = urlParts[1];
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      console.error('❌ Error deleting file:', error);
      return false;
    }
    
    console.log('✅ File deleted from Supabase Storage');
    return true;
  } catch (error) {
    console.error('❌ Error in deleteFromSupabase:', error);
    return false;
  }
};

/**
 * Check if file exists in Supabase Storage
 * @param {string} fileUrl - Public URL of the file
 * @returns {Promise<boolean>}
 */
export const checkFileExists = async (fileUrl) => {
  try {
    const urlParts = fileUrl.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) {
      return false;
    }
    
    const filePath = urlParts[1];
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(path.dirname(filePath));
    
    if (error) {
      return false;
    }
    
    const fileName = path.basename(filePath);
    return data.some(file => file.name === fileName);
  } catch (error) {
    console.error('❌ Error checking file existence:', error);
    return false;
  }
};

/**
 * Get signed URL for temporary access (optional, for private files)
 * @param {string} filePath - File path in storage
 * @param {number} expiresIn - Expiration time in seconds (default: 3600)
 * @returns {Promise<string>}
 */
export const getSignedUrl = async (filePath, expiresIn = 3600) => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);
    
    if (error) {
      throw error;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('❌ Error creating signed URL:', error);
    throw error;
  }
};

export default {
  uploadToSupabase,
  deleteFromSupabase,
  checkFileExists,
  getSignedUrl,
  ensureBucketExists
};
