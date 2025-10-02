import express from 'express';
import FreelancerOffer from '../models/FreelancerOffer.js';
import FreelancerProject from '../models/FreelancerProject.js';
import Partner from '../models/Partner.js';

const router = express.Router();

// GET /api/freelancer-offers - جلب جميع العروض للـ Admin Panel
router.get('/', async (req, res) => {
  try {
    const { status, visibility, search } = req.query;
    
    // بناء فلتر البحث
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (visibility && visibility !== 'all') {
      filter.visibility = visibility;
    }
    
    // البحث النصي في العنوان والشركة والوصف
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const offers = await FreelancerOffer.find(filter)
      .sort({ updatedAt: -1 })
      .lean();
    
    res.json({
      success: true,
      data: offers,
      count: offers.length
    });
    
  } catch (error) {
    console.error('خطأ في جلب العروض:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب العروض',
      error: error.message
    });
  }
});

// GET /api/freelancer-offers/for-freelancer/:freelancerId - جلب العروض المرئية للفريلانسر
router.get('/for-freelancer/:freelancerId', async (req, res) => {
  try {
    const { freelancerId } = req.params;
    
    // التحقق من صحة ID الفريلانسر
    if (!/^FRE-\d{6}$/.test(freelancerId)) {
      return res.status(400).json({
        success: false,
        message: 'صيغة ID الفريلانسر غير صحيحة'
      });
    }
    
    // التحقق من وجود الفريلانسر وأنه نشط
    const freelancer = await Partner.findOne({
      partnerId: freelancerId,
      type: 'freelancer',
      isActive: true
    });
    
    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: 'الفريلانسر غير موجود أو غير نشط'
      });
    }
    
    // جلب العروض المرئية للفريلانسر
    const offers = await FreelancerOffer.getVisibleOffers(freelancerId);
    
    res.json({
      success: true,
      data: offers,
      count: offers.length,
      freelancer: {
        id: freelancer.partnerId,
        name: freelancer.fullName
      }
    });
    
  } catch (error) {
    console.error('خطأ في جلب عروض الفريلانسر:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب عروض الفريلانسر',
      error: error.message
    });
  }
});

// POST /api/freelancer-offers - إنشاء عرض جديد
router.post('/', async (req, res) => {
  try {
    const offerData = req.body;
    
    // التحقق من الحقول المطلوبة
    if (!offerData.title || !offerData.company || !offerData.description || !offerData.contractType) {
      return res.status(400).json({
        success: false,
        message: 'الحقول المطلوبة مفقودة: العنوان، الشركة، الوصف، نوع العقد'
      });
    }
    
    // التحقق من صحة الـ visibility
    if (!['all', 'assigned'].includes(offerData.visibility)) {
      return res.status(400).json({
        success: false,
        message: 'نوع الرؤية يجب أن يكون all أو assigned'
      });
    }
    
    // إذا كان assigned، التحقق من وجود assignedFreelancerIds
    if (offerData.visibility === 'assigned') {
      if (!offerData.assignedFreelancerIds || offerData.assignedFreelancerIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'يجب تحديد IDs الفريلانسرز عند اختيار assigned'
        });
      }
      
      // التحقق من صحة وجود الفريلانسرز
      const validFreelancers = await Partner.find({
        partnerId: { $in: offerData.assignedFreelancerIds },
        type: 'freelancer',
        isActive: true
      }).select('partnerId fullName');
      
      const validIds = validFreelancers.map(f => f.partnerId);
      const invalidIds = offerData.assignedFreelancerIds.filter(id => !validIds.includes(id));
      
      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: `IDs الفريلانسرز التالية غير صحيحة أو غير نشطة: ${invalidIds.join(', ')}`,
          validFreelancers: validFreelancers.map(f => ({ id: f.partnerId, name: f.fullName }))
        });
      }
      
      // تحديث القائمة بالـ IDs الصحيحة فقط
      offerData.assignedFreelancerIds = validIds;
    }
    
    // إنشاء العرض الجديد
    const offer = new FreelancerOffer(offerData);
    await offer.save();
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء العرض بنجاح',
      data: offer
    });
    
  } catch (error) {
    console.error('خطأ في إنشاء العرض:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء العرض',
      error: error.message
    });
  }
});

// PUT /api/freelancer-offers/:id - تحديث عرض موجود
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // العثور على العرض
    const offer = await FreelancerOffer.findById(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'العرض غير موجود'
      });
    }
    
    // التحقق من الـ visibility إذا تم تغييرها
    if (updateData.visibility === 'assigned' && updateData.assignedFreelancerIds) {
      const validFreelancers = await Partner.find({
        partnerId: { $in: updateData.assignedFreelancerIds },
        type: 'freelancer',
        isActive: true
      }).select('partnerId');
      
      updateData.assignedFreelancerIds = validFreelancers.map(f => f.partnerId);
    }
    
    // تحديث العرض
    const updatedOffer = await FreelancerOffer.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'تم تحديث العرض بنجاح',
      data: updatedOffer
    });
    
  } catch (error) {
    console.error('خطأ في تحديث العرض:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث العرض',
      error: error.message
    });
  }
});

// DELETE /api/freelancer-offers/:id - حذف عرض
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedOffer = await FreelancerOffer.findByIdAndDelete(id);
    
    if (!deletedOffer) {
      return res.status(404).json({
        success: false,
        message: 'العرض غير موجود'
      });
    }
    
    res.json({
      success: true,
      message: 'تم حذف العرض بنجاح',
      data: deletedOffer
    });
    
  } catch (error) {
    console.error('خطأ في حذف العرض:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف العرض',
      error: error.message
    });
  }
});

// GET /api/freelancer-offers/stats - إحصائيات العروض
router.get('/stats', async (req, res) => {
  try {
    const totalOffers = await FreelancerOffer.countDocuments();
    const publishedOffers = await FreelancerOffer.countDocuments({ status: 'published' });
    const draftOffers = await FreelancerOffer.countDocuments({ status: 'draft' });
    const archivedOffers = await FreelancerOffer.countDocuments({ status: 'archived' });
    const allVisibilityOffers = await FreelancerOffer.countDocuments({ visibility: 'all' });
    const assignedVisibilityOffers = await FreelancerOffer.countDocuments({ visibility: 'assigned' });
    
    res.json({
      success: true,
      data: {
        total: totalOffers,
        published: publishedOffers,
        draft: draftOffers,
        archived: archivedOffers,
        allVisibility: allVisibilityOffers,
        assignedVisibility: assignedVisibilityOffers
      }
    });
    
  } catch (error) {
    console.error('خطأ في جلب إحصائيات العروض:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات العروض',
      error: error.message
    });
  }
});

// GET /api/freelancer-offers/available-freelancers - جلب قائمة الفريلانسرز المتاحين
router.get('/available-freelancers', async (req, res) => {
  try {
    const freelancers = await Partner.find({
      type: 'freelancer',
      isActive: true
    }).select('partnerId fullName email').sort({ fullName: 1 });
    
    res.json({
      success: true,
      data: freelancers.map(f => ({
        id: f.partnerId,
        name: f.fullName,
        email: f.email
      }))
    });
    
  } catch (error) {
    console.error('خطأ في جلب قائمة الفريلانسرز:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب قائمة الفريلانسرز',
      error: error.message
    });
  }
});

// POST /api/freelancer-offers/:id/accept - قبول عرض من قبل فريلانسر
router.post('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const { freelancerId } = req.body;
    
    // التحقق من وجود العرض
    const offer = await FreelancerOffer.findById(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'العرض غير موجود'
      });
    }
    
    // التحقق من أن الفريلانسر مخول لرؤية هذا العرض
    const canView = offer.isVisibleToFreelancer(freelancerId);
    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'غير مخول للوصول لهذا العرض'
      });
    }
    
    // تحديث حالة العرض إلى مقبول
    offer.status = 'accepted';
    offer.acceptedBy = freelancerId;
    offer.acceptedAt = new Date();
    await offer.save();
    
    // إنشاء مشروع جديد من العرض المقبول
    const newProject = new FreelancerProject({
      title: offer.title,
      description: offer.description,
      client: offer.company,
      freelancerId: freelancerId,
      status: 'in_progress',
      startDate: new Date(),
      endDate: offer.deadline,
      deadline: offer.deadline,
      budget: offer.salaryMax || offer.salaryMin || 0,
      currency: offer.currency || 'TND',
      workMode: offer.locationType || 'remote',
      estimatedHours: calculateEstimatedHours(offer.contractType),
      priority: determinePriority(offer.tags || []),
      skills: offer.skills || [],
      requirements: offer.requirements || [],
      originalOfferId: offer._id,
      notes: `مشروع تم إنشاؤه من العرض: ${offer.title}`
    });
    
    await newProject.save();
    
    console.log(`✅ تم قبول العرض ${offer.title} من قبل ${freelancerId} وإنشاء المشروع ${newProject._id}`);
    
    res.json({
      success: true,
      message: 'تم قبول العرض بنجاح وإنشاء المشروع',
      data: {
        offerId: offer._id,
        projectId: newProject._id,
        freelancerId,
        acceptedAt: new Date(),
        projectCreated: true
      }
    });
    
  } catch (error) {
    console.error('خطأ في قبول العرض:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في قبول العرض',
      error: error.message
    });
  }
});

// POST /api/freelancer-offers/:id/reject - رفض عرض من قبل فريلانسر
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { freelancerId, reason } = req.body;
    
    // التحقق من وجود العرض
    const offer = await FreelancerOffer.findById(id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'العرض غير موجود'
      });
    }
    
    // التحقق من أن الفريلانسر مخول لرؤية هذا العرض
    const canView = offer.isVisibleToFreelancer(freelancerId);
    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'غير مخول للوصول لهذا العرض'
      });
    }
    
    // تحديث حالة العرض إلى مرفوض
    offer.status = 'rejected';
    offer.rejectedBy = freelancerId;
    offer.rejectedAt = new Date();
    offer.rejectionReason = reason || 'لم يتم تحديد السبب';
    await offer.save();
    
    console.log(`❌ تم رفض العرض ${offer.title} من قبل ${freelancerId}`);
    
    res.json({
      success: true,
      message: 'تم رفض العرض وإزالته من قائمة العروض المتاحة',
      data: {
        offerId: offer._id,
        freelancerId,
        rejectedAt: new Date(),
        reason: reason || 'لم يتم تحديد السبب'
      }
    });
    
  } catch (error) {
    console.error('خطأ في رفض العرض:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في رفض العرض',
      error: error.message
    });
  }
});

// GET /api/freelancer-offers/stats/:freelancerId - إحصائيات العروض للفريلانسر
router.get('/stats/:freelancerId', async (req, res) => {
  try {
    const { freelancerId } = req.params;
    
    // التحقق من وجود الفريلانسر
    const freelancer = await Partner.findOne({
      partnerId: freelancerId,
      type: 'freelancer',
      isActive: true
    });
    
    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: 'الفريلانسر غير موجود'
      });
    }
    
    // حساب الإحصائيات
    const totalOffers = await FreelancerOffer.countDocuments({
      $or: [
        { visibility: 'all', status: 'published' },
        { 
          visibility: 'assigned', 
          assignedFreelancerIds: { $in: [freelancerId] },
          status: 'published'
        }
      ]
    });
    
    // هنا يمكن إضافة إحصائيات أكثر تفصيلاً من جداول منفصلة
    const stats = {
      total: totalOffers,
      pending: totalOffers, // مؤقتاً، يمكن تحسينها لاحقاً
      accepted: 0, // يحتاج جدول منفصل للتتبع
      rejected: 0  // يحتاج جدول منفصل للتتبع
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('خطأ في جلب إحصائيات العروض:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات العروض',
      error: error.message
    });
  }
});

// دوال مساعدة
function calculateEstimatedHours(contractType) {
  switch (contractType) {
    case 'full-time':
      return 160; // 40 ساعة × 4 أسابيع
    case 'part-time':
      return 80;  // 20 ساعة × 4 أسابيع
    case 'contract':
      return 60;  // مشروع قصير المدى
    case 'internship':
      return 120; // تدريب
    default:
      return 40;
  }
}

function determinePriority(tags = []) {
  const urgentTags = ['urgent', 'asap', 'priority', 'rush'];
  const highValueTags = ['senior', 'lead', 'architect', 'expert'];
  
  if (tags.some(tag => urgentTags.includes(tag.toLowerCase()))) {
    return 'high';
  }
  
  if (tags.some(tag => highValueTags.includes(tag.toLowerCase()))) {
    return 'high';
  }
  
  return 'medium';
}

export default router;
