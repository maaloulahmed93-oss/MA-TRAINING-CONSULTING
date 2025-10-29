# 🔍 Cloudinary Debug Guide
## Complete Troubleshooting & Repair Documentation

**Version:** 3.0  
**Last Updated:** 29 October 2025  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Understanding Signed URLs](#signed-urls)
2. [Common Errors](#common-errors)
3. [Verification Script](#verification-script)
4. [Repair Missing Files](#repair-files)
5. [Architecture](#architecture)
6. [Best Practices](#best-practices)

---

## <a name="signed-urls"></a>🔐 Understanding Signed URLs

### What are Signed URLs?

Signed URLs are temporary, secure links to Cloudinary resources that include:
- **Signature**: Cryptographic hash to verify authenticity
- **Expiration**: Time limit (default: 1 hour)
- **Access control**: Works with both public and authenticated files

### How They Work

```
Regular URL (may fail with 401):
https://res.cloudinary.com/djvtktjgc/raw/upload/v1761769031/matc_attestations/file.pdf

Signed URL (always works):
https://res.cloudinary.com/djvtktjgc/raw/upload/v1761769031/matc_attestations/file.pdf?s=abc123...&expires_at=1698620400
```

### Generation Process

```javascript
// 1. Extract public_id from URL
const publicId = 'matc_attestations/file_1234567890';

// 2. Verify file exists on Cloudinary
const exists = await cloudinary.api.resource(publicId, {
  resource_type: 'raw',
  type: 'upload'
});

// 3. Generate signed URL
const signedUrl = cloudinary.url(publicId, {
  resource_type: 'raw',
  type: 'upload',
  sign_url: true,
  secure: true,
  expires_at: Math.floor(Date.now() / 1000) + 3600
});
```

### Key Components

| Component | Description | Example |
|-----------|-------------|---------|
| **Cloud Name** | Your Cloudinary account | `djvtktjgc` |
| **Resource Type** | Type of file | `raw` (PDFs), `image`, `video` |
| **Type** | Upload type | `upload` (public), `authenticated` (private) |
| **Public ID** | Unique identifier | `matc_attestations/file_1234567890` |
| **Version** | Upload timestamp | `v1761769031` |
| **Signature** | Security hash | `s=abc123...` |
| **Expiration** | Unix timestamp | `expires_at=1698620400` |

---

## <a name="common-errors"></a>❌ Common Errors

### 1. HTTP 404 - File Not Found

**Symptoms:**
```
Error: File not found on Cloudinary
Status: 404
```

**Causes:**
- File was deleted from Cloudinary
- Incorrect public_id extraction
- File uploaded with different resource_type
- Typo in URL stored in MongoDB

**Solutions:**

#### A. Verify file exists
```bash
npm run verify-cloudinary
```

#### B. Check Cloudinary Dashboard
1. Go to: https://cloudinary.com/console/c-djvtktjgc/media_library
2. Search for the file name
3. Check if it exists

#### C. Re-upload the file
1. Open Admin Panel: https://admine-lake-ten.vercel.app/attestations
2. Edit the attestation
3. Upload the PDF again

---

### 2. HTTP 401 - Unauthorized

**Symptoms:**
```
Error: Unauthorized
Status: 401
Cette page ne fonctionne pas
```

**Causes:**
- File uploaded with `access_mode: 'authenticated'`
- Trying to access without signature
- Expired signed URL

**Solutions:**

#### A. Automatic (Current System)
The system now automatically:
1. Detects authenticated files
2. Generates signed URLs
3. Redirects to signed URL

#### B. Manual Fix (if needed)
```bash
# Run fix script
npm run fix-cloudinary
```

This changes all files from `authenticated` to `public`.

---

### 3. Invalid URL Format

**Symptoms:**
```
Error: Invalid Cloudinary URL format
Status: 400
```

**Causes:**
- Malformed URL in MongoDB
- Missing `/upload/` in URL
- Incorrect domain

**Solutions:**

#### A. Check MongoDB record
```javascript
// Connect to MongoDB
use matc_database

// Find attestation
db.attestations.findOne({ attestationId: "CERT-2025-M-M-001" })

// Check documents.attestation URL
```

#### B. Update URL manually
```javascript
db.attestations.updateOne(
  { attestationId: "CERT-2025-M-M-001" },
  { $set: { "documents.attestation": "https://res.cloudinary.com/djvtktjgc/raw/upload/..." } }
)
```

---

### 4. Extraction Failed

**Symptoms:**
```
Error: Could not extract public_id
```

**Causes:**
- URL doesn't contain `/upload/`
- Unexpected URL format
- Query parameters interfering

**Solutions:**

#### A. Check URL structure
Valid formats:
```
✅ https://res.cloudinary.com/{cloud}/raw/upload/v{version}/{folder}/{file}.pdf
✅ https://res.cloudinary.com/{cloud}/raw/upload/{folder}/{file}.pdf
❌ https://res.cloudinary.com/{cloud}/{file}.pdf (missing /upload/)
```

#### B. Test extraction
```javascript
import cloudinaryHelper from './backend/utils/cloudinaryHelper.js';

const url = "your_cloudinary_url_here";
const result = cloudinaryHelper.extractPublicId(url);
console.log(result);
```

---

## <a name="verification-script"></a>🧪 Verification Script

### Purpose

The verification script:
1. Connects to MongoDB
2. Fetches all attestations
3. Checks each Cloudinary URL
4. Verifies file exists on Cloudinary
5. Generates a detailed report

### How to Run

```bash
cd backend
npm run verify-cloudinary
```

### Output

```
🔍 CLOUDINARY FILES VERIFICATION
================================================================================

📋 Found 15 active attestation(s)

📄 CERT-2025-M-M-001 - Mohamed Ali
--------------------------------------------------------------------------------
  ☁️  attestation: Cloudinary URL
     URL: https://res.cloudinary.com/djvtktjgc/raw/upload/v1761769031/...
     Public ID: matc_attestations/CERT-2025-M-M-001-attestation
     Resource Type: raw
     Verifying...
  ✅ File exists on Cloudinary
     Size: 245.67 KB
     Access: public
     Created: 10/29/2025, 8:30:00 PM

📊 VERIFICATION SUMMARY
================================================================================
Total documents: 45
  - Cloudinary URLs: 42
  - Local files: 3

Cloudinary files:
  ✅ Valid: 40
  ❌ Missing: 2
  ⚠️  Invalid URLs: 0

⚠️  ORPHANED DOCUMENTS (exist in MongoDB but missing on Cloudinary)
================================================================================

1. CERT-2025-M-M-003 - Ahmed Hassan
   Document: recommandation
   Issue: File missing on Cloudinary
   Public ID: matc_attestations/CERT-2025-M-M-003-recommandation
   Error: File not found on Cloudinary (checked both upload and authenticated types)
   URL: https://res.cloudinary.com/djvtktjgc/raw/upload/v1761769031/...

💡 RECOMMENDED ACTIONS:
================================================================================
1. Re-upload missing files from Admin Panel
2. Or update MongoDB records to remove broken URLs
3. Or restore files from backup if available

To fix automatically, run:
  node scripts/repairOrphanedDocuments.js

🏥 SYSTEM HEALTH
================================================================================
Cloudinary files health: 95.2%
Status: 🟡 Good - Minor issues detected

📄 Full report saved to: ./cloudinary-verification-report.json
```

### Report File

The script generates `cloudinary-verification-report.json`:

```json
{
  "timestamp": "2025-10-29T20:45:00.000Z",
  "stats": {
    "totalDocuments": 45,
    "cloudinaryDocuments": 42,
    "localDocuments": 3,
    "validCloudinaryFiles": 40,
    "missingCloudinaryFiles": 2,
    "invalidUrls": 0,
    "orphanedDocuments": [...]
  },
  "orphanedDocuments": [
    {
      "attestationId": "CERT-2025-M-M-003",
      "fullName": "Ahmed Hassan",
      "docType": "recommandation",
      "url": "https://...",
      "publicId": "matc_attestations/CERT-2025-M-M-003-recommandation",
      "resourceType": "raw",
      "issue": "File missing on Cloudinary",
      "error": "File not found..."
    }
  ],
  "healthScore": 95.2
}
```

---

## <a name="repair-files"></a>🔧 Repair Missing Files

### Option 1: Re-upload via Admin Panel (Recommended)

**Steps:**
1. Open Admin Panel: https://admine-lake-ten.vercel.app/attestations
2. Find the attestation with missing file
3. Click "Modifier" (Edit)
4. Upload the PDF again
5. Click "Mettre à jour" (Update)

**Advantages:**
- ✅ Simple and safe
- ✅ Creates new Cloudinary URL
- ✅ Updates MongoDB automatically
- ✅ No risk of data loss

---

### Option 2: Restore from Backup

If you have backup files:

```bash
# 1. Locate backup file
cd backups/attestations

# 2. Upload to Cloudinary manually
# Go to: https://cloudinary.com/console/c-djvtktjgc/media_library
# Click "Upload" → Select file → Upload to folder "matc_attestations"

# 3. Copy the new URL

# 4. Update MongoDB
mongo
use matc_database
db.attestations.updateOne(
  { attestationId: "CERT-2025-M-M-003" },
  { $set: { "documents.recommandation": "NEW_CLOUDINARY_URL" } }
)
```

---

### Option 3: Remove Broken References

If file is permanently lost:

```bash
# Connect to MongoDB
mongo
use matc_database

# Remove broken URL
db.attestations.updateOne(
  { attestationId: "CERT-2025-M-M-003" },
  { $unset: { "documents.recommandation": "" } }
)
```

**⚠️ Warning:** This removes the reference but doesn't delete the attestation.

---

## <a name="architecture"></a>🏗️ Architecture

### System Flow

```
User Request
    ↓
Admin Panel / Frontend
    ↓
Backend API (/api/attestations/:id/download/:type)
    ↓
Route Handler (attestations.js)
    ↓
Cloudinary Helper (cloudinaryHelper.js)
    ↓
1. Extract public_id from URL
2. Verify file exists (Cloudinary Admin API)
3. Generate signed URL
    ↓
Redirect to Signed URL
    ↓
Cloudinary CDN
    ↓
File Download
```

### Key Files

| File | Purpose |
|------|---------|
| `backend/utils/cloudinaryHelper.js` | Core utilities for Cloudinary operations |
| `backend/routes/attestations.js` | Download route with validation |
| `backend/middlewares/uploadCloudinary.js` | Upload configuration |
| `backend/config/cloudinary.js` | Cloudinary SDK setup |
| `backend/scripts/verifyCloudinaryFiles.js` | Verification script |
| `backend/scripts/fixCloudinaryAccess.js` | Repair script |

### Helper Functions

#### `extractPublicId(url)`
Extracts public_id from Cloudinary URL.

**Input:**
```
https://res.cloudinary.com/djvtktjgc/raw/upload/v1761769031/matc_attestations/file.pdf
```

**Output:**
```javascript
{
  success: true,
  publicId: 'matc_attestations/file',
  resourceType: 'raw',
  originalUrl: '...'
}
```

---

#### `verifyCloudinaryFile(publicId, resourceType)`
Checks if file exists on Cloudinary.

**Input:**
```javascript
await verifyCloudinaryFile('matc_attestations/file', 'raw')
```

**Output:**
```javascript
{
  exists: true,
  details: {
    publicId: 'matc_attestations/file',
    format: 'pdf',
    bytes: 251234,
    url: 'https://...',
    createdAt: '2025-10-29T20:30:00.000Z',
    accessMode: 'public'
  }
}
```

---

#### `generateSignedUrl(publicId, resourceType, expiresIn)`
Creates signed URL with validation.

**Input:**
```javascript
await generateSignedUrl('matc_attestations/file', 'raw', 3600)
```

**Output:**
```javascript
{
  success: true,
  url: 'https://res.cloudinary.com/...?s=abc123&expires_at=1698620400',
  expiresAt: 1698620400,
  accessMode: 'public',
  fileDetails: { ... }
}
```

---

## <a name="best-practices"></a>✅ Best Practices

### 1. Upload Configuration

Always use these settings in `uploadCloudinary.js`:

```javascript
{
  folder: 'matc_attestations',
  resource_type: 'raw',
  access_mode: 'public',  // ✅ Important!
  type: 'upload',
  format: 'pdf',
  allowed_formats: ['pdf']
}
```

### 2. URL Storage

Store complete Cloudinary URLs in MongoDB:

```javascript
// ✅ Good
"documents": {
  "attestation": "https://res.cloudinary.com/djvtktjgc/raw/upload/v1761769031/matc_attestations/file.pdf"
}

// ❌ Bad
"documents": {
  "attestation": "matc_attestations/file.pdf"  // Missing domain
}
```

### 3. Error Handling

Always handle errors gracefully:

```javascript
try {
  const signedUrl = await generateSignedUrl(publicId, resourceType);
  if (!signedUrl.success) {
    return res.status(404).json({
      success: false,
      message: 'File missing on Cloudinary',
      error: signedUrl.error
    });
  }
  return res.redirect(signedUrl.url);
} catch (error) {
  return res.status(500).json({
    success: false,
    message: 'Error generating download link',
    error: error.message
  });
}
```

### 4. Regular Verification

Run verification script weekly:

```bash
# Add to cron job or scheduled task
0 0 * * 0 cd /path/to/backend && npm run verify-cloudinary
```

### 5. Monitoring

Monitor these metrics:
- **Health Score**: Should be > 95%
- **Missing Files**: Should be 0
- **Invalid URLs**: Should be 0

### 6. Backup Strategy

1. **Cloudinary Backup**: Enable auto-backup in Cloudinary settings
2. **MongoDB Backup**: Regular exports of attestations collection
3. **Local Backup**: Keep original PDFs before upload

---

## 🆘 Quick Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| 404 Error | Run `npm run verify-cloudinary` to find missing files |
| 401 Error | System auto-generates signed URLs (already fixed) |
| Slow downloads | Backend may be sleeping, wait 30s and retry |
| Invalid URL | Check MongoDB record, update if needed |
| File missing | Re-upload via Admin Panel |

---

## 📞 Support

### Useful Links

- **Cloudinary Dashboard**: https://cloudinary.com/console/c-djvtktjgc
- **Admin Panel**: https://admine-lake-ten.vercel.app
- **Backend API**: https://matc-backend.onrender.com/api
- **Render Dashboard**: https://dashboard.render.com/web/matc-backend

### Scripts

```bash
# Verify all files
npm run verify-cloudinary

# Fix authenticated files
npm run fix-cloudinary

# Test API health
curl https://matc-backend.onrender.com/api/health
```

---

## 📝 Changelog

### Version 3.0 (29 Oct 2025)
- ✅ Added `cloudinaryHelper.js` with robust extraction
- ✅ Implemented Admin API validation before redirect
- ✅ Created `verifyCloudinaryFiles.js` script
- ✅ Added graceful 404 handling
- ✅ Complete documentation

### Version 2.0 (29 Oct 2025)
- ✅ Signed URLs implementation
- ✅ Timeout increased to 2 minutes
- ✅ Better error messages

### Version 1.0 (Initial)
- ✅ Basic Cloudinary upload
- ✅ Direct URL redirect

---

**Author:** MATC Team  
**Last Updated:** 29 October 2025  
**Status:** ✅ Production Ready
