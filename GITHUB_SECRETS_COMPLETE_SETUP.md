# 🔐 دليل شامل لإعداد GitHub Secrets

## 📋 جميع المتغيرات المطلوبة

### **🔗 رابط إضافة Secrets:**
```
https://github.com/maaloulahmed93-oss/MA-TRAINING-CONSULTING/settings/secrets/actions
```

---

## 🗄️ **1. متغيرات قاعدة البيانات**

### **MONGODB_URI**
```
Name: MONGODB_URI
Value: mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db
```

### **MONGODB_URI_TEST** (للاختبار)
```
Name: MONGODB_URI_TEST
Value: mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_test_db
```

---

## 🔐 **2. متغيرات الأمان**

### **JWT_SECRET**
```
Name: JWT_SECRET
Value: matc_secret_key_2025_ultra_secure_token_for_authentication
```

### **ENCRYPTION_KEY** (إضافي)
```
Name: ENCRYPTION_KEY
Value: matc_encryption_2025_secure_key_for_data_protection
```

---

## 🌐 **3. متغيرات البيئة العامة**

### **NODE_ENV**
```
Name: NODE_ENV
Value: production
```

### **PORT**
```
Name: PORT
Value: 10000
```

### **FRONTEND_URLS**
```
Name: FRONTEND_URLS
Value: https://matrainingconsulting.vercel.app,https://admine-lake.vercel.app
```

---

## 🎨 **4. متغيرات Frontend (Vite)**

### **VITE_API_BASE_URL**
```
Name: VITE_API_BASE_URL
Value: https://matc-backend.onrender.com/api
```

### **VITE_APP_NAME**
```
Name: VITE_APP_NAME
Value: MA-TRAINING-CONSULTING
```

### **VITE_APP_VERSION**
```
Name: VITE_APP_VERSION
Value: 1.0.0
```

### **VITE_ENVIRONMENT**
```
Name: VITE_ENVIRONMENT
Value: production
```

---

## 🚀 **5. متغيرات Render (Backend)**

### **RENDER_API_KEY**
```
Name: RENDER_API_KEY
Value: [احصل عليه من: https://dashboard.render.com/account/api-keys]
```

### **RENDER_SERVICE_ID**
```
Name: RENDER_SERVICE_ID
Value: [احصل عليه من URL الخدمة في Render: srv-xxxxxxxxx]
```

---

## ☁️ **6. متغيرات Vercel (Frontend & Admin)**

### **VERCEL_TOKEN**
```
Name: VERCEL_TOKEN
Value: [احصل عليه من: https://vercel.com/account/tokens]
```

### **VERCEL_ORG_ID**
```
Name: VERCEL_ORG_ID
Value: [احصل عليه من Vercel Dashboard → Settings → General]
```

### **VERCEL_PROJECT_ID** (Frontend)
```
Name: VERCEL_PROJECT_ID
Value: [احصل عليه من Frontend Project → Settings → General]
```

### **VERCEL_ADMIN_PROJECT_ID** (Admin Panel)
```
Name: VERCEL_ADMIN_PROJECT_ID
Value: [احصل عليه من Admin Panel Project → Settings → General]
```

---

## 📧 **7. متغيرات إضافية (اختيارية)**

### **ADMIN_EMAIL**
```
Name: ADMIN_EMAIL
Value: admin@matc.com
```

### **ADMIN_PASSWORD**
```
Name: ADMIN_PASSWORD
Value: matc_admin_2025_secure
```

### **CONTACT_EMAIL**
```
Name: CONTACT_EMAIL
Value: contact@matc.com
```

### **SUPPORT_EMAIL**
```
Name: SUPPORT_EMAIL
Value: support@matc.com
```

---

## 🛠️ **كيفية إضافة Secrets:**

### **الطريقة 1: عبر GitHub Web Interface**

1. **اذهب إلى:**
   ```
   https://github.com/maaloulahmed93-oss/MA-TRAINING-CONSULTING/settings/secrets/actions
   ```

2. **اضغط "New repository secret"**

3. **أدخل Name و Value**

4. **اضغط "Add secret"**

5. **كرر لكل متغير**

### **الطريقة 2: عبر GitHub CLI (إذا كان متاحاً)**

```bash
gh secret set MONGODB_URI --body "mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db"
gh secret set JWT_SECRET --body "matc_secret_key_2025_ultra_secure_token_for_authentication"
gh secret set VITE_API_BASE_URL --body "https://matc-backend.onrender.com/api"
# ... إلخ
```

---

## ✅ **قائمة التحقق:**

### **متغيرات أساسية (مطلوبة):**
- [ ] `MONGODB_URI`
- [ ] `JWT_SECRET`
- [ ] `NODE_ENV`
- [ ] `VITE_API_BASE_URL`
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`
- [ ] `VERCEL_ADMIN_PROJECT_ID`

### **متغيرات Render (للنشر التلقائي):**
- [ ] `RENDER_API_KEY`
- [ ] `RENDER_SERVICE_ID`

### **متغيرات إضافية (محسنة):**
- [ ] `MONGODB_URI_TEST`
- [ ] `VITE_APP_NAME`
- [ ] `VITE_APP_VERSION`
- [ ] `FRONTEND_URLS`
- [ ] `PORT`

---

## 🔍 **كيفية الحصول على القيم المفقودة:**

### **RENDER_API_KEY:**
1. اذهب إلى: https://dashboard.render.com/account/api-keys
2. اضغط "Create API Key"
3. انسخ القيمة

### **RENDER_SERVICE_ID:**
1. اذهب إلى خدمة Backend في Render
2. انظر إلى URL: `https://dashboard.render.com/web/srv-xxxxxxxxx`
3. `srv-xxxxxxxxx` هو الـ Service ID

### **VERCEL_TOKEN:**
1. اذهب إلى: https://vercel.com/account/tokens
2. اضغط "Create Token"
3. انسخ القيمة

### **VERCEL_ORG_ID:**
1. اذهب إلى: https://vercel.com/dashboard
2. Settings → General
3. انسخ Team ID

### **VERCEL_PROJECT_ID:**
1. اذهب إلى مشروع Frontend في Vercel
2. Settings → General
3. انسخ Project ID

### **VERCEL_ADMIN_PROJECT_ID:**
1. اذهب إلى مشروع Admin Panel في Vercel
2. Settings → General
3. انسخ Project ID

---

## 🎯 **بعد إضافة جميع Secrets:**

1. **اذهب إلى GitHub Actions:**
   ```
   https://github.com/maaloulahmed93-oss/MA-TRAINING-CONSULTING/actions
   ```

2. **شغل workflow يدوياً أو ادفع commit جديد**

3. **راقب النشر - يجب أن يعمل بدون أخطاء**

4. **اختبر جميع المكونات:**
   - Backend: https://matc-backend.onrender.com/api/health
   - Frontend: https://matrainingconsulting.vercel.app/
   - Admin Panel: https://admine-lake.vercel.app/

---

## 🚨 **ملاحظات أمنية:**

- **لا تشارك هذه القيم** مع أحد
- **لا تضعها في الكود** مطلقاً
- **استخدم GitHub Secrets فقط**
- **راجع الصلاحيات** بانتظام

---

**بعد إضافة جميع هذه Secrets، ستعمل جميع workflows بشكل مثالي! 🚀**
