# 🔍 أوامر cURL للفحص السريع - MATC Backend

## 📋 أوامر الفحص الأساسية

### 1. فحص صحة Backend
```bash
curl -i https://matc-backend.onrender.com/api/health
```

**النتيجة المتوقعة:**
```
HTTP/2 200 
content-type: application/json
access-control-allow-origin: *
access-control-allow-credentials: true

{"success":true,"message":"API is running","timestamp":"2025-10-12T...","environment":"production","database":"connected"}
```

### 2. فحص Programs Endpoint
```bash
curl -i https://matc-backend.onrender.com/api/programs
```

**النتيجة المتوقعة:**
```
HTTP/2 200 
content-type: application/json
access-control-allow-origin: *

{"success":true,"data":[...],"count":X}
```

### 3. فحص CORS Preflight للـ Admin Panel
```bash
curl -i -X OPTIONS https://matc-backend.onrender.com/api/programs \
  -H "Origin: https://admine-lake.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type"
```

**النتيجة المتوقعة:**
```
HTTP/2 200 
access-control-allow-origin: https://admine-lake.vercel.app
access-control-allow-methods: GET,POST,PUT,DELETE,OPTIONS
access-control-allow-headers: Content-Type,Authorization
access-control-allow-credentials: true
```

### 4. فحص CORS Preflight للـ Frontend
```bash
curl -i -X OPTIONS https://matc-backend.onrender.com/api/programs \
  -H "Origin: https://matrainingconsulting.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type"
```

### 5. فحص GET Request مع Origin Header
```bash
curl -i -H "Origin: https://admine-lake.vercel.app" \
  https://matc-backend.onrender.com/api/health
```

### 6. فحص POST Request (إذا كان مطلوب)
```bash
curl -i -X POST https://matc-backend.onrender.com/api/programs \
  -H "Origin: https://admine-lake.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 🚨 علامات المشاكل الشائعة

### ❌ مشكلة CORS
```
HTTP/2 403 
access-control-allow-origin: null
```
**الحل:** أضف domain في backend CORS configuration

### ❌ Backend معطل
```
curl: (7) Failed to connect to matc-backend.onrender.com port 443
```
**الحل:** تحقق من حالة Render deployment

### ❌ Database غير متصل
```
HTTP/2 500
{"success":false,"message":"Database connection failed"}
```
**الحل:** تحقق من MongoDB Atlas connection

### ❌ Environment Variables مفقودة
```
HTTP/2 500
{"success":false,"message":"MONGODB_URI is required"}
```
**الحل:** أضف environment variables في Render

## 🔧 أوامر التشخيص المتقدمة

### فحص SSL Certificate
```bash
curl -I https://matc-backend.onrender.com
```

### فحص Response Time
```bash
curl -w "@curl-format.txt" -o /dev/null -s https://matc-backend.onrender.com/api/health
```

**إنشاء ملف curl-format.txt:**
```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

### فحص جميع Headers
```bash
curl -v https://matc-backend.onrender.com/api/health 2>&1 | grep -E '^[<>]'
```

## 📊 تفسير النتائج

### ✅ نتائج صحيحة:
- **HTTP Status:** 200
- **Content-Type:** application/json
- **CORS Headers:** موجودة وصحيحة
- **Response Body:** JSON صحيح

### ❌ نتائج خاطئة:
- **HTTP Status:** 4xx أو 5xx
- **CORS Headers:** مفقودة أو خاطئة
- **Response Body:** خطأ أو فارغ

## 🎯 نصائح للاستخدام

1. **شغل الأوامر بالترتيب** لتشخيص المشاكل تدريجياً
2. **احفظ النتائج** في ملف للمراجعة:
   ```bash
   curl -i https://matc-backend.onrender.com/api/health > health-test.txt
   ```
3. **استخدم -v للتفاصيل** عند وجود مشاكل:
   ```bash
   curl -v https://matc-backend.onrender.com/api/health
   ```
4. **اختبر من أماكن مختلفة** للتأكد من عدم وجود مشاكل شبكة محلية

## 🔄 أوامر الإصلاح السريع

إذا كانت هناك مشاكل، جرب هذه الأوامر:

### إعادة تشغيل Render Service
```bash
# لا يمكن عمله من cURL - يجب الدخول على Render Dashboard
# Manual Redeploy من Render Console
```

### فحص MongoDB Atlas
```bash
# لا يمكن فحصه مباشرة - يجب التحقق من:
# 1. IP Whitelist في MongoDB Atlas
# 2. Database User permissions
# 3. Connection string في Render Environment Variables
```

---

**💡 نصيحة:** شغل هذه الأوامر بعد كل deployment للتأكد من أن كل شيء يعمل صحيح!
