# 🔐 GitHub Secrets Configuration Instructions

## 📋 Required Secrets

To complete the deployment automation, you need to add the following secrets to your GitHub repository:

### 🔗 Repository URL
https://github.com/maaloulahmed93-oss/matc-fullstack/settings/secrets/actions

### 📝 Secrets to Add

Click "New repository secret" for each of the following:

#### **Backend & Environment Secrets:**
```
Name: MONGODB_URI
Value: mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db

Name: NODE_ENV
Value: production

Name: PORT
Value: 10000

Name: FRONTEND_URLS
Value: https://matrainingconsulting.vercel.app,https://admine-lake.vercel.app

Name: JWT_SECRET
Value: matc_secret_2025

Name: VITE_API_BASE_URL
Value: https://matc-backend.onrender.com/api

Name: VITE_APP_NAME
Value: MA-TRAINING-CONSULTING
```

#### **Deployment Secrets (Get from respective platforms):**
```
Name: VERCEL_TOKEN
Value: [Get from Vercel Dashboard → Settings → Tokens]

Name: RENDER_API_KEY
Value: [Get from Render Dashboard → Account Settings → API Keys]

Name: RENDER_SERVICE_ID
Value: [Get from Render service URL: srv-XXXXXXXXX]

Name: VERCEL_ORG_ID
Value: [Get from Vercel Dashboard → Settings → General]

Name: VERCEL_PROJECT_ID
Value: [Get from Vercel Project → Settings → General]

Name: VERCEL_ADMIN_PROJECT_ID
Value: [Get from Admin Panel Vercel Project → Settings]
```

## 🚀 After Adding Secrets

1. Go to the Actions tab in your GitHub repository
2. You should see the "Deploy MATC Fullstack" workflow
3. Click "Run workflow" to test the deployment
4. Or push a new commit to trigger automatic deployment

## 🔗 Quick Links

- **Repository:** https://github.com/maaloulahmed93-oss/matc-fullstack
- **Actions:** https://github.com/maaloulahmed93-oss/matc-fullstack/actions
- **Secrets:** https://github.com/maaloulahmed93-oss/matc-fullstack/settings/secrets/actions

## ✅ Verification

After adding all secrets, the deployment should work automatically when you push code to the main branch.
