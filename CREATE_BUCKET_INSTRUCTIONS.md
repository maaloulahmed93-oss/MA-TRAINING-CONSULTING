# 🪣 Create Supabase Storage Bucket

## Problem
```
Error: Bucket 'attestations' not found
```

## Solution: Create the Bucket Manually

### Step 1: Go to Supabase Dashboard
🔗 https://supabase.com/dashboard/project/rkdchtqalnigwdekbmeu/storage/buckets

### Step 2: Create New Bucket

1. Click **"New bucket"** button
2. Fill in the details:

```
Bucket name: attestations
Public bucket: ✅ YES (checked)
File size limit: 10485760 (10MB)
Allowed MIME types: application/pdf
```

3. Click **"Create bucket"**

### Step 3: Set Bucket Policies

After creating the bucket, set these policies:

#### Policy 1: Public Read Access
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'attestations' );
```

#### Policy 2: Authenticated Upload
```sql
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'attestations' );
```

#### Policy 3: Authenticated Update
```sql
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'attestations' );
```

### OR Use the UI:

1. Go to **Storage** → **Policies**
2. Click **"New Policy"**
3. Select **"For full customization"**
4. Set:
   - Policy name: `Public Read Access`
   - Allowed operation: `SELECT`
   - Target roles: `public`
   - Policy definition: `bucket_id = 'attestations'`

5. Repeat for INSERT and UPDATE operations

### Step 4: Verify

After creating the bucket:

1. Go back to Storage → Buckets
2. You should see **attestations** bucket
3. Click on it to verify it's public
4. Try uploading a test file

---

## Quick Verification

Test if bucket exists:
```bash
curl https://rkdchtqalnigwdekbmeu.supabase.co/storage/v1/bucket/attestations
```

Should return bucket info, not 404.

---

## After Creating Bucket

1. ✅ Bucket created
2. ✅ Set to public
3. ✅ Policies configured
4. 🔄 Redeploy backend on Render (or wait for auto-deploy)
5. 🧪 Test upload from admin panel

---

**Status**: ⏳ Waiting for bucket creation
**Next**: Create bucket in Supabase Dashboard
**ETA**: 2 minutes
