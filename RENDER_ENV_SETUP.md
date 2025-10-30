# 🔧 Render Environment Variables Setup

## ❌ Current Error
```
❌ SUPABASE_URL and SUPABASE_KEY must be defined in .env
Error: Missing Supabase credentials
```

## ✅ Solution: Add Environment Variables on Render

### Step-by-Step Instructions

#### 1. Go to Render Dashboard
🔗 https://dashboard.render.com

#### 2. Select Your Backend Service
- Click on **matc-backend** (or your service name)

#### 3. Go to Environment Tab
- Click **Environment** in the left sidebar

#### 4. Add Supabase Variables

Click **"Add Environment Variable"** and add these **TWO** variables:

---

**Variable 1:**
```
Key:   SUPABASE_URL
Value: https://rkdchtqalnigwdekbmeu.supabase.co
```

**Variable 2:**
```
Key:   SUPABASE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrZGNodHFhbG5pZ3dkZWtibWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjUwODYsImV4cCI6MjA3NzM0MTA4Nn0.2OqpRvjyQR5QSYpjjqIir78tpGGUJENYY68rDsF07iY
```

---

#### 5. Remove Old Cloudinary Variables (if present)

Delete these if they exist:
- ❌ `CLOUDINARY_CLOUD_NAME`
- ❌ `CLOUDINARY_API_KEY`
- ❌ `CLOUDINARY_API_SECRET`

#### 6. Save Changes
- Click **"Save Changes"** button
- Render will automatically redeploy

---

## 📸 Visual Guide

### Where to Find Environment Tab:
```
Render Dashboard
  └── Your Service (matc-backend)
      └── Environment (left sidebar)
          └── Add Environment Variable
```

### What It Should Look Like:
```
Environment Variables
┌─────────────────────────────────────────────────────────┐
│ MONGODB_URI          mongodb+srv://...                  │
│ PORT                 5000                                │
│ NODE_ENV             production                          │
│ SUPABASE_URL         https://rkdchtqalnigwdekbmeu...    │ ← ADD THIS
│ SUPABASE_KEY         eyJhbGciOiJIUzI1NiIsInR5cCI6...    │ ← ADD THIS
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Expected Result After Adding Variables

### Server Logs Will Show:
```
✅ Supabase client initialized
📦 Bucket: attestations
🌐 URL: https://rkdchtqalnigwdekbmeu.supabase.co
✅ MongoDB Atlas connecté avec succès
✅ Supabase Storage initialized
✅ Bucket exists: attestations
🚀 Serveur démarré sur le port 5000
```

### Instead of:
```
❌ SUPABASE_URL and SUPABASE_KEY must be defined in .env
Error: Missing Supabase credentials
```

---

## 🔄 Deployment Timeline

1. **Add variables** → Click Save
2. **Render detects change** → Auto-redeploy starts (~30 seconds)
3. **Build completes** → npm install (~1 minute)
4. **Server starts** → With Supabase configured (~10 seconds)
5. **✅ Deployment successful** → Total time: ~2 minutes

---

## 🧪 Verify Deployment

### Check Health Endpoint:
```bash
curl https://matc-backend.onrender.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "database": "connected"
}
```

### Check Logs in Render:
- Go to **Logs** tab
- Look for: `✅ Supabase client initialized`

---

## 🐛 Troubleshooting

### If Server Still Crashes:

#### Check 1: Variables Are Saved
- Go back to Environment tab
- Verify both `SUPABASE_URL` and `SUPABASE_KEY` are listed

#### Check 2: No Typos
- Key names must be EXACT: `SUPABASE_URL` (not `SUPABASE_URI`)
- Values must be complete (no spaces at start/end)

#### Check 3: Redeploy Triggered
- After saving, Render should show "Deploying..."
- If not, click **Manual Deploy** → **Deploy latest commit**

#### Check 4: Check Logs
- Go to **Logs** tab
- Look for error messages
- Should see Supabase initialization messages

---

## 📝 Quick Copy-Paste

### For Render Environment Variables:

**SUPABASE_URL:**
```
https://rkdchtqalnigwdekbmeu.supabase.co
```

**SUPABASE_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrZGNodHFhbG5pZ3dkZWtibWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjUwODYsImV4cCI6MjA3NzM0MTA4Nn0.2OqpRvjyQR5QSYpjjqIir78tpGGUJENYY68rDsF07iY
```

---

## ✅ Checklist

- [ ] Go to Render Dashboard
- [ ] Select backend service
- [ ] Click Environment tab
- [ ] Add SUPABASE_URL
- [ ] Add SUPABASE_KEY
- [ ] Remove old CLOUDINARY_* vars
- [ ] Click Save Changes
- [ ] Wait for redeploy (~2 min)
- [ ] Check logs for success messages
- [ ] Test health endpoint

---

## 🎯 Important Notes

1. **Don't commit .env file** - Environment variables should only be in Render Dashboard
2. **Use anon key** - Not the service_role key (for security)
3. **Variables are case-sensitive** - Must be exact: `SUPABASE_URL`
4. **Redeploy is automatic** - Render will redeploy after saving

---

**Status**: ⏳ Waiting for environment variables to be added  
**Next Step**: Add variables in Render Dashboard  
**ETA**: 2 minutes after adding variables  

---

**Date**: October 30, 2025 at 2:26 AM  
**Issue**: Missing Supabase credentials on Render  
**Solution**: Add environment variables in Render Dashboard
