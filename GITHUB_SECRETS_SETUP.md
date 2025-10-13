# 🔐 GitHub Secrets Configuration Guide

## 📋 Overview

This guide explains how to configure GitHub Secrets for automated MATC full-stack deployment. These secrets will be used by GitHub Actions workflows to deploy your applications securely.

## 🔑 Required Secrets

### **Backend Repository Secrets**

Navigate to your backend repository → Settings → Secrets and variables → Actions → New repository secret

```bash
# Database Configuration
MONGODB_URI=mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db

# Render Deployment
RENDER_API_KEY=your-render-api-key-here
RENDER_SERVICE_ID=your-render-service-id-here

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Test Database (Optional)
MONGODB_URI_TEST=mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_test_db
```

### **Frontend Repository Secrets**

Navigate to your frontend repository → Settings → Secrets and variables → Actions → New repository secret

```bash
# API Configuration
VITE_API_BASE_URL=https://matc-backend.onrender.com/api
VITE_APP_NAME=MA-TRAINING-CONSULTING
VITE_APP_VERSION=1.0.0

# Vercel Deployment
VERCEL_TOKEN=your-vercel-token-here
VERCEL_ORG_ID=your-vercel-org-id-here
VERCEL_PROJECT_ID=your-vercel-project-id-here
```

### **Admin Panel Repository Secrets**

Navigate to your admin panel repository → Settings → Secrets and variables → Actions → New repository secret

```bash
# API Configuration
VITE_API_BASE_URL=https://matc-backend.onrender.com/api

# Vercel Deployment
VERCEL_TOKEN=your-vercel-token-here
VERCEL_ORG_ID=your-vercel-org-id-here
VERCEL_ADMIN_PROJECT_ID=your-admin-vercel-project-id-here
```

## 🔍 How to Get These Values

### **1. MongoDB URI**
- Already provided: `mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db`
- This is your existing MongoDB Atlas connection string

### **2. Render API Key**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your profile → Account Settings
3. Navigate to API Keys section
4. Create a new API key
5. Copy the generated key

### **3. Render Service ID**
1. Go to your backend service in Render Dashboard
2. The Service ID is in the URL: `https://dashboard.render.com/web/srv-XXXXXXXXX`
3. Copy the `srv-XXXXXXXXX` part

### **4. Vercel Token**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your profile → Settings
3. Navigate to Tokens section
4. Create a new token with appropriate scope
5. Copy the generated token

### **5. Vercel Organization ID**
1. In Vercel Dashboard, go to Settings → General
2. Copy the Team ID (this is your Org ID)

### **6. Vercel Project IDs**
1. Go to your project in Vercel Dashboard
2. Navigate to Settings → General
3. Copy the Project ID
4. Repeat for both frontend and admin panel projects

### **7. JWT Secret**
Generate a secure random string:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use online generator
# https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

## 📝 Step-by-Step Setup Instructions

### **Step 1: Backend Repository**
1. Go to `https://github.com/your-username/matc-backend`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret from the Backend section above

### **Step 2: Frontend Repository**
1. Go to `https://github.com/your-username/matc-frontend`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret from the Frontend section above

### **Step 3: Admin Panel Repository**
1. Go to `https://github.com/your-username/matc-admin-panel`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret from the Admin Panel section above

## ✅ Verification Checklist

After setting up all secrets, verify:

- [ ] **Backend Repository** has 5 secrets configured
- [ ] **Frontend Repository** has 6 secrets configured  
- [ ] **Admin Panel Repository** has 4 secrets configured
- [ ] All secret names match exactly (case-sensitive)
- [ ] No trailing spaces in secret values
- [ ] MongoDB URI is accessible and valid
- [ ] Render API key has proper permissions
- [ ] Vercel token has deployment permissions

## 🚀 Testing the Setup

### **Method 1: Manual Workflow Trigger**
1. Go to your repository → Actions
2. Select "Deploy MATC [Component]" workflow
3. Click "Run workflow"
4. Monitor the deployment logs

### **Method 2: Push to Main Branch**
1. Make a small change to your code
2. Commit and push to `main` branch
3. GitHub Actions will automatically trigger
4. Monitor the deployment in Actions tab

### **Method 3: Use Deployment Script**
```bash
# Set environment variables locally
export MONGODB_URI="mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db"
export RENDER_API_KEY="your-render-api-key"
export VERCEL_TOKEN="your-vercel-token"
# ... other variables

# Run deployment script
node deploy-matc.js
```

## 🔒 Security Best Practices

### **✅ Do:**
- Use GitHub Secrets for all sensitive data
- Rotate API keys regularly
- Use different secrets for different environments
- Monitor secret usage in Actions logs
- Use least-privilege access for API keys

### **❌ Don't:**
- Commit secrets to your repository
- Share secrets in plain text
- Use production secrets for testing
- Log secret values in your code
- Use weak JWT secrets

## 🆘 Troubleshooting

### **Common Issues:**

**1. "Secret not found" error**
- Check secret name spelling (case-sensitive)
- Ensure secret is set in correct repository
- Verify secret has a value (not empty)

**2. "Invalid API key" error**
- Regenerate API key in respective platform
- Update secret with new key value
- Check API key permissions

**3. "Deployment failed" error**
- Check deployment logs in Actions tab
- Verify all required secrets are configured
- Test API endpoints manually

**4. "CORS error" in frontend**
- Verify `VITE_API_BASE_URL` points to correct backend
- Check backend CORS configuration
- Ensure backend is deployed and healthy

## 📞 Support

If you encounter issues:

1. **Check GitHub Actions logs** for detailed error messages
2. **Verify secret configuration** using the checklist above
3. **Test individual components** before full deployment
4. **Monitor deployment status** in respective platforms (Render/Vercel)

## 🎯 Expected Results

After proper configuration:

- ✅ **Automated deployments** trigger on code push
- ✅ **Environment variables** sync automatically
- ✅ **Health checks** validate deployments
- ✅ **Full-stack integration** works seamlessly
- ✅ **Deployment reports** generated automatically

---

*Last updated: October 13, 2025*  
*Version: 1.0.0*
