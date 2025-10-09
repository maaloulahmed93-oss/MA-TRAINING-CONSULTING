import express from 'express';
import PartnerTestimonial from '../models/PartnerTestimonial.js';

const router = express.Router();

// GET /api/partner-testimonials - جلب جميع التيمونيالز (للـ Admin Panel)
router.get('/', async (req, res) => {
  try {
    const { published, limit, skip } = req.query;
    
    // بناء الفلتر
    let filter = {};
    if (published !== undefined) {
      filter.isPublished = published === 'true';
    }
    
    // جلب البيانات مع ترتيب
    const testimonials = await PartnerTestimonial
      .find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(parseInt(limit) || 50)
      .skip(parseInt(skip) || 0);
    
    res.json({
      success: true,
      data: testimonials,
      count: testimonials.length
    });
    
  } catch (error) {
    console.error('Error fetching partner testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التيمونيالز',
      error: error.message
    });
  }
});

// GET /api/partner-testimonials/published - جلب التيمونيالز المنشورة (للموقع الرئيسي)
router.get('/published', async (req, res) => {
  try {
    const testimonials = await PartnerTestimonial
      .find({ isPublished: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(20);
    
    // تحويل إلى format الموقع الرئيسي
    const websiteFormat = testimonials.map(testimonial => testimonial.toWebsiteFormat());
    
    res.json({
      success: true,
      data: websiteFormat,
      count: websiteFormat.length
    });
    
  } catch (error) {
    console.error('Error fetching published testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التيمونيالز المنشورة',
      error: error.message
    });
  }
});

// GET /api/partner-testimonials/:id - جلب تيمونيال محدد
router.get('/:id', async (req, res) => {
  try {
    const testimonial = await PartnerTestimonial.findById(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'التيمونيال غير موجود'
      });
    }
    
    res.json({
      success: true,
      data: testimonial
    });
    
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التيمونيال',
      error: error.message
    });
  }
});

// POST /api/partner-testimonials - إنشاء تيمونيال جديد
router.post('/', async (req, res) => {
  try {
    const testimonialData = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!testimonialData.companyName || !testimonialData.position || !testimonialData.testimonialText) {
      return res.status(400).json({
        success: false,
        message: 'البيانات المطلوبة مفقودة: companyName, position, testimonialText'
      });
    }
    
    // إنشاء الأحرف الأولى تلقائياً إذا لم تُحدد
    if (!testimonialData.initials) {
      const words = testimonialData.companyName.split(' ');
      testimonialData.initials = words.map(word => word.charAt(0)).join('').substring(0, 3).toUpperCase();
    }
    
    // إنشاء التيمونيال
    const testimonial = new PartnerTestimonial(testimonialData);
    await testimonial.save();
    
    console.log(`✅ New testimonial created: ${testimonial.companyName}`);
    
    res.status(201).json({
      success: true,
      data: testimonial,
      message: 'تم إنشاء التيمونيال بنجاح'
    });
    
  } catch (error) {
    console.error('Error creating testimonial:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'التيمونيال موجود مسبقاً'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء التيمونيال',
      error: error.message
    });
  }
});

// PUT /api/partner-testimonials/:id - تحديث تيمونيال
router.put('/:id', async (req, res) => {
  try {
    const testimonial = await PartnerTestimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'التيمونيال غير موجود'
      });
    }
    
    console.log(`✅ Testimonial updated: ${testimonial.companyName}`);
    
    res.json({
      success: true,
      data: testimonial,
      message: 'تم تحديث التيمونيال بنجاح'
    });
    
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث التيمونيال',
      error: error.message
    });
  }
});

// DELETE /api/partner-testimonials/:id - حذف تيمونيال
router.delete('/:id', async (req, res) => {
  try {
    const testimonial = await PartnerTestimonial.findByIdAndDelete(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'التيمونيال غير موجود'
      });
    }
    
    console.log(`✅ Testimonial deleted: ${testimonial.companyName}`);
    
    res.json({
      success: true,
      message: 'تم حذف التيمونيال بنجاح'
    });
    
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف التيمونيال',
      error: error.message
    });
  }
});

// PUT /api/partner-testimonials/:id/toggle-publish - تبديل حالة النشر
router.put('/:id/toggle-publish', async (req, res) => {
  try {
    const testimonial = await PartnerTestimonial.findById(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'التيمونيال غير موجود'
      });
    }
    
    testimonial.isPublished = !testimonial.isPublished;
    await testimonial.save();
    
    console.log(`✅ Testimonial publish status toggled: ${testimonial.companyName} - ${testimonial.isPublished ? 'Published' : 'Unpublished'}`);
    
    res.json({
      success: true,
      data: testimonial,
      message: `تم ${testimonial.isPublished ? 'نشر' : 'إلغاء نشر'} التيمونيال`
    });
    
  } catch (error) {
    console.error('Error toggling publish status:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تغيير حالة النشر',
      error: error.message
    });
  }
});

// GET /api/partner-testimonials/stats/summary - إحصائيات التيمونيالز
router.get('/stats/summary', async (req, res) => {
  try {
    const [
      totalCount,
      publishedCount,
      unpublishedCount,
      averageRating,
      recentCount
    ] = await Promise.all([
      PartnerTestimonial.countDocuments(),
      PartnerTestimonial.countDocuments({ isPublished: true }),
      PartnerTestimonial.countDocuments({ isPublished: false }),
      PartnerTestimonial.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]),
      PartnerTestimonial.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);
    
    const stats = {
      total: totalCount,
      published: publishedCount,
      unpublished: unpublishedCount,
      averageRating: averageRating[0]?.avgRating || 0,
      recentlyAdded: recentCount
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Error fetching testimonials stats:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإحصائيات',
      error: error.message
    });
  }
});

// POST /api/partner-testimonials/reset - إعادة تعيين البيانات الافتراضية
router.post('/reset', async (req, res) => {
  try {
    // حذف جميع التيمونيالز الموجودة
    await PartnerTestimonial.deleteMany({});
    
    // إنشاء البيانات الافتراضية
    await PartnerTestimonial.createDefaults();
    
    // جلب البيانات الجديدة
    const testimonials = await PartnerTestimonial.find().sort({ displayOrder: 1 });
    
    console.log('✅ Partner testimonials reset to defaults');
    
    res.json({
      success: true,
      data: testimonials,
      message: 'تم إعادة تعيين التيمونيالز بنجاح'
    });
    
  } catch (error) {
    console.error('Error resetting testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إعادة التعيين',
      error: error.message
    });
  }
});

export default router;
