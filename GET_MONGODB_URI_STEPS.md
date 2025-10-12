# 🔗 كيفية الحصول على MongoDB URI الصحيح

## 📋 الخطوات التفصيلية:

### **الخطوة 1: اذهب إلى MongoDB Atlas**
- افتح: https://cloud.mongodb.com
- سجل دخول بحسابك

### **الخطوة 2: اختر Cluster**
- اضغط على cluster الخاص بك
- اضغط "Connect"

### **الخطوة 3: اختر طريقة الاتصال**
- اختر "Connect your application"
- Driver: Node.js
- Version: 5.5 or later

### **الخطوة 4: انسخ Connection String**
ستحصل على شيء مثل:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### **الخطوة 5: استبدل المتغيرات**
```
mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/matc?retryWrites=true&w=majority
```

## 🔧 **مثال كامل:**

إذا كان:
- Username: `matcuser`
- Password: `MySecurePass123`
- Cluster: `cluster0.abc123.mongodb.net`
- Database: `matc`

فالنتيجة:
```
mongodb+srv://matcuser:MySecurePass123@cluster0.abc123.mongodb.net/matc?retryWrites=true&w=majority
```

## ⚠️ **تحذيرات مهمة:**

### **1. إذا كانت كلمة المرور تحتوي على رموز خاصة:**
| الرمز الأصلي | URL Encoded |
|--------------|-------------|
| @            | %40         |
| :            | %3A         |
| /            | %2F         |
| ?            | %3F         |
| #            | %23         |
| %            | %25         |

**مثال:**
- Password: `MyPass@123`
- في URI: `MyPass%40123`

### **2. تأكد من Network Access:**
- اذهب إلى "Network Access" في MongoDB Atlas
- أضف IP Address: `0.0.0.0/0` (Allow access from anywhere)

### **3. تأكد من Database Access:**
- اذهب إلى "Database Access"
- تأكد من وجود user مع permissions صحيحة

## 🧪 **اختبار الاتصال محلياً:**

أنشئ ملف `.env` في المجلد الرئيسي:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/matc?retryWrites=true&w=majority
NODE_ENV=development
PORT=3001
```

ثم اختبر:
```bash
node test-mongodb-connection.js
```

## 🎯 **النتيجة المطلوبة:**
```
✅ نجح الاتصال بـ MongoDB!
📊 حالة الاتصال: 1
🏷️  اسم قاعدة البيانات: matc
```

---

**💡 نصيحة:** إذا لم يكن عندك MongoDB Atlas account، يمكنني مساعدتك في إنشاء واحد مجاني!
