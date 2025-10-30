# Fix: Cloudinary "Customer Untrusted" Error

## المشكلة
```json
{
  "error": {
    "message": "Customer is marked as untrusted",
    "code": "show_original_customer_untrusted"
  }
}
```

الملفات المرفوعة على Cloudinary محظورة بسبب وضع الحساب كـ "untrusted".

## الأسباب
1. حساب جديد غير مفعّل
2. تجاوز الحد المجاني
3. نشاط مشبوه (رفع ملفات كثيرة)
4. عدم التحقق من البريد الإلكتروني

## الحلول

### الحل 1: تفعيل الحساب على Cloudinary

#### الخطوات:
1. **افتح Cloudinary Dashboard**: https://console.cloudinary.com
2. **تحقق من البريد الإلكتروني**:
   - ابحث عن رسالة تأكيد من Cloudinary
   - اضغط على رابط التفعيل

3. **أضف معلومات الدفع** (حتى للحساب المجاني):
   - Settings → Account → Billing
   - أضف بطاقة ائتمان (لن يتم الخصم للحساب المجاني)
   - هذا يزيل علامة "untrusted"

4. **تواصل مع الدعم**:
   - افتح ticket على: https://support.cloudinary.com
   - اشرح أنك تستخدم الحساب لمشروع تعليمي
   - اطلب رفع علامة "untrusted"

### الحل 2: استخدام خدمة بديلة (مؤقت)

#### Google Drive:
```
1. رفع الملف على Google Drive
2. Right click → Share → Get link
3. تغيير الرابط من:
   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
   إلى:
   https://drive.google.com/uc?export=download&id=FILE_ID
```

#### Dropbox:
```
1. رفع الملف على Dropbox
2. Create link
3. تغيير dl=0 إلى dl=1 في نهاية الرابط
```

### الحل 3: استخدام ميزة URL الجديدة

بما أننا أضفنا خاصية URL input:

1. **في Admin Panel**:
   - اذهب إلى Attestations
   - اضغط "Ajouter une Attestation"
   - اختر زر "URL" بدلاً من "Upload"
   - الصق رابط الملف المباشر

2. **مثال**:
   ```
   Attestation URL: https://example.com/attestation.pdf
   Recommandation URL: https://example.com/recommandation.pdf
   Evaluation URL: https://example.com/evaluation.pdf
   ```

## الحل الموصى به

### للاستخدام الفوري:
✅ **استخدم Google Drive + ميزة URL**

### للحل الدائم:
✅ **أضف بطاقة ائتمان على Cloudinary** (حتى للحساب المجاني)

## خطوات سريعة (Google Drive):

```bash
# 1. رفع الملف على Google Drive
# 2. Share → Anyone with the link → Viewer
# 3. Copy link
# 4. تحويل الرابط:

# من:
https://drive.google.com/file/d/1ABC123XYZ/view?usp=sharing

# إلى:
https://drive.google.com/uc?export=download&id=1ABC123XYZ
```

## ملاحظات مهمة

- ✅ ميزة URL تعمل مع أي رابط مباشر للملف
- ✅ لا حاجة لـ Cloudinary إذا استخدمت URLs
- ⚠️ تأكد أن الرابط public وليس private
- ⚠️ الرابط يجب أن يكون direct link للملف (ينتهي بـ .pdf)

## التاريخ
30 أكتوبر 2025، 01:26 صباحاً
