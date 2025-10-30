# Fix: Attestation URL Validation Error

## المشكلة
```
Error: "attestationUrl" is not allowed
```

الـ Backend validation schema كان يرفض الحقول الجديدة `attestationUrl`, `recommandationUrl`, `evaluationUrl`.

## الحل

### تم تعديل `backend/routes/attestations.js`:

```javascript
const attestationSchema = Joi.object({
  fullName: Joi.string().required().trim().min(2).max(100),
  programId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
  dateObtention: Joi.date().optional(),
  note: Joi.number().required().min(0).max(20),
  niveau: Joi.string().required().valid('Débutant', 'Intermédiaire', 'Avancé'),
  skills: Joi.array().items(Joi.string().trim()).optional(),
  techniques: Joi.array().items(Joi.string().trim()).optional(),
  // ✅ إضافة URL fields
  attestationUrl: Joi.string().uri().optional().allow(''),
  recommandationUrl: Joi.string().uri().optional().allow(''),
  evaluationUrl: Joi.string().uri().optional().allow('')
});
```

## الخطوات المنفذة

1. ✅ تعديل validation schema لقبول URL fields
2. ✅ Commit: `fix: Add URL fields to validation schema`
3. ✅ Push على GitHub
4. 🔄 Render سيعيد deploy الـ Backend تلقائياً (يأخذ 2-3 دقائق)

## التحقق من النجاح

بعد إعادة تشغيل Backend على Render:
1. افتح https://admine-lake-ten.vercel.app/attestations
2. حاول تعديل attestation مع URL
3. يجب أن يعمل بدون أخطاء

## الوقت المتوقع
- Backend deployment على Render: 2-3 دقائق
- بعدها يمكن اختبار الميزة

## التاريخ
- 30 أكتوبر 2025، 01:12 صباحاً
