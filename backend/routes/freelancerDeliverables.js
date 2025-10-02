import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import FreelancerDeliverable from '../models/FreelancerDeliverable.js';

const router = express.Router();

// إعداد Multer لرفع الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'deliverables');
    
    // إنشاء المجلد إذا لم يكن موجوداً
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // تسمية الملف: freelancerId_timestamp_originalname
    const freelancerId = req.body.freelancerId || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    cb(null, `${freelancerId}_${timestamp}_${name}${ext}`);
  }
});

// فلترة أنواع الملفات المسموحة
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'text/csv'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`نوع الملف غير مدعوم: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB حد أقصى
  }
});

// GET /api/freelancer-deliverables/freelancer/:freelancerId
// جلب جميع الـ Livrables لفريلانسر معين
router.get('/freelancer/:freelancerId', async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const { status, projectId, limit = 50, page = 1 } = req.query;

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
    
    if (projectId) {
      query.projectId = projectId;
    }

    // تطبيق الـ pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const deliverables = await FreelancerDeliverable.find(query)
      .sort({ submittedDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await FreelancerDeliverable.countDocuments(query);

    console.log(`📦 تم جلب ${deliverables.length} livrable للفريلانسر ${freelancerId}`);

    res.json({
      success: true,
      data: deliverables,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('خطأ في جلب الـ Livrables:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الخادم',
      error: error.message
    });
  }
});

// POST /api/freelancer-deliverables
// إنشاء livrable جديد
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const {
      title,
      description,
      freelancerId,
      projectId,
      projectTitle,
      type,
      dueDate,
      linkUrl,
      content
    } = req.body;

    // التحقق من البيانات المطلوبة
    if (!title || !description || !freelancerId || !projectId) {
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

    // إعداد بيانات الـ Livrable
    const deliverableData = {
      title: title.trim(),
      description: description.trim(),
      freelancerId,
      projectId,
      projectTitle: projectTitle || 'مشروع غير محدد',
      type: type || 'file',
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      content: content || ''
    };

    // معالجة الملف المرفوع
    if (req.file) {
      deliverableData.fileUrl = `/uploads/deliverables/${req.file.filename}`;
      deliverableData.fileName = req.file.originalname;
      deliverableData.fileSize = req.file.size;
      deliverableData.mimeType = req.file.mimetype;
    }

    // معالجة الرابط الخارجي
    if (linkUrl && linkUrl.trim()) {
      deliverableData.linkUrl = linkUrl.trim();
      deliverableData.type = 'link';
    }

    // إنشاء الـ Livrable
    const deliverable = new FreelancerDeliverable(deliverableData);
    await deliverable.save();

    console.log(`📦 تم إنشاء livrable جديد: ${deliverable._id} للفريلانسر ${freelancerId}`);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الـ Livrable بنجاح',
      data: deliverable
    });

  } catch (error) {
    console.error('خطأ في إنشاء الـ Livrable:', error);
    
    // حذف الملف في حالة الخطأ
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('خطأ في حذف الملف:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء الـ Livrable',
      error: error.message
    });
  }
});

// PUT /api/freelancer-deliverables/:id
// تحديث livrable موجود
router.put('/:id', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { freelancerId } = req.body;

    // البحث عن الـ Livrable
    const deliverable = await FreelancerDeliverable.findById(id);
    
    if (!deliverable) {
      return res.status(404).json({
        success: false,
        message: 'الـ Livrable غير موجود'
      });
    }

    // التحقق من ملكية الـ Livrable
    if (deliverable.freelancerId !== freelancerId) {
      return res.status(403).json({
        success: false,
        message: 'غير مسموح بتعديل هذا الـ Livrable'
      });
    }

    // تحديث البيانات
    const updateData = {};
    
    ['title', 'description', 'content', 'linkUrl'].forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field].trim();
      }
    });

    // معالجة الملف الجديد
    if (req.file) {
      // حذف الملف القديم
      if (deliverable.fileUrl) {
        const oldFilePath = path.join(process.cwd(), deliverable.fileUrl);
        try {
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        } catch (error) {
          console.error('خطأ في حذف الملف القديم:', error);
        }
      }

      updateData.fileUrl = `/uploads/deliverables/${req.file.filename}`;
      updateData.fileName = req.file.originalname;
      updateData.fileSize = req.file.size;
      updateData.mimeType = req.file.mimetype;
      updateData.status = 'pending'; // إعادة تعيين الحالة عند رفع ملف جديد
    }

    // تطبيق التحديثات
    Object.assign(deliverable, updateData);
    await deliverable.save();

    console.log(`📦 تم تحديث livrable: ${id} للفريلانسر ${freelancerId}`);

    res.json({
      success: true,
      message: 'تم تحديث الـ Livrable بنجاح',
      data: deliverable
    });

  } catch (error) {
    console.error('خطأ في تحديث الـ Livrable:', error);
    
    // حذف الملف في حالة الخطأ
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('خطأ في حذف الملف:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الـ Livrable',
      error: error.message
    });
  }
});

// PUT /api/freelancer-deliverables/:id/status
// تحديث حالة الـ Livrable (للمراجعين)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, rating, reviewedBy } = req.body;

    const deliverable = await FreelancerDeliverable.findById(id);
    
    if (!deliverable) {
      return res.status(404).json({
        success: false,
        message: 'الـ Livrable غير موجود'
      });
    }

    // تحديث الحالة
    deliverable.status = status;
    deliverable.feedback = feedback || '';
    deliverable.rating = rating || 0;
    deliverable.reviewedBy = reviewedBy || '';
    deliverable.reviewedAt = new Date();

    await deliverable.save();

    console.log(`📦 تم تحديث حالة livrable: ${id} إلى ${status}`);

    res.json({
      success: true,
      message: 'تم تحديث حالة الـ Livrable بنجاح',
      data: deliverable
    });

  } catch (error) {
    console.error('خطأ في تحديث حالة الـ Livrable:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث حالة الـ Livrable',
      error: error.message
    });
  }
});

// DELETE /api/freelancer-deliverables/:id
// حذف livrable
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { freelancerId } = req.query;

    const deliverable = await FreelancerDeliverable.findById(id);
    
    if (!deliverable) {
      return res.status(404).json({
        success: false,
        message: 'الـ Livrable غير موجود'
      });
    }

    // التحقق من ملكية الـ Livrable
    if (deliverable.freelancerId !== freelancerId) {
      return res.status(403).json({
        success: false,
        message: 'غير مسموح بحذف هذا الـ Livrable'
      });
    }

    // حذف الملف المرتبط
    if (deliverable.fileUrl) {
      const filePath = path.join(process.cwd(), deliverable.fileUrl);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('خطأ في حذف الملف:', error);
      }
    }

    // حذف الـ Livrable من قاعدة البيانات
    await FreelancerDeliverable.findByIdAndDelete(id);

    console.log(`📦 تم حذف livrable: ${id} للفريلانسر ${freelancerId}`);

    res.json({
      success: true,
      message: 'تم حذف الـ Livrable بنجاح'
    });

  } catch (error) {
    console.error('خطأ في حذف الـ Livrable:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الـ Livrable',
      error: error.message
    });
  }
});

// GET /api/freelancer-deliverables/stats/:freelancerId
// إحصائيات الـ Livrables لفريلانسر
router.get('/stats/:freelancerId', async (req, res) => {
  try {
    const { freelancerId } = req.params;

    // التحقق من صحة معرف الفريلانسر
    if (!/^FRE-\d{6}$/.test(freelancerId)) {
      return res.status(400).json({
        success: false,
        message: 'معرف الفريلانسر غير صحيح'
      });
    }

    const stats = await FreelancerDeliverable.getStats(freelancerId);
    
    // تنسيق الإحصائيات
    const formattedStats = {
      total: 0,
      pending: 0,
      approved: 0,
      revision_requested: 0,
      rejected: 0,
      revision_needed: 0,
      averageRating: 0
    };

    stats.forEach(stat => {
      formattedStats.total += stat.count;
      formattedStats[stat._id] = stat.count;
      
      if (stat._id === 'approved' && stat.avgRating) {
        formattedStats.averageRating = Math.round(stat.avgRating * 10) / 10;
      }
    });

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('خطأ في جلب إحصائيات الـ Livrables:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإحصائيات',
      error: error.message
    });
  }
});

// GET /api/freelancer-deliverables/download/:id
// تحميل ملف livrable
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { freelancerId } = req.query;

    const deliverable = await FreelancerDeliverable.findById(id);
    
    if (!deliverable) {
      return res.status(404).json({
        success: false,
        message: 'الـ Livrable غير موجود'
      });
    }

    // التحقق من ملكية الـ Livrable أو صلاحية الوصول
    if (deliverable.freelancerId !== freelancerId) {
      return res.status(403).json({
        success: false,
        message: 'غير مسموح بتحميل هذا الملف'
      });
    }

    if (!deliverable.fileUrl) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد ملف مرتبط بهذا الـ Livrable'
      });
    }

    const filePath = path.join(process.cwd(), deliverable.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'الملف غير موجود على الخادم'
      });
    }

    // إرسال الملف
    res.download(filePath, deliverable.fileName || 'download');

  } catch (error) {
    console.error('خطأ في تحميل الملف:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحميل الملف',
      error: error.message
    });
  }
});

export default router;
