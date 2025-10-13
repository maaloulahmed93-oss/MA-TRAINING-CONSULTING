# ⚡ دليل سريع لإضافة GitHub Secrets

## 🔗 **الرابط المباشر:**
```
https://github.com/maaloulahmed93-oss/MA-TRAINING-CONSULTING/settings/secrets/actions
```

---

## 📋 **المتغيرات الأساسية (أضفها الآن):**

### **1. قاعدة البيانات:**
```
Name: MONGODB_URI
Value: mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db
```

### **2. الأمان:**
```
Name: JWT_SECRET
Value: matc_secret_key_2025_ultra_secure_token_for_authentication
```

### **3. البيئة:**
```
Name: NODE_ENV
Value: production
```

### **4. API للـ Frontend:**
```
Name: VITE_API_BASE_URL
Value: https://matc-backend.onrender.com/api
```

### **5. اسم التطبيق:**
```
Name: VITE_APP_NAME
Value: MA-TRAINING-CONSULTING
```

### **6. إصدار التطبيق:**
```
Name: VITE_APP_VERSION
Value: 1.0.0
```

### **7. البيئة للـ Frontend:**
```
Name: VITE_ENVIRONMENT
Value: production
```

### **8. المنفذ:**
```
Name: PORT
Value: 10000
```

### **9. روابط Frontend:**
```
Name: FRONTEND_URLS
Value: https://matrainingconsulting.vercel.app,https://admine-lake.vercel.app
```

---

## 🔑 **المتغيرات المتقدمة (احصل على القيم أولاً):**

### **للحصول على VERCEL_TOKEN:**
1. اذهب إلى: https://vercel.com/account/tokens
2. اضغط "Create Token"
3. انسخ القيمة وأضفها:
```
Name: VERCEL_TOKEN
Value: [القيمة التي حصلت عليها]
```

### **للحصول على VERCEL_ORG_ID:**
1. اذهب إلى: https://vercel.com/dashboard
2. Settings → General
3. انسخ Team ID:
```
Name: VERCEL_ORG_ID
Value: [Team ID]
```

### **للحصول على VERCEL_PROJECT_ID:**
1. اذهب إلى مشروع Frontend في Vercel
2. Settings → General
3. انسخ Project ID:
```
Name: VERCEL_PROJECT_ID
Value: [Project ID للـ Frontend]
```

### **للحصول على VERCEL_ADMIN_PROJECT_ID:**
1. اذهب إلى مشروع Admin Panel في Vercel
2. Settings → General
3. انسخ Project ID:
```
Name: VERCEL_ADMIN_PROJECT_ID
Value: [Project ID للـ Admin Panel]
```

### **للحصول على RENDER_API_KEY:**
1. اذهب إلى: https://dashboard.render.com/account/api-keys
2. اضغط "Create API Key"
3. انسخ القيمة:
```
Name: RENDER_API_KEY
Value: [API Key من Render]
```

### **للحصول على RENDER_SERVICE_ID:**
1. اذهب إلى خدمة Backend في Render
2. انظر إلى URL: `https://dashboard.render.com/web/srv-xxxxxxxxx`
3. انسخ `srv-xxxxxxxxx`:
```
Name: RENDER_SERVICE_ID
Value: srv-xxxxxxxxx
```

---

## ⚡ **خطوات سريعة:**

### **1. افتح الرابط:**
https://github.com/maaloulahmed93-oss/MA-TRAINING-CONSULTING/settings/secrets/actions

### **2. لكل متغير:**
- اضغط "New repository secret"
- أدخل Name
- أدخل Value
- اضغط "Add secret"

### **3. ابدأ بالمتغيرات الأساسية أولاً**

### **4. ثم أضف المتغيرات المتقدمة**

---

## ✅ **التحقق من النجاح:**

بعد إضافة جميع المتغيرات:

1. **راقب GitHub Actions:**
   https://github.com/maaloulahmed93-oss/MA-TRAINING-CONSULTING/actions

2. **اختبر لوحة الإدارة:**
   https://admine-lake.vercel.app/

3. **اختبر الـ Backend:**
   https://matc-backend.onrender.com/api/health

---

## 🎯 **النتيجة المتوقعة:**

- ✅ **GitHub Actions تعمل بدون أخطاء**
- ✅ **لوحة الإدارة تعمل بشكل كامل**
- ✅ **النشر التلقائي يعمل**
- ✅ **جميع المكونات متصلة**

---

**🚀 ابدأ بإضافة المتغيرات الأساسية الآن!**
