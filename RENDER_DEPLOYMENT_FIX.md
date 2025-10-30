# 🔧 Render Deployment Fix - Cloudinary Removal

## ❌ Problem
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'multer-storage-cloudinary' 
imported from /opt/render/project/src/backend/middlewares/uploadCloudinary.js
```

## ✅ Solution Applied

### Files Deleted
1. ❌ `backend/middlewares/uploadCloudinary.js` - Old Cloudinary middleware
2. ❌ `backend/middlewares/upload.js` - Old Cloudinary storage config

### Files Created
1. ✅ `backend/middlewares/uploadSupabase.js` - New Supabase middleware

### Files Modified
1. ✅ `backend/routes/attestationUploadRoutes.js` - Updated import
2. ✅ `backend/controllers/attestationUploadController.js` - Uses Supabase now

---

## 📝 Changes Detail

### 1. New Middleware: `uploadSupabase.js`
```javascript
// Uses multer for temporary local storage
// Files are then uploaded to Supabase Storage
// Temp files auto-deleted after upload
```

### 2. Updated Routes
```javascript
// Before
import upload from '../middlewares/uploadCloudinary.js';

// After
import upload from '../middlewares/uploadSupabase.js';
```

### 3. Updated Controller
```javascript
// Before
const cloudinaryUrl = req.file.path;

// After
const supabaseUrl = await uploadToSupabase(req.file.path, fileId, type);
```

---

## 🚀 Deployment Steps

### 1. Code Already Pushed ✅
```bash
git commit -m "fix: Remove Cloudinary dependencies and use Supabase"
git push origin main
```

### 2. Render Will Auto-Deploy
- Render detects GitHub push
- Runs `npm install` (no Cloudinary packages)
- Starts server with Supabase

### 3. Environment Variables (REQUIRED)
Make sure these are set in Render Dashboard:

```env
SUPABASE_URL=https://rkdchtqalnigwdekbmeu.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ Expected Server Logs

```
✅ Supabase client initialized
📦 Bucket: attestations
🌐 URL: https://rkdchtqalnigwdekbmeu.supabase.co
✅ MongoDB Atlas connecté avec succès
✅ Supabase Storage initialized
✅ Bucket exists: attestations
🚀 Serveur démarré sur le port 5000
```

---

## 🧪 Testing

### Test Upload Endpoint
```bash
curl -X POST https://matc-backend.onrender.com/api/attestations/upload \
  -F "file=@test.pdf" \
  -F "participantId=12345" \
  -F "type=attestation"
```

Expected response:
```json
{
  "success": true,
  "message": "Fichier uploadé avec succès",
  "data": {
    "url": "https://rkdchtqalnigwdekbmeu.supabase.co/storage/v1/object/public/attestations/..."
  }
}
```

---

## 📊 Files Status

| File | Status | Purpose |
|------|--------|---------|
| `uploadCloudinary.js` | ❌ Deleted | Old Cloudinary middleware |
| `upload.js` | ❌ Deleted | Old Cloudinary storage |
| `uploadSupabase.js` | ✅ Created | New Supabase middleware |
| `attestationUploadRoutes.js` | ✅ Updated | Uses new middleware |
| `attestationUploadController.js` | ✅ Updated | Uploads to Supabase |

---

## 🔍 Verification Checklist

- [x] Cloudinary middleware deleted
- [x] Supabase middleware created
- [x] Routes updated
- [x] Controller updated
- [x] No Cloudinary imports remaining
- [x] Code pushed to GitHub
- [ ] Render deployment successful
- [ ] Upload endpoint tested

---

## 🐛 If Deployment Still Fails

### Check 1: Environment Variables
Verify in Render Dashboard → Environment:
- `SUPABASE_URL` is set
- `SUPABASE_KEY` is set
- Old `CLOUDINARY_*` vars are removed

### Check 2: Dependencies
Render logs should show:
```
npm install
added 170 packages
```
NOT:
```
npm ERR! Cannot find package 'multer-storage-cloudinary'
```

### Check 3: Server Start
Should see:
```
✅ Supabase client initialized
```
NOT:
```
Error [ERR_MODULE_NOT_FOUND]
```

---

**Status**: ✅ Fix Applied  
**Pushed**: Yes  
**Render**: Will auto-deploy  
**Next**: Verify deployment logs  

---

**Date**: October 30, 2025 at 2:20 AM  
**Issue**: ERR_MODULE_NOT_FOUND multer-storage-cloudinary  
**Resolution**: Complete Cloudinary removal + Supabase migration
