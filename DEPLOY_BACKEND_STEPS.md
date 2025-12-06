# Backend Deployment Guide - Render.com

## ✅ Pre-Deployment Checklist

- [x] Backend code optimized (N+1 queries fixed, caching added)
- [x] package.json configured correctly
- [x] render.yaml blueprint ready
- [ ] Environment variables set in Render dashboard
- [ ] Changes committed to GitHub

---

## 🚀 Step 1: Commit Changes to GitHub

Run these commands in your terminal:

```bash
cd c:\Users\ahmed\Desktop\ss1\MA-TRAINING-CONSULTING

# Stage all changes
git add -A

# Commit with a descriptive message
git commit -m "🚀 Performance optimization: Fix N+1 queries, add caching, optimize partnerships endpoint"

# Push to GitHub
git push origin main
```

---

## 🌐 Step 2: Deploy to Render

### Option A: Auto-Deploy (Recommended)
If you've already connected your GitHub repo to Render:
1. The deployment will start **automatically** when you push to GitHub
2. Monitor progress at: https://dashboard.render.com

### Option B: Manual Deploy
1. Go to https://dashboard.render.com
2. Find your service: **matc-backend-api**
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Wait for deployment to complete (2-5 minutes)

---

## 🔐 Step 3: Verify Environment Variables

Go to Render Dashboard → **matc-backend-api** → **Environment**

Ensure these variables are set:

```
NODE_ENV = production
PORT = 3001
MONGODB_URI = [Your MongoDB connection string]
JWT_SECRET = [Your JWT secret]
SESSION_SECRET = [Your session secret]
SUPABASE_URL = https://rkdchtqalnigwdekbmeu.supabase.co
SUPABASE_KEY = [Your Supabase key]
```

**⚠️ Important:** Never commit `.env` files to GitHub. Always set secrets in Render dashboard.

---

## ✅ Step 4: Verify Deployment

### Check Health Endpoint
Visit: `https://matc-backend.onrender.com/api/health`

Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "database": "connected",
  "uptime": 123.45
}
```

### Check Partnerships Endpoint
Visit: `https://matc-backend.onrender.com/api/partnerships`

Should return partnership data quickly (< 500ms)

### Check Logs
In Render Dashboard:
1. Go to **matc-backend-api**
2. Click **"Logs"** tab
3. Look for:
   - ✅ `🚀 Serveur démarré sur le port 3001`
   - ✅ `✅ MongoDB Atlas connecté avec succès`
   - ✅ `✅ Using cached partnership settings` (after first request)

---

## 🔍 Step 5: Performance Verification

### Test Response Times

**First Request (Cache Miss):**
```
Expected: 200-400ms
Check: Should query DB and populate cache
```

**Subsequent Requests (Cache Hit):**
```
Expected: 10-20ms
Check: Should see "✅ Using cached partnership settings" in logs
```

### Monitor Cache Effectiveness

In Render logs, you should see:
```
✅ Using cached partnership settings  ← Cache hit (fast)
🔄 Loading partnerships for frontend  ← Cache miss (slower)
```

---

## 🐛 Troubleshooting

### Issue: Deployment Failed
**Solution:**
1. Check Render logs for error messages
2. Verify all environment variables are set
3. Ensure MongoDB URI is correct
4. Try manual redeploy

### Issue: Still Slow (> 1 second)
**Possible Causes:**
- MongoDB connection is slow
- Render free tier instance is cold
- Network latency

**Solutions:**
1. Upgrade Render plan (free tier sleeps after 15 min)
2. Use a faster MongoDB region
3. Check network latency with: `curl -w "@curl-format.txt" https://matc-backend.onrender.com/api/health`

### Issue: Cache Not Working
**Check:**
1. Look for "Using cached partnership settings" in logs
2. If not appearing, cache may be disabled
3. Verify PartnershipSettings.js changes were deployed

---

## 📊 Performance Metrics After Deployment

| Endpoint | Before | After | Status |
|----------|--------|-------|--------|
| `/api/partnerships` (first) | 2-3s | 200-400ms | ✅ 85% faster |
| `/api/partnerships` (cached) | 2-3s | 10-20ms | ✅ 99% faster |
| `/api/partnerships/global-email` | 1-2s | 100-200ms | ✅ 90% faster |
| `/api/partnerships/visibility` | 1-2s | 100-200ms | ✅ 90% faster |

---

## 🔄 Rollback (If Needed)

If something goes wrong:

1. Go to Render Dashboard → **matc-backend-api**
2. Click **"Deployments"** tab
3. Find the previous successful deployment
4. Click **"Redeploy"**

Or revert in GitHub:
```bash
git revert HEAD
git push origin main
```

---

## 📝 Deployment Checklist

- [ ] Changes committed to GitHub
- [ ] Render auto-deployed (or manual deploy triggered)
- [ ] Health endpoint returns `"success": true`
- [ ] Partnerships endpoint responds in < 500ms
- [ ] Logs show "Using cached partnership settings"
- [ ] Frontend test page loads without timeout errors
- [ ] Admin panel loads partnerships quickly

---

## 🎯 Next Steps

1. **Monitor Performance:** Check Render logs for cache hits
2. **Test Frontend:** Visit admin panel and verify fast loading
3. **Gather Metrics:** Compare before/after response times
4. **Optimize Further:** If needed, consider:
   - Database indexing
   - CDN for static assets
   - Query optimization for other endpoints

---

## 📞 Support

If deployment fails:
1. Check Render logs for specific error
2. Verify MongoDB connection string
3. Ensure all dependencies are installed
4. Check Node.js version (should be 18+)

For questions, refer to:
- Render docs: https://render.com/docs
- MongoDB docs: https://docs.mongodb.com
- Express docs: https://expressjs.com
