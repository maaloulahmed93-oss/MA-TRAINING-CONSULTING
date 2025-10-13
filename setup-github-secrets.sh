#!/bin/bash
# GitHub Secrets Setup Commands
# Run these commands if you have GitHub CLI installed

echo "🔐 Setting up GitHub Secrets..."

gh secret set MONGODB_URI --body "mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db"
gh secret set MONGODB_URI_TEST --body "mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_test_db"
gh secret set JWT_SECRET --body "matc_secret_key_2025_ultra_secure_token_for_authentication"
gh secret set ENCRYPTION_KEY --body "matc_encryption_2025_secure_key_for_data_protection"
gh secret set NODE_ENV --body "production"
gh secret set PORT --body "10000"
gh secret set FRONTEND_URLS --body "https://matrainingconsulting.vercel.app,https://admine-lake.vercel.app"
gh secret set VITE_API_BASE_URL --body "https://matc-backend.onrender.com/api"
gh secret set VITE_APP_NAME --body "MA-TRAINING-CONSULTING"
gh secret set VITE_APP_VERSION --body "1.0.0"
gh secret set VITE_ENVIRONMENT --body "production"
gh secret set ADMIN_EMAIL --body "admin@matc.com"
gh secret set ADMIN_PASSWORD --body "matc_admin_2025_secure"
gh secret set CONTACT_EMAIL --body "contact@matc.com"
gh secret set SUPPORT_EMAIL --body "support@matc.com"

echo "✅ Automatic secrets added!"
echo "⚠️ Please add the following secrets manually:"
echo "  RENDER_API_KEY: احصل عليه من: https://dashboard.render.com/account/api-keys"
echo "  RENDER_SERVICE_ID: احصل عليه من URL الخدمة في Render: srv-xxxxxxxxx"
echo "  VERCEL_TOKEN: احصل عليه من: https://vercel.com/account/tokens"
echo "  VERCEL_ORG_ID: احصل عليه من Vercel Dashboard → Settings → General"
echo "  VERCEL_PROJECT_ID: احصل عليه من Frontend Project → Settings → General"
echo "  VERCEL_ADMIN_PROJECT_ID: احصل عليه من Admin Panel Project → Settings → General"

echo "🔗 Add them at: https://github.com/maaloulahmed93-oss/MA-TRAINING-CONSULTING/settings/secrets/actions"