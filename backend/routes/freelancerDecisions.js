import express from 'express';
import FreelancerDecision from '../models/FreelancerDecision.js';

const router = express.Router();

// GET /api/freelancer-decisions/:freelancerId
// جلب جميع القرارات للفريلانسر
router.get('/:freelancerId', async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const { status, limit = 50, page = 1 } = req.query;

    // التحقق من صحة معرف الفريلانسر
    if (!/^FRE-\d{6}$/.test(freelancerId)) {
      return res.status(400).json({
        success: false,
        message: 'معرف الفريلانسر غير صحيح'
      });
    }

    // بناء الاستعلام
    let query = { freelancerId };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    // تطبيق الـ pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const decisions = await FreelancerDecision.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await FreelancerDecision.countDocuments(query);

    console.log(`📋 تم جلب ${decisions.length} قرار للفريلانسر ${freelancerId}`);

    res.json({
      success: true,
      data: decisions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('خطأ في جلب القرارات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: error.message
    });
  }
});

// POST /api/freelancer-decisions
// إنشاء قرار جديد (من Admin Panel)
router.post('/', async (req, res) => {
  try {
    const {
      freelancerId,
      freelancerName,
      deliverableTitle,
      decision,
      observation,
      adminId
    } = req.body;

    // التحقق من البيانات المطلوبة
    if (!freelancerId || !deliverableTitle || !decision) {
      return res.status(400).json({
        success: false,
        message: 'البيانات المطلوبة مفقودة'
      });
    }

    // التحقق من صحة معرف الفريلانسر
    if (!/^FRE-\d{6}$/.test(freelancerId)) {
      return res.status(400).json({
        success: false,
        message: 'معرف الفريلانسر غير صحيح'
      });
    }

    // إنشاء القرار
    const decisionData = {
      freelancerId,
      freelancerName: freelancerName || 'Unknown',
      deliverableTitle: deliverableTitle.trim(),
      decision: decision, // 'approved' or 'rejected'
      observation: observation ? observation.trim() : '',
      adminId: adminId || 'admin',
      status: 'sent',
      readAt: null
    };

    const newDecision = new FreelancerDecision(decisionData);
    await newDecision.save();

    console.log(`📋 تم إنشاء قرار جديد: ${newDecision._id} للفريلانسر ${freelancerId}`);

    res.status(201).json({
      success: true,
      message: 'تم إرسال القرار بنجاح',
      data: newDecision
    });

  } catch (error) {
    console.error('خطأ في إنشاء القرار:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إرسال القرار',
      error: error.message
    });
  }
});

// PUT /api/freelancer-decisions/:id/read
// تحديد القرار كمقروء
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { freelancerId } = req.body;

    const decision = await FreelancerDecision.findById(id);
    
    if (!decision) {
      return res.status(404).json({
        success: false,
        message: 'القرار غير موجود'
      });
    }

    // التحقق من ملكية القرار
    if (decision.freelancerId !== freelancerId) {
      return res.status(403).json({
        success: false,
        message: 'غير مسموح بالوصول لهذا القرار'
      });
    }

    // تحديث حالة القراءة
    decision.status = 'read';
    decision.readAt = new Date();
    await decision.save();

    console.log(`📖 تم تحديد القرار ${id} كمقروء للفريلانسر ${freelancerId}`);

    res.json({
      success: true,
      message: 'تم تحديد القرار كمقروء',
      data: decision
    });

  } catch (error) {
    console.error('خطأ في تحديث القرار:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث القرار',
      error: error.message
    });
  }
});

// GET /api/freelancer-decisions/:freelancerId/stats
// إحصائيات القرارات للفريلانسر
router.get('/:freelancerId/stats', async (req, res) => {
  try {
    const { freelancerId } = req.params;

    // التحقق من صحة معرف الفريلانسر
    if (!/^FRE-\d{6}$/.test(freelancerId)) {
      return res.status(400).json({
        success: false,
        message: 'معرف الفريلانسر غير صحيح'
      });
    }

    const stats = await FreelancerDecision.aggregate([
      { $match: { freelancerId } },
      {
        $group: {
          _id: '$decision',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = await FreelancerDecision.aggregate([
      { $match: { freelancerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // تنسيق الإحصائيات
    const formattedStats = {
      total: 0,
      approved: 0,
      rejected: 0,
      unread: 0,
      read: 0
    };

    stats.forEach(stat => {
      formattedStats.total += stat.count;
      formattedStats[stat._id] = stat.count;
    });

    statusStats.forEach(stat => {
      if (stat._id === 'sent') {
        formattedStats.unread = stat.count;
      } else if (stat._id === 'read') {
        formattedStats.read = stat.count;
      }
    });

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('خطأ في جلب إحصائيات القرارات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإحصائيات',
      error: error.message
    });
  }
});

// DELETE /api/freelancer-decisions/:id
// حذف قرار (للاختبار فقط)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { freelancerId } = req.query;

    const decision = await FreelancerDecision.findById(id);
    
    if (!decision) {
      return res.status(404).json({
        success: false,
        message: 'القرار غير موجود'
      });
    }

    // التحقق من ملكية القرار
    if (decision.freelancerId !== freelancerId) {
      return res.status(403).json({
        success: false,
        message: 'غير مسموح بحذف هذا القرار'
      });
    }

    await FreelancerDecision.findByIdAndDelete(id);

    console.log(`🗑️ تم حذف القرار ${id} للفريلانسر ${freelancerId}`);

    res.json({
      success: true,
      message: 'تم حذف القرار بنجاح'
    });

  } catch (error) {
    console.error('خطأ في حذف القرار:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف القرار',
      error: error.message
    });
  }
});

export default router;
