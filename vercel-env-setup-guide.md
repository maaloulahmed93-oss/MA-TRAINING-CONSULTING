# ⚙️ دليل إعداد متغيرات البيئة في Vercel - MATC

## 🎯 الهدف
إعداد متغيرات البيئة الصحيحة في Vercel لضمان اتصال Frontend و Admin Panel بـ Backend API بشكل صحيح.

## 📋 الخطوات المطلوبة

### 1. إعداد Frontend (matrainingconsulting)

#### الدخول إلى Vercel Dashboard:
1. اذهب إلى https://vercel.com/dashboard
2. اختر مشروع `matrainingconsulting`
3. اضغط على **Settings**
4. اختر **Environment Variables** من القائمة الجانبية

#### إضافة المتغيرات:
```
Key: VITE_API_BASE_URL
Value: https://matc-backend.onrender.com/api
Environment: Production ✅
Environment: Preview ✅ (اختياري)
Environment: Development ❌ (لا تضعه للتطوير المحلي)
```

```
Key: VITE_APP_NAME
Value: MA-TRAINING-CONSULTING
Environment: Production ✅
```

```
Key: VITE_APP_VERSION
Value: 1.0.0
Environment: Production ✅
```

### 2. إعداد Admin Panel (admine-lake)

#### الدخول إلى Vercel Dashboard:
1. اذهب إلى https://vercel.com/dashboard
2. اختر مشروع `admine-lake`
3. اضغط على **Settings**
4. اختر **Environment Variables** من القائمة الجانبية

#### إضافة المتغيرات:
```
Key: VITE_API_BASE_URL
Value: https://matc-backend.onrender.com/api
Environment: Production ✅
Environment: Preview ✅ (اختياري)
```

```
Key: VITE_APP_NAME
Value: MATC-ADMIN-PANEL
Environment: Production ✅
```

## 🔄 إعادة النشر بعد إضافة المتغيرات

### Frontend:
1. اذهب إلى **Deployments** tab
2. اضغط على "..." بجانب آخر deployment
3. اختر **Redeploy**
4. ✅ تأكد من تحديد **"Do NOT use existing build cache"**
5. اضغط **Redeploy**

### Admin Panel:
1. نفس الخطوات السابقة لمشروع `admine-lake`

## 🧪 التحقق من نجاح الإعداد

### طريقة 1: فحص في المتصفح
```javascript
// افتح Developer Tools في الموقع المنشور
// Console tab واكتب:
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

// يجب أن تظهر: https://matc-backend.onrender.com/api
```

### طريقة 2: فحص Network Tab
1. افتح الموقع المنشور
2. Developer Tools → Network tab
3. أعد تحميل الصفحة
4. ابحث عن طلبات API
5. تأكد أنها تذهب إلى `matc-backend.onrender.com` وليس `localhost`

### طريقة 3: استخدام صفحة الاختبار
1. افتح `vercel-deployment-test.html` من الموقع المنشور
2. اضغط "تشغيل جميع الاختبارات"
3. تحقق من النتائج

## ❌ مشاكل شائعة وحلولها

### المشكلة 1: API calls تذهب إلى localhost
**السبب:** متغير البيئة غير مضبوط أو خاطئ
**الحل:**
1. تأكد من إضافة `VITE_API_BASE_URL` في Vercel
2. تأكد من القيمة: `https://matc-backend.onrender.com/api`
3. أعد النشر مع مسح الـ cache

### المشكلة 2: CORS errors
**السبب:** Backend لا يسمح للنطاقات الجديدة
**الحل:** أضف النطاقات في backend CORS:
```javascript
origin: [
  'https://matrainingconsulting.vercel.app',
  'https://admine-lake.vercel.app'
]
```

### المشكلة 3: Environment variables لا تظهر
**السبب:** لم يتم إعادة النشر بعد إضافة المتغيرات
**الحل:** 
1. أعد النشر مع مسح cache
2. انتظر اكتمال البناء
3. اختبر مرة أخرى

### المشكلة 4: Mixed Content (HTTP/HTTPS)
**السبب:** محاولة استدعاء HTTP من HTTPS
**الحل:** تأكد أن جميع URLs تستخدم HTTPS

## 🔍 فحص متغيرات البيئة في Build Logs

### في Vercel Build Logs:
ابحث عن هذه الأسطر:
```
✓ Environment variables loaded
✓ VITE_API_BASE_URL: https://matc-backend.onrender.com/api
```

إذا لم تظهر، فالمتغير غير مضبوط صحيح.

## 📊 قائمة التحقق النهائية

### ✅ Frontend (matrainingconsulting):
- [ ] VITE_API_BASE_URL مضبوط في Vercel
- [ ] تم إعادة النشر مع مسح cache
- [ ] API calls تذهب إلى matc-backend.onrender.com
- [ ] لا توجد CORS errors في Console
- [ ] البيانات تحمل بشكل صحيح

### ✅ Admin Panel (admine-lake):
- [ ] VITE_API_BASE_URL مضبوط في Vercel
- [ ] تم إعادة النشر مع مسح cache
- [ ] API calls تذهب إلى matc-backend.onrender.com
- [ ] Admin Panel يحمل البيانات من Backend
- [ ] لا توجد أخطاء في Console

### ✅ Backend (matc-backend):
- [ ] CORS يسمح للنطاقات الجديدة
- [ ] /api/health يعمل بشكل صحيح
- [ ] MongoDB متصل
- [ ] Environment variables مضبوطة في Render

## 🎯 نصائح مهمة

1. **لا تضع متغيرات الإنتاج في ملفات .env المحلية**
2. **استخدم Preview environment للاختبار قبل Production**
3. **امسح cache المتصفح بعد كل تحديث**
4. **اختبر من أجهزة مختلفة للتأكد**
5. **احتفظ بنسخة من إعدادات Environment Variables**

---

**💡 تذكير:** بعد إضافة أي متغير بيئة جديد، يجب إعادة النشر لتطبيق التغييرات!
