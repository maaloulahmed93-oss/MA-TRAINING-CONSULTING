# 🔐 دليل إعداد GitHub Secrets لمشروع MATC

## 📋 نظرة عامة

هذا الدليل يشرح كيفية حفظ جميع المتغيرات السرية في GitHub لتمكين النشر الآلي لمشروع MATC الكامل.

## 🎯 المتغيرات المطلوبة حسب المستودع

### **1️⃣ مستودع الخادم الخلفي (Backend Repository)**

انتقل إلى مستودع الخادم الخلفي → Settings → Secrets and variables → Actions → New repository secret

```bash
# إعدادات قاعدة البيانات
MONGODB_URI=mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db

# إعدادات Render للنشر
RENDER_API_KEY=your-render-api-key-here
RENDER_SERVICE_ID=your-render-service-id-here

# إعدادات الأمان
JWT_SECRET=your-super-secure-jwt-secret-key-here

# قاعدة بيانات الاختبار (اختياري)
MONGODB_URI_TEST=mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_test_db
```

### **2️⃣ مستودع الواجهة الأمامية (Frontend Repository)**

انتقل إلى مستودع الواجهة الأمامية → Settings → Secrets and variables → Actions → New repository secret

```bash
# إعدادات API
VITE_API_BASE_URL=https://matc-backend.onrender.com/api
VITE_APP_NAME=MA-TRAINING-CONSULTING
VITE_APP_VERSION=1.0.0

# إعدادات Vercel للنشر
VERCEL_TOKEN=your-vercel-token-here
VERCEL_ORG_ID=your-vercel-org-id-here
VERCEL_PROJECT_ID=your-vercel-project-id-here
```

### **3️⃣ مستودع لوحة الإدارة (Admin Panel Repository)**

انتقل إلى مستودع لوحة الإدارة → Settings → Secrets and variables → Actions → New repository secret

```bash
# إعدادات API
VITE_API_BASE_URL=https://matc-backend.onrender.com/api

# إعدادات Vercel للنشر
VERCEL_TOKEN=your-vercel-token-here
VERCEL_ORG_ID=your-vercel-org-id-here
VERCEL_ADMIN_PROJECT_ID=your-admin-vercel-project-id-here
```

## 🔍 كيفية الحصول على هذه القيم

### **1. MongoDB URI**
- القيمة متوفرة بالفعل: `mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db`
- هذا هو رابط الاتصال بقاعدة بيانات MongoDB Atlas الخاصة بك

### **2. Render API Key**
1. اذهب إلى [Render Dashboard](https://dashboard.render.com)
2. انقر على الملف الشخصي → Account Settings
3. انتقل إلى قسم API Keys
4. أنشئ مفتاح API جديد
5. انسخ المفتاح المُنشأ

### **3. Render Service ID**
1. اذهب إلى خدمة الخادم الخلفي في Render Dashboard
2. Service ID موجود في الرابط: `https://dashboard.render.com/web/srv-XXXXXXXXX`
3. انسخ الجزء `srv-XXXXXXXXX`

### **4. Vercel Token**
1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. انقر على الملف الشخصي → Settings
3. انتقل إلى قسم Tokens
4. أنشئ token جديد مع الصلاحيات المناسبة
5. انسخ الـ token المُنشأ

### **5. Vercel Organization ID**
1. في Vercel Dashboard، اذهب إلى Settings → General
2. انسخ Team ID (هذا هو Org ID)

### **6. Vercel Project IDs**
1. اذهب إلى مشروعك في Vercel Dashboard
2. انتقل إلى Settings → General
3. انسخ Project ID
4. كرر العملية لكل من الواجهة الأمامية ولوحة الإدارة

### **7. JWT Secret**
أنشئ نص عشوائي آمن:
```bash
# باستخدام Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# أو استخدم مولد عبر الإنترنت
# https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

## 📝 خطوات الإعداد التفصيلية

### **الخطوة 1: مستودع الخادم الخلفي**
1. اذهب إلى `https://github.com/your-username/matc-backend`
2. انقر على **Settings** → **Secrets and variables** → **Actions**
3. انقر على **New repository secret**
4. أضف كل متغير من قسم الخادم الخلفي أعلاه:

| اسم المتغير | القيمة |
|-------------|--------|
| `MONGODB_URI` | `mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db` |
| `RENDER_API_KEY` | مفتاح Render API الخاص بك |
| `RENDER_SERVICE_ID` | معرف خدمة Render |
| `JWT_SECRET` | مفتاح JWT آمن |
| `MONGODB_URI_TEST` | رابط قاعدة بيانات الاختبار |

### **الخطوة 2: مستودع الواجهة الأمامية**
1. اذهب إلى `https://github.com/your-username/matc-frontend`
2. انقر على **Settings** → **Secrets and variables** → **Actions**
3. انقر على **New repository secret**
4. أضف كل متغير من قسم الواجهة الأمامية:

| اسم المتغير | القيمة |
|-------------|--------|
| `VITE_API_BASE_URL` | `https://matc-backend.onrender.com/api` |
| `VITE_APP_NAME` | `MA-TRAINING-CONSULTING` |
| `VITE_APP_VERSION` | `1.0.0` |
| `VERCEL_TOKEN` | رمز Vercel الخاص بك |
| `VERCEL_ORG_ID` | معرف منظمة Vercel |
| `VERCEL_PROJECT_ID` | معرف مشروع الواجهة الأمامية |

### **الخطوة 3: مستودع لوحة الإدارة**
1. اذهب إلى `https://github.com/your-username/matc-admin-panel`
2. انقر على **Settings** → **Secrets and variables** → **Actions**
3. انقر على **New repository secret**
4. أضف كل متغير من قسم لوحة الإدارة:

| اسم المتغير | القيمة |
|-------------|--------|
| `VITE_API_BASE_URL` | `https://matc-backend.onrender.com/api` |
| `VERCEL_TOKEN` | رمز Vercel الخاص بك |
| `VERCEL_ORG_ID` | معرف منظمة Vercel |
| `VERCEL_ADMIN_PROJECT_ID` | معرف مشروع لوحة الإدارة |

## ✅ قائمة التحقق

بعد إعداد جميع المتغيرات، تأكد من:

- [ ] **مستودع الخادم الخلفي** يحتوي على 5 متغيرات سرية
- [ ] **مستودع الواجهة الأمامية** يحتوي على 6 متغيرات سرية
- [ ] **مستودع لوحة الإدارة** يحتوي على 4 متغيرات سرية
- [ ] جميع أسماء المتغيرات مطابقة تماماً (حساسة لحالة الأحرف)
- [ ] لا توجد مسافات إضافية في قيم المتغيرات
- [ ] رابط MongoDB URI صحيح ويمكن الوصول إليه
- [ ] مفتاح Render API له الصلاحيات المناسبة
- [ ] رمز Vercel له صلاحيات النشر

## 🧪 اختبار الإعداد

### **الطريقة 1: تشغيل سير العمل يدوياً**
1. اذهب إلى مستودعك → Actions
2. اختر سير عمل "Deploy MATC [Component]"
3. انقر على "Run workflow"
4. راقب سجلات النشر

### **الطريقة 2: دفع إلى الفرع الرئيسي**
1. قم بتغيير صغير في الكود
2. ادفع التغييرات إلى فرع `main`
3. GitHub Actions ستبدأ تلقائياً
4. راقب النشر في تبويب Actions

### **الطريقة 3: استخدام سكريبت النشر**
```bash
# تعيين متغيرات البيئة محلياً
export MONGODB_URI="mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db"
export RENDER_API_KEY="your-render-api-key"
export VERCEL_TOKEN="your-vercel-token"
# ... باقي المتغيرات

# تشغيل سكريبت النشر
node deploy-matc.js
```

## 🔒 أفضل الممارسات الأمنية

### **✅ افعل:**
- استخدم GitHub Secrets لجميع البيانات الحساسة
- قم بتدوير مفاتيح API بانتظام
- استخدم متغيرات مختلفة لبيئات مختلفة
- راقب استخدام المتغيرات في سجلات Actions
- استخدم أقل صلاحيات ممكنة لمفاتيح API

### **❌ لا تفعل:**
- لا تضع المتغيرات السرية في الكود
- لا تشارك المتغيرات السرية كنص عادي
- لا تستخدم متغيرات الإنتاج للاختبار
- لا تسجل قيم المتغيرات السرية في الكود
- لا تستخدم مفاتيح JWT ضعيفة

## 🆘 استكشاف الأخطاء وإصلاحها

### **المشاكل الشائعة:**

**1. خطأ "Secret not found"**
- تحقق من تهجئة اسم المتغير (حساس لحالة الأحرف)
- تأكد من أن المتغير مضاف في المستودع الصحيح
- تحقق من أن المتغير له قيمة (ليس فارغاً)

**2. خطأ "Invalid API key"**
- أعد إنشاء مفتاح API في المنصة المعنية
- حدث المتغير السري بالقيمة الجديدة
- تحقق من صلاحيات مفتاح API

**3. خطأ "Deployment failed"**
- تحقق من سجلات النشر في تبويب Actions
- تأكد من إعداد جميع المتغيرات المطلوبة
- اختبر نقاط API يدوياً

**4. خطأ "CORS error" في الواجهة الأمامية**
- تحقق من أن `VITE_API_BASE_URL` يشير للخادم الخلفي الصحيح
- تأكد من إعداد CORS في الخادم الخلفي
- تأكد من أن الخادم الخلفي منشور وصحي

## 📞 الدعم

إذا واجهت مشاكل:

1. **تحقق من سجلات GitHub Actions** للحصول على رسائل خطأ مفصلة
2. **راجع دليل الإعداد** باستخدام قائمة التحقق أعلاه
3. **اختبر المكونات الفردية** قبل النشر الكامل
4. **راقب حالة النشر** في المنصات المعنية (Render/Vercel)

## 🎯 النتائج المتوقعة

بعد الإعداد الصحيح:

- ✅ **النشر الآلي** يبدأ عند دفع الكود
- ✅ **متغيرات البيئة** تتزامن تلقائياً
- ✅ **فحوصات الصحة** تتحقق من النشر
- ✅ **تكامل المكدس الكامل** يعمل بسلاسة
- ✅ **تقارير النشر** تُنشأ تلقائياً

---

## 🏆 الحالة النهائية

**🎯 جميع متغيرات GitHub محفوظة وجاهزة للاستخدام**

مشروع MATC الآن لديه:
- ✅ **إدارة آمنة للمتغيرات السرية**
- ✅ **نشر آلي متكامل**
- ✅ **مراقبة شاملة للصحة**
- ✅ **تكامل متعدد المنصات**

**النظام سيقوم بنشر تطبيقاتك تلقائياً عند دفع التغييرات إلى الفرع الرئيسي.**

---

*تم إنشاء هذا الدليل في: 13 أكتوبر 2025 الساعة 6:30 مساءً UTC+02:00*  
*حالة النظام: جاهز للاستخدام الإنتاجي*
