# 🚀 How to Run Fix Script on Render

## Method 1: Using Render Shell (Recommended)

### Steps:

1. **Open Render Dashboard:**
   ```
   https://dashboard.render.com/web/matc-backend
   ```

2. **Click "Shell" button** (top menu)

3. **Wait for terminal to load**

4. **Run the command:**
   ```bash
   npm run fix-cloudinary-paths
   ```

5. **Wait for results** (should take 10-30 seconds)

---

## Method 2: Using Render API (Alternative)

If Shell doesn't work, you can trigger via API:

### Step 1: Get Render API Key

1. Go to: https://dashboard.render.com/u/settings/api-keys
2. Create new API key
3. Copy the key

### Step 2: Trigger Deploy with Script

```bash
curl -X POST \
  https://api.render.com/v1/services/YOUR_SERVICE_ID/deploys \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

---

## Method 3: SSH into Render (Advanced)

If you have SSH access:

```bash
# SSH into Render
render ssh matc-backend

# Run script
npm run fix-cloudinary-paths
```

---

## Expected Output

```
╔════════════════════════════════════════════════════════════════════════════╗
║   FIX CLOUDINARY PATHS (matc/attestations → matc_attestations)            ║
╚════════════════════════════════════════════════════════════════════════════╝

🔍 Checking MongoDB configuration...

✅ MongoDB configuration OK

🔧 FIXING CLOUDINARY PATHS
================================================================================

📋 Found 5 active attestation(s)

📄 CERT-2025-M-M-001 - Person 1
--------------------------------------------------------------------------------
  ✅ attestation: Already correct (matc_attestations)
  ✅ recommandation: Already correct (matc_attestations)

📄 CERT-2025-M-M-003 - Person 2
--------------------------------------------------------------------------------
  🔧 attestation: Found incorrect path 'matc/attestations'
     Old: https://res.cloudinary.com/djvtktjgc/raw/upload/v1761769031/matc/attestations/CERT-2025-M-M-003-attestation.pdf
     New: https://res.cloudinary.com/djvtktjgc/raw/upload/v1761769031/matc_attestations/CERT-2025-M-M-003-attestation.pdf
  ✅ attestation: Will be fixed
  💾 Updated in MongoDB

📊 SUMMARY
================================================================================
✅ Fixed: 3 document(s)
✓  Already correct: 2 document(s)
📁 Non-Cloudinary: 0 document(s)

🎉 Path fix completed successfully!
   URLs have been updated from "matc/attestations" to "matc_attestations"

💡 NEXT STEPS:
   1. Test download again
   2. Run: npm run verify-cloudinary
   3. Check if files are now accessible

✅ Disconnected from MongoDB
```

---

## Troubleshooting

### Issue: "MONGODB_URI not found"

**Solution:** You're running locally without .env file. Use Render Shell instead.

---

### Issue: "Cannot connect to MongoDB"

**Check:**
1. MongoDB Atlas is running
2. IP whitelist includes Render IPs
3. Connection string is correct

---

### Issue: "No documents found"

**Possible causes:**
1. All attestations are inactive (isActive: false)
2. Database is empty
3. Wrong database name

---

## After Running the Script

### Test the fix:

```bash
# Test download endpoint
curl -I https://matc-backend.onrender.com/api/attestations/CERT-2025-M-M-003/download/attestation

# Should return: 302 Redirect (not 404)
```

### Verify all files:

```bash
npm run verify-cloudinary
```

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run fix-cloudinary-paths` | Fix path mismatch |
| `npm run verify-cloudinary` | Check all files |
| `npm run fix-cloudinary` | Fix access mode |

---

**Last Updated:** 29 October 2025  
**Status:** Ready to run on Render
