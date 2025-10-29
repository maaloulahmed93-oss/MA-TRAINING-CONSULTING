import cloudinary from '../config/cloudinary.js';

/**
 * Cloudinary Helper Utilities
 * Handles public_id extraction, validation, and signed URL generation
 */

/**
 * Extract public_id from Cloudinary URL
 * Handles various URL formats:
 * - https://res.cloudinary.com/{cloud}/raw/upload/v{version}/{folder}/{file}.pdf
 * - https://res.cloudinary.com/{cloud}/raw/upload/{folder}/{file}.pdf
 * - https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{file}.jpg
 * 
 * @param {string} cloudinaryUrl - Full Cloudinary URL
 * @returns {object} { publicId, resourceType, success, error }
 */
export function extractPublicId(cloudinaryUrl) {
  try {
    if (!cloudinaryUrl || typeof cloudinaryUrl !== 'string') {
      return { success: false, error: 'Invalid URL provided' };
    }

    // Check if it's a Cloudinary URL
    if (!cloudinaryUrl.includes('cloudinary.com')) {
      return { success: false, error: 'Not a Cloudinary URL' };
    }

    // Extract resource type (raw, image, video)
    let resourceType = 'raw';
    if (cloudinaryUrl.includes('/image/upload/')) {
      resourceType = 'image';
    } else if (cloudinaryUrl.includes('/video/upload/')) {
      resourceType = 'video';
    } else if (cloudinaryUrl.includes('/raw/upload/')) {
      resourceType = 'raw';
    }

    // Split by /upload/ to get the path after upload
    const uploadIndex = cloudinaryUrl.indexOf('/upload/');
    if (uploadIndex === -1) {
      return { success: false, error: 'Invalid Cloudinary URL format (missing /upload/)' };
    }

    const pathAfterUpload = cloudinaryUrl.substring(uploadIndex + 8); // +8 for '/upload/'
    
    // Remove query parameters if present
    const pathWithoutQuery = pathAfterUpload.split('?')[0];
    
    // Split by /
    const pathParts = pathWithoutQuery.split('/');
    
    // Remove version if present (v1234567890)
    let startIndex = 0;
    if (pathParts[0] && pathParts[0].startsWith('v') && /^v\d+$/.test(pathParts[0])) {
      startIndex = 1;
    }
    
    // Get path without version
    const pathWithoutVersion = pathParts.slice(startIndex).join('/');
    
    // Remove file extension
    const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, '');
    
    if (!publicId) {
      return { success: false, error: 'Could not extract public_id' };
    }

    return {
      success: true,
      publicId,
      resourceType,
      originalUrl: cloudinaryUrl
    };
  } catch (error) {
    return {
      success: false,
      error: `Error extracting public_id: ${error.message}`
    };
  }
}

/**
 * Verify if a file exists on Cloudinary using Admin API
 * 
 * @param {string} publicId - Cloudinary public_id
 * @param {string} resourceType - Resource type (raw, image, video)
 * @returns {Promise<object>} { exists, details, error }
 */
export async function verifyCloudinaryFile(publicId, resourceType = 'raw') {
  try {
    const resource = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
      type: 'upload'
    });

    return {
      exists: true,
      details: {
        publicId: resource.public_id,
        format: resource.format,
        bytes: resource.bytes,
        url: resource.secure_url,
        createdAt: resource.created_at,
        accessMode: resource.access_mode || 'public'
      }
    };
  } catch (error) {
    // Check if it's a 404 (not found)
    if (error.error && error.error.http_code === 404) {
      // Try with 'authenticated' type
      try {
        const resource = await cloudinary.api.resource(publicId, {
          resource_type: resourceType,
          type: 'authenticated'
        });

        return {
          exists: true,
          details: {
            publicId: resource.public_id,
            format: resource.format,
            bytes: resource.bytes,
            url: resource.secure_url,
            createdAt: resource.created_at,
            accessMode: 'authenticated'
          }
        };
      } catch (authError) {
        return {
          exists: false,
          error: 'File not found on Cloudinary (checked both upload and authenticated types)'
        };
      }
    }

    return {
      exists: false,
      error: `Cloudinary API error: ${error.message}`
    };
  }
}

/**
 * Generate a signed URL for Cloudinary file
 * Automatically detects if file is public or authenticated
 * 
 * @param {string} publicId - Cloudinary public_id
 * @param {string} resourceType - Resource type (raw, image, video)
 * @param {number} expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<object>} { success, url, error }
 */
export async function generateSignedUrl(publicId, resourceType = 'raw', expiresIn = 3600) {
  try {
    // First verify the file exists
    const verification = await verifyCloudinaryFile(publicId, resourceType);
    
    if (!verification.exists) {
      return {
        success: false,
        error: verification.error || 'File not found on Cloudinary'
      };
    }

    const accessMode = verification.details.accessMode;
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

    // Generate signed URL
    const signedUrl = cloudinary.url(publicId, {
      resource_type: resourceType,
      type: accessMode === 'authenticated' ? 'authenticated' : 'upload',
      sign_url: true,
      secure: true,
      expires_at: expiresAt
    });

    return {
      success: true,
      url: signedUrl,
      expiresAt,
      accessMode,
      fileDetails: verification.details
    };
  } catch (error) {
    return {
      success: false,
      error: `Error generating signed URL: ${error.message}`
    };
  }
}

/**
 * Generate a public download URL (for public files)
 * 
 * @param {string} publicId - Cloudinary public_id
 * @param {string} resourceType - Resource type (raw, image, video)
 * @returns {string} Public URL
 */
export function generatePublicUrl(publicId, resourceType = 'raw') {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    type: 'upload',
    secure: true
  });
}

/**
 * Get file info from Cloudinary
 * 
 * @param {string} cloudinaryUrl - Full Cloudinary URL
 * @returns {Promise<object>} File information
 */
export async function getFileInfo(cloudinaryUrl) {
  const extraction = extractPublicId(cloudinaryUrl);
  
  if (!extraction.success) {
    return {
      success: false,
      error: extraction.error
    };
  }

  const verification = await verifyCloudinaryFile(
    extraction.publicId,
    extraction.resourceType
  );

  if (!verification.exists) {
    return {
      success: false,
      error: verification.error,
      publicId: extraction.publicId,
      resourceType: extraction.resourceType
    };
  }

  return {
    success: true,
    publicId: extraction.publicId,
    resourceType: extraction.resourceType,
    ...verification.details
  };
}

export default {
  extractPublicId,
  verifyCloudinaryFile,
  generateSignedUrl,
  generatePublicUrl,
  getFileInfo
};
