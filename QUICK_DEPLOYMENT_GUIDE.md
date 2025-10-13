# 🚀 MATC Quick Deployment Guide

## ⚡ 3 Steps to Deploy (5 minutes)

---

## 1️⃣ BACKEND (Render)

```bash
git add backend/server.js
git commit -m "🔧 Fix CORS origins for matrainingconsulting"
git push origin main
```

**Wait:** 2-3 minutes for Render auto-deploy  
**Check:** https://dashboard.render.com

---

## 2️⃣ FRONTEND ENV VAR (Vercel Dashboard)

1. Go to: https://vercel.com/dashboard
2. Project: `matrainingconsulting`
3. Settings → Environment Variables → Add New
4. **Key:** `VITE_API_BASE_URL`
5. **Value:** `https://matc-backend.onrender.com/api`
6. **Environments:** All (Production, Preview, Development)
7. Click **Save**

---

## 3️⃣ FRONTEND (Vercel)

```bash
git add src/config/api.ts .env.example
git commit -m "🚀 Configure production API URL"
git push origin main
```

**Wait:** 1-2 minutes for Vercel auto-deploy  
**Check:** https://vercel.com/dashboard

---

## ✅ VERIFY

Open in browser: https://matrainingconsulting.vercel.app

**Expected:**
- ✅ No CORS errors in console (F12)
- ✅ API calls succeed
- ✅ Data loads correctly

---

## 🔍 TEST BACKEND

```powershell
Invoke-WebRequest -Uri "https://matc-backend.onrender.com/api/health" -UseBasicParsing | Select-Object -Expand Content
```

**Expected Response:**
```json
{"success": true, "database": "connected"}
```

---

## 📚 Full Documentation

- **MATC_DEPLOYMENT_COMPLETE_SUMMARY.md** - Complete guide
- **DEPLOYMENT_FIXES_APPLIED.md** - Detailed instructions
- **matc_deployment_report.json** - Full audit data

---

## ❓ Troubleshooting

**Still getting CORS errors?**
- Wait 5 minutes (Render cold start)
- Hard refresh browser (Ctrl+Shift+R)
- Check Render dashboard for deployment status

**Frontend can't connect?**
- Verify env var was added in Vercel
- Ensure frontend was redeployed AFTER adding env var
- Check Vercel build logs

---

## 🎯 What Was Fixed

1. ✅ **Backend CORS:** `ma-training-consulting` → `matrainingconsulting`
2. ✅ **Frontend API:** Localhost fallback → Production URL
3. ✅ **Environment:** Added `VITE_API_BASE_URL` documentation

---

**Status:** ✅ All fixes applied  
**Ready for:** Deployment  
**Expected Result:** 100/100 System Health
