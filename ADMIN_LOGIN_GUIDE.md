# 🔐 دليل تسجيل الدخول - Admin Panel

## 📋 نظرة عامة

نظام تسجيل الدخول للوحة التحكم (Admin Panel) جاهز ويعمل بشكل كامل!

---

## 🔗 الوصول لصفحة Login

### URL:
```
https://admine-lake-ten.vercel.app/login
```

أو

```
https://admine-lake-ten.vercel.app/
```

سيتم توجيهك تلقائياً لصفحة Login إذا لم تكن مسجل دخول.

---

## 👤 بيانات تسجيل الدخول

### الحساب الافتراضي (Demo):

```
Email: admin@matc.com
Mot de passe: admin123
```

---

## 🎯 كيفية تسجيل الدخول

### الخطوات:

1. **افتح الرابط**: https://admine-lake-ten.vercel.app/login

2. **أدخل البيانات**:
   - Email: `admin@matc.com`
   - Mot de passe: `admin123`

3. **اضغط** "Se connecter"

4. **سيتم توجيهك** إلى Dashboard

---

## 📊 الميزات

### ✅ صفحة Login تحتوي على:

1. **حقل Email**
   - تحقق تلقائي من صيغة البريد الإلكتروني
   - Placeholder: `admin@matc.com`

2. **حقل كلمة المرور**
   - إظهار/إخفاء كلمة المرور (👁️)
   - Placeholder: `••••••••`

3. **رسائل الخطأ**
   - تظهر إذا كانت البيانات خاطئة
   - "Email ou mot de passe incorrect"

4. **بيانات التجربة**
   - صندوق أزرق يعرض بيانات الدخول للتجربة

5. **حالة التحميل**
   - Spinner أثناء التحقق من البيانات
   - "Connexion..."

---

## 🔒 الحماية

### Protected Routes:

جميع صفحات Admin Panel محمية:
- ✅ Dashboard
- ✅ Programmes
- ✅ Utilisateurs
- ✅ Events
- ✅ ... إلخ

**إذا لم تكن مسجل دخول**:
→ سيتم توجيهك تلقائياً لصفحة Login

---

## 💾 الجلسة (Session)

### التخزين:
- يتم حفظ بيانات المستخدم في `localStorage`
- المفتاح: `admin_user`

### استمرارية الجلسة:
- ✅ تبقى مسجل دخول حتى بعد إغلاق المتصفح
- ✅ تسجيل الخروج يحذف الجلسة تماماً

### تسجيل الخروج:
1. اضغط على أيقونة المستخدم (أعلى يمين)
2. اختر "Se déconnecter"
3. سيتم توجيهك لصفحة Login

---

## 🎨 التصميم

```
┌─────────────────────────────────────┐
│                                     │
│            ┌───┐                    │
│            │ M │  Logo              │
│            └───┘                    │
│                                     │
│   Panneau d'Administration          │
│   Connectez-vous à votre compte     │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ Adresse email               │  │
│   │ admin@matc.com              │  │
│   └─────────────────────────────┘  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ Mot de passe            👁️  │  │
│   │ ••••••••                    │  │
│   └─────────────────────────────┘  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │ ℹ️ Identifiants de démo:    │  │
│   │ Email: admin@matc.com       │  │
│   │ Mot de passe: admin123      │  │
│   └─────────────────────────────┘  │
│                                     │
│   ┌─────────────────────────────┐  │
│   │    🔒 Se connecter          │  │
│   └─────────────────────────────┘  │
│                                     │
│   © 2024 MATC. Tous droits...      │
└─────────────────────────────────────┘
```

---

## 🔧 الملفات

### 1. صفحة Login:
```
admin-panel/src/pages/LoginPage.tsx
```

### 2. Auth Context:
```
admin-panel/src/context/AuthContext.tsx
admin-panel/src/context/useAuth.ts
```

### 3. Protected Routes:
```
admin-panel/src/App.tsx
```

---

## 🧪 اختبار تسجيل الدخول

### سيناريو 1: تسجيل دخول صحيح ✅
```
Email: admin@matc.com
Password: admin123
→ النتيجة: توجيه إلى Dashboard
```

### سيناريو 2: بيانات خاطئة ❌
```
Email: wrong@email.com
Password: wrongpass
→ النتيجة: رسالة خطأ "Email ou mot de passe incorrect"
```

### سيناريو 3: محاولة الوصول بدون تسجيل دخول ❌
```
URL: /dashboard
→ النتيجة: توجيه تلقائي إلى /login
```

---

## 👥 إضافة مستخدمين جدد

### من صفحة "Gestion des Utilisateurs":

1. اذهب إلى: `/users`
2. اضغط "+ Nouvel Utilisateur"
3. املأ البيانات:
   - Nom Complet
   - Email
   - Mot de passe
   - Rôle (Administrateur / Modérateur)
4. اضغط "Créer Utilisateur"

**ملاحظة**: حالياً النظام يعمل بـ Mock Data (بيانات تجريبية).
للربط بـ Backend حقيقي، يجب تعديل:
- `AuthContext.tsx` (دالة `login`)
- `UsersPage.tsx` (إضافة API calls)

---

## 🔐 الأدوار (Roles)

### Administrateur:
- ✅ وصول كامل لجميع الصفحات
- ✅ إضافة/تعديل/حذف المستخدمين
- ✅ إدارة جميع المحتوى

### Modérateur:
- ✅ وصول للصفحات الأساسية
- ⚠️ صلاحيات محدودة (يمكن تخصيصها)

---

## 📱 متوافق مع الموبايل

- ✅ تصميم متجاوب (Responsive)
- ✅ يعمل على جميع الأجهزة
- ✅ تجربة مستخدم سلسة

---

## 🚀 الحالة الحالية

**Status**: ✅ جاهز للاستخدام

**الميزات المتوفرة**:
- ✅ صفحة Login
- ✅ نظام Authentication
- ✅ Protected Routes
- ✅ Session Management
- ✅ Logout
- ✅ صفحة إدارة المستخدمين

**الميزات القادمة** (تحتاج Backend):
- ⏳ ربط بـ API حقيقي
- ⏳ JWT Tokens
- ⏳ Password Reset
- ⏳ Two-Factor Authentication

---

## 📞 الدعم

إذا واجهت مشكلة:
1. تأكد من البيانات الصحيحة
2. امسح الـ cache
3. جرب في وضع Incognito
4. تحقق من Console للأخطاء

---

**تم إنشاؤه**: 31 أكتوبر 2025  
**الحالة**: ✅ جاهز ويعمل  
**URL**: https://admine-lake-ten.vercel.app/login
