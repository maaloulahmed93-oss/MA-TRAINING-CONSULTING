# إصلاح نشر الموقع الرئيسي على Vercel

## المشكلة الحالية:
الموقع https://matrainingconsulting.vercel.app يعرض لوحة الإدارة بدلاً من الموقع الرئيسي

## الحل:

### 1. تحديث إعدادات البناء في Vercel Dashboard:

**اذهب إلى:** Settings → Build and Deployment

**غيّر الإعدادات إلى:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Root Directory: `.` (المجلد الرئيسي)

### 2. تأكد من متغيرات البيئة:

**اذهب إلى:** Settings → Environment Variables

**أضف/تحقق من:**
```
VITE_API_BASE_URL = https://matc-backend.onrender.com/api
NODE_ENV = production
```

### 3. إعادة النشر:

**اذهب إلى:** Deployments → اضغط على "Redeploy"

## البنية الصحيحة:

```
📁 Repository Root/
├── src/ (الموقع الرئيسي)
├── dist/ (مخرجات البناء للموقع الرئيسي)
├── admin-panel/ (لوحة الإدارة منفصلة)
├── package.json (للموقع الرئيسي)
└── vercel.json (للموقع الرئيسي)
```

## النتيجة المتوقعة:
- https://matrainingconsulting.vercel.app → الموقع الرئيسي
- https://admine-lake.vercel.app → لوحة الإدارة
