# Migration Guide: Cloudinary → Supabase Storage

## ✅ Changes Applied

### 1. **Dependencies Updated**
- ❌ Removed: `cloudinary`, `multer-storage-cloudinary`
- ✅ Added: `@supabase/supabase-js`

### 2. **New Files Created**
- `backend/config/supabase.js` - Supabase client initialization
- `backend/utils/supabaseStorage.js` - Storage helper functions

### 3. **Files Modified**
- `backend/routes/attestations.js` - Updated upload logic
- `backend/package.json` - Updated dependencies
- `backend/.env.example` - Added Supabase config

### 4. **Functions Replaced**
- `uploadToCloudinary()` → `uploadToSupabase()`
- All Cloudinary references replaced with Supabase Storage

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install `@supabase/supabase-js` and remove Cloudinary packages.

### Step 2: Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Wait for the project to be ready (~2 minutes)

### Step 3: Create Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Click **New bucket**
3. Name: `attestations`
4. **Public bucket**: ✅ Yes (for public file access)
5. Click **Create bucket**

### Step 4: Set Bucket Policies

In the bucket settings, add this policy for public read access:

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'attestations' );

CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'attestations' );
```

Or use the UI:
- Go to Storage → Policies
- Click **New Policy**
- Select **For full customization**
- Policy name: `Public Read Access`
- Allowed operation: `SELECT`
- Target roles: `public`

### Step 5: Get API Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key

### Step 6: Update Environment Variables

Create/update `backend/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-public-key-here
```

**Important**: Use the `anon` key, not the `service_role` key for security.

### Step 7: Update Render Environment Variables

If deploying on Render:

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment**
4. Add:
   - `SUPABASE_URL` = your Supabase URL
   - `SUPABASE_KEY` = your anon key
5. **Remove** old Cloudinary variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### Step 8: Test Locally

```bash
cd backend
npm run dev
```

Try uploading a file through the admin panel.

---

## 📝 API Changes

### Upload Function Signature

**Before (Cloudinary):**
```javascript
const uploadToCloudinary = async (filePath, attestationId, docType) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'matc/attestations',
    public_id: `${attestationId}-${docType}`,
    resource_type: 'raw'
  });
  return result.secure_url;
};
```

**After (Supabase):**
```javascript
import { uploadToSupabase } from '../utils/supabaseStorage.js';

// Usage remains the same
const url = await uploadToSupabase(filePath, attestationId, docType);
```

### File URLs

**Before:** `https://res.cloudinary.com/xxx/raw/upload/v123/matc/attestations/CERT-2025-M-M-001-attestation.pdf`

**After:** `https://xxxxx.supabase.co/storage/v1/object/public/attestations/CERT-2025-M-M-001/CERT-2025-M-M-001-attestation.pdf`

---

## 🔧 Helper Functions Available

### `uploadToSupabase(filePath, attestationId, docType)`
Uploads a file to Supabase Storage and returns public URL.

### `deleteFromSupabase(fileUrl)`
Deletes a file from Supabase Storage.

### `checkFileExists(fileUrl)`
Checks if a file exists in storage.

### `getSignedUrl(filePath, expiresIn)`
Generates a temporary signed URL (for private files).

---

## 🧪 Testing

### Test Upload

```bash
curl -X POST http://localhost:5000/api/attestations \
  -H "Content-Type: multipart/form-data" \
  -F "fullName=Test User" \
  -F "programId=507f1f77bcf86cd799439011" \
  -F "note=18" \
  -F "niveau=Avancé" \
  -F "skills=[\"React\",\"Node.js\"]" \
  -F "techniques=[\"API REST\"]" \
  -F "attestation=@/path/to/file.pdf"
```

### Test with URL (Alternative)

```bash
curl -X POST http://localhost:5000/api/attestations \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "programId": "507f1f77bcf86cd799439011",
    "note": 18,
    "niveau": "Avancé",
    "skills": ["React", "Node.js"],
    "techniques": ["API REST"],
    "attestationUrl": "https://example.com/file.pdf"
  }'
```

---

## 🔐 Security Notes

1. **Use anon key** in backend (not service_role)
2. **Enable RLS** (Row Level Security) on storage bucket
3. **Set file size limits** in Supabase dashboard
4. **Enable CORS** for your domains in Supabase settings

---

## 📊 Storage Limits

### Free Tier (Supabase)
- **Storage**: 1 GB
- **Bandwidth**: 2 GB/month
- **File uploads**: Unlimited

### Paid Tier (Pro - $25/month)
- **Storage**: 100 GB
- **Bandwidth**: 200 GB/month
- **File uploads**: Unlimited

---

## 🐛 Troubleshooting

### Error: "Supabase configuration is missing"
- Check `.env` file has `SUPABASE_URL` and `SUPABASE_KEY`
- Restart the server after adding env vars

### Error: "Bucket not found"
- Create the `attestations` bucket in Supabase Dashboard
- Make sure it's set to **public**

### Error: "new row violates row-level security policy"
- Add storage policies (see Step 4)
- Or disable RLS temporarily for testing

### Files upload but can't access
- Check bucket is set to **public**
- Verify the public URL format is correct

---

## 🔄 Rollback Plan

If you need to rollback to Cloudinary:

1. Restore `backend/package.json` from git
2. Run `npm install`
3. Restore `backend/routes/attestations.js`
4. Add back Cloudinary env vars
5. Restart server

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] `attestations` bucket created and set to public
- [ ] Storage policies configured
- [ ] Environment variables added
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts without errors
- [ ] File upload works
- [ ] File download/access works
- [ ] Render environment variables updated

---

## 📞 Support

If you encounter issues:
1. Check Supabase Dashboard → Logs
2. Check backend console logs
3. Verify bucket permissions
4. Test with a small PDF file first

---

**Migration completed on:** October 30, 2025
**Status:** ✅ Ready for testing
