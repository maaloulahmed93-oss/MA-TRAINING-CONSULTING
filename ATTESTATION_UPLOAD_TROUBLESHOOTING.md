# 🔧 دليل استكشاف أخطاء رفع الشهادات

## 🚨 الخطأ: ERR_CONNECTION_CLOSED / Failed to fetch

### 📊 الأعراض:
```
TypeError: Failed to fetch
net::ERR_CONNECTION_CLOSED
Erreur lors de la mise à jour de l'attestation: Failed to fetch
```

---

## 🔍 الأسباب المحتملة

### 1️⃣ **Backend في وضع Sleep (السبب الأكثر شيوعاً)**

**المشكلة:**
- Render Free Tier ينام بعد 15 دقيقة من عدم النشاط
- أول طلب بعد النوم يأخذ 30-60 ثانية للاستيقاظ
- إذا حاولت رفع ملف أثناء الاستيقاظ، يفشل الطلب

**الحل:**
1. افتح هذا الرابط في تبويب جديد:
   ```
   https://matc-backend.onrender.com/api/health
   ```

2. انتظر حتى يظهر الرد (قد يأخذ 30-60 ثانية)

3. بعد ظهور الرد، ارجع للـ Admin Panel وحاول مرة أخرى

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "API is running",
  "database": "connected"
}
```

---

### 2️⃣ **حجم الملف كبير جداً**

**المشكلة:**
- Render لديه حد أقصى لحجم الطلب
- الملفات الكبيرة (> 10MB) قد تسبب timeout

**الحل:**
1. تحقق من حجم الملف قبل الرفع
2. إذا كان > 5MB، ضغطه باستخدام:
   - https://www.ilovepdf.com/compress_pdf
   - https://smallpdf.com/compress-pdf

**الحد الأقصى الموصى به:** 5MB لكل ملف

---

### 3️⃣ **مشكلة في الاتصال بالإنترنت**

**الحل:**
1. تحقق من اتصال الإنترنت
2. حاول فتح موقع آخر للتأكد
3. أعد تحميل الصفحة (Ctrl + F5)

---

### 4️⃣ **Backend معطل**

**التحقق:**
افتح: https://matc-backend.onrender.com/api/health

**إذا لم يعمل:**
1. اذهب إلى Render Dashboard: https://dashboard.render.com
2. تحقق من حالة الخدمة `matc-backend`
3. إذا كانت معطلة، أعد تشغيلها

---

## ✅ الحلول المطبقة في الكود

### 1. زيادة Timeout إلى 2 دقيقة

**قبل:**
```typescript
const response = await fetch(url, { method: 'POST', body: formData });
// Default timeout: ~30 seconds
```

**بعد:**
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes

const response = await fetch(url, {
  method: 'POST',
  body: formData,
  signal: controller.signal
});
```

**الفائدة:**
- يعطي Backend وقت كافي للاستيقاظ
- يسمح برفع ملفات أكبر

---

### 2. رسائل خطأ أوضح

**قبل:**
```
Erreur lors de la mise à jour de l'attestation: Failed to fetch
```

**بعد:**
```
Le serveur backend est en cours de démarrage. 
Veuillez patienter 30 secondes et réessayer.
```

**الفائدة:**
- المستخدم يفهم المشكلة
- يعرف ماذا يفعل

---

## 📋 خطوات استكشاف الأخطاء

### الخطوة 1: تحقق من حالة Backend

```bash
# في المتصفح أو Terminal
curl https://matc-backend.onrender.com/api/health
```

**النتائج المحتملة:**

| الرد | المعنى | الإجراء |
|------|--------|---------|
| استجابة فورية (< 5 ثوان) | Backend يعمل ✅ | انتقل للخطوة 2 |
| استجابة بطيئة (30-60 ثانية) | Backend كان نائماً ⏳ | انتظر ثم حاول مرة أخرى |
| لا توجد استجابة | Backend معطل ❌ | تحقق من Render Dashboard |

---

### الخطوة 2: تحقق من حجم الملف

```javascript
// في Console المتصفح
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
console.log('File size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
```

**الحد الأقصى:** 5MB

---

### الخطوة 3: تحقق من Console

افتح Console (F12) وابحث عن:

```
❌ net::ERR_CONNECTION_CLOSED
❌ Failed to fetch
❌ TypeError: Failed to fetch
```

**إذا رأيت هذه الأخطاء:**
- Backend نائم أو معطل
- اتبع الخطوة 1

---

### الخطوة 4: تحقق من Network Tab

1. افتح DevTools (F12)
2. اذهب إلى تبويب Network
3. حاول رفع الملف
4. ابحث عن طلب `/attestations/upload`

**الحالات المحتملة:**

| Status | المعنى | الحل |
|--------|--------|------|
| 200 OK | نجح ✅ | لا مشكلة |
| 400 Bad Request | خطأ في البيانات | تحقق من participantId |
| 413 Payload Too Large | الملف كبير جداً | ضغط الملف |
| 504 Gateway Timeout | Backend بطيء جداً | انتظر وحاول مرة أخرى |
| (failed) net::ERR_CONNECTION_CLOSED | Backend نائم | أيقظ Backend |

---

## 🎯 الحل السريع (Quick Fix)

### للمستخدم العادي:

1. **افتح في تبويب جديد:**
   ```
   https://matc-backend.onrender.com/api/health
   ```

2. **انتظر 30-60 ثانية حتى يظهر الرد**

3. **ارجع للـ Admin Panel وحاول مرة أخرى**

4. **إذا استمرت المشكلة، تحقق من حجم الملف (< 5MB)**

---

## 🔧 الحل الدائم (للمطورين)

### الخيار 1: Upgrade Render Plan

**المشكلة:** Free Tier ينام بعد 15 دقيقة

**الحل:**
- Upgrade إلى Starter Plan ($7/month)
- Backend لن ينام أبداً
- استجابة فورية دائماً

**الرابط:** https://dashboard.render.com/web/matc-backend

---

### الخيار 2: Keep-Alive Service

**إنشاء خدمة تبقي Backend مستيقظاً:**

1. استخدم خدمة مثل:
   - UptimeRobot: https://uptimerobot.com
   - Cron-job.org: https://cron-job.org

2. أضف monitor يطلب:
   ```
   https://matc-backend.onrender.com/api/health
   ```
   كل 10 دقائق

**الفائدة:**
- Backend لن ينام
- مجاني
- سهل الإعداد

---

### الخيار 3: Cloudinary Direct Upload

**بدلاً من رفع عبر Backend:**

```typescript
// Upload directly to Cloudinary from frontend
const uploadToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'your_preset');
  
  const response = await fetch(
    'https://api.cloudinary.com/v1_1/your_cloud/upload',
    { method: 'POST', body: formData }
  );
  
  return response.json();
};
```

**الفائدة:**
- لا يعتمد على Backend
- أسرع
- لا مشاكل sleep

---

## 📊 مراقبة الأداء

### تتبع أوقات الاستجابة:

```javascript
// في attestationsApi.ts
async uploadPdf(file: File, participantId: string = 'temp'): Promise<string> {
  const startTime = Date.now();
  
  try {
    // ... upload code ...
    
    const duration = Date.now() - startTime;
    console.log(`Upload completed in ${duration}ms`);
    
    return data.url;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Upload failed after ${duration}ms`);
    throw error;
  }
}
```

**الأوقات الطبيعية:**
- Backend مستيقظ: 2-5 ثوان
- Backend نائم: 30-60 ثانية
- إذا > 60 ثانية: مشكلة

---

## 🎉 الخلاصة

### المشكلة الرئيسية:
**Render Free Tier ينام بعد 15 دقيقة**

### الحل الفوري:
1. أيقظ Backend بفتح `/api/health`
2. انتظر 30-60 ثانية
3. حاول مرة أخرى

### الحل الدائم:
- Upgrade Render Plan ($7/month)
- أو استخدم Keep-Alive Service (مجاني)
- أو Upload مباشرة إلى Cloudinary

### التحديثات المطبقة:
- ✅ Timeout زاد إلى 2 دقيقة
- ✅ رسائل خطأ أوضح
- ✅ معالجة أفضل للأخطاء

---

**تاريخ الإنشاء:** 29 أكتوبر 2025  
**آخر تحديث:** 29 أكتوبر 2025  
**الحالة:** جاهز للاستخدام
