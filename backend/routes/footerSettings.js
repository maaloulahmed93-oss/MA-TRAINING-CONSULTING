import express from 'express';
import FooterSettings from '../models/FooterSettings.js';

const router = express.Router();

// GET /api/footer-settings - جلب إعدادات الفوتر النشطة
router.get('/', async (req, res) => {
  try {
    console.log('🔍 جلب إعدادات الفوتر...');
    
    let settings = await FooterSettings.getActiveSettings();
    
    // إذا لم توجد إعدادات، إنشاء الإعدادات الافتراضية
    if (!settings) {
      console.log('📝 إنشاء إعدادات افتراضية للفوتر...');
      settings = await FooterSettings.createDefaultSettings();
    }

    console.log('✅ تم جلب إعدادات الفوتر بنجاح');
    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('❌ خطأ في جلب إعدادات الفوتر:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إعدادات الفوتر',
      error: error.message
    });
  }
});

// PUT /api/footer-settings - تحديث إعدادات الفوتر
router.put('/', async (req, res) => {
  try {
    console.log('🔄 تحديث إعدادات الفوتر...');
    console.log('📝 البيانات المستلمة:', JSON.stringify(req.body, null, 2));

    const {
      contactInfo,
      faqLinks,
      socialLinks,
      companyInfo,
      updatedBy = 'admin'
    } = req.body;

    // التحقق من صحة البيانات الأساسية
    if (!contactInfo || !contactInfo.email || !contactInfo.phone || !contactInfo.address) {
      return res.status(400).json({
        success: false,
        message: 'معلومات الاتصال مطلوبة (email, phone, address)'
      });
    }

    // البحث عن الإعدادات النشطة الحالية
    let currentSettings = await FooterSettings.getActiveSettings();

    if (currentSettings) {
      // تحديث الإعدادات الموجودة
      currentSettings.contactInfo = contactInfo;
      currentSettings.faqLinks = faqLinks || [];
      currentSettings.socialLinks = socialLinks || [];
      currentSettings.companyInfo = companyInfo || currentSettings.companyInfo;
      currentSettings.updatedBy = updatedBy;
      currentSettings.updatedAt = new Date();

      await currentSettings.save();
      console.log('✅ تم تحديث الإعدادات الموجودة');
    } else {
      // إنشاء إعدادات جديدة
      currentSettings = new FooterSettings({
        contactInfo,
        faqLinks: faqLinks || [],
        socialLinks: socialLinks || [],
        companyInfo: companyInfo || {
          name: 'MA-TRAINING-CONSULTING',
          description: 'Votre partenaire stratégique pour la transformation digitale et le développement des compétences.'
        },
        updatedBy,
        isActive: true
      });

      await currentSettings.save();
      console.log('✅ تم إنشاء إعدادات جديدة');
    }

    res.json({
      success: true,
      message: 'تم تحديث إعدادات الفوتر بنجاح',
      data: currentSettings
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث إعدادات الفوتر:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث إعدادات الفوتر',
      error: error.message
    });
  }
});

// POST /api/footer-settings/reset - إعادة تعيين الإعدادات للقيم الافتراضية
router.post('/reset', async (req, res) => {
  try {
    console.log('🔄 إعادة تعيين إعدادات الفوتر للقيم الافتراضية...');

    // إلغاء تفعيل الإعدادات الحالية
    await FooterSettings.updateMany({}, { isActive: false });

    // إنشاء إعدادات افتراضية جديدة
    const defaultSettings = await FooterSettings.createDefaultSettings();

    console.log('✅ تم إعادة تعيين إعدادات الفوتر بنجاح');
    res.json({
      success: true,
      message: 'تم إعادة تعيين إعدادات الفوتر للقيم الافتراضية',
      data: defaultSettings
    });

  } catch (error) {
    console.error('❌ خطأ في إعادة تعيين إعدادات الفوتر:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إعادة تعيين إعدادات الفوتر',
      error: error.message
    });
  }
});

// GET /api/footer-settings/history - جلب تاريخ التحديثات
router.get('/history', async (req, res) => {
  try {
    console.log('📜 جلب تاريخ تحديثات الفوتر...');

    const history = await FooterSettings.find({})
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('updatedBy updatedAt isActive contactInfo.email');

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('❌ خطأ في جلب تاريخ التحديثات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب تاريخ التحديثات',
      error: error.message
    });
  }
});

// DELETE /api/footer-settings/:id - حذف إعدادات معينة (للإدارة فقط)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ حذف إعدادات الفوتر: ${id}`);

    const deletedSettings = await FooterSettings.findByIdAndDelete(id);

    if (!deletedSettings) {
      return res.status(404).json({
        success: false,
        message: 'الإعدادات غير موجودة'
      });
    }

    console.log('✅ تم حذف الإعدادات بنجاح');
    res.json({
      success: true,
      message: 'تم حذف الإعدادات بنجاح'
    });

  } catch (error) {
    console.error('❌ خطأ في حذف الإعدادات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الإعدادات',
      error: error.message
    });
  }
});

export default router;
