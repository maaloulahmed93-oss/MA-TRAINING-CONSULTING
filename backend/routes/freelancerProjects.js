import express from 'express';
import FreelancerProject from '../models/FreelancerProject.js';
import Partner from '../models/Partner.js';

const router = express.Router();

// GET /api/freelancer-projects/for-freelancer/:freelancerId - جلب مشاريع الفريلانسر
router.get('/for-freelancer/:freelancerId', async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const { status } = req.query;
    
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
    
    // جلب مشاريع الفريلانسر
    const projects = await FreelancerProject.getFreelancerProjects(freelancerId, status);
    
    res.json({
      success: true,
      data: projects,
      count: projects.length,
      freelancer: {
        id: freelancer.partnerId,
        name: freelancer.fullName
      }
    });
    
  } catch (error) {
    console.error('خطأ في جلب مشاريع الفريلانسر:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب مشاريع الفريلانسر',
      error: error.message
    });
  }
});

// GET /api/freelancer-projects/:id - جلب تفاصيل مشروع محدد
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await FreelancerProject.findById(id)
      .populate('originalOfferId', 'title company description');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'المشروع غير موجود'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
    
  } catch (error) {
    console.error('خطأ في جلب تفاصيل المشروع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب تفاصيل المشروع',
      error: error.message
    });
  }
});

// PUT /api/freelancer-projects/:id - تحديث مشروع
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // العثور على المشروع
    const project = await FreelancerProject.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'المشروع غير موجود'
      });
    }
    
    // تحديث المشروع
    const updatedProject = await FreelancerProject.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'تم تحديث المشروع بنجاح',
      data: updatedProject
    });
    
  } catch (error) {
    console.error('خطأ في تحديث المشروع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث المشروع',
      error: error.message
    });
  }
});

// PUT /api/freelancer-projects/:id/progress - تحديث تقدم المشروع
router.put('/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, notes } = req.body;
    
    // التحقق من صحة قيمة التقدم
    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'قيمة التقدم يجب أن تكون بين 0 و 100'
      });
    }
    
    const project = await FreelancerProject.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'المشروع غير موجود'
      });
    }
    
    // تحديث التقدم
    project.progress = progress;
    if (notes) {
      project.notes = notes;
    }
    
    // تحديث الحالة تلقائياً بناءً على التقدم
    if (progress === 100) {
      project.status = 'completed';
    } else if (progress > 0 && project.status === 'planning') {
      project.status = 'in_progress';
    }
    
    await project.save();
    
    res.json({
      success: true,
      message: 'تم تحديث تقدم المشروع بنجاح',
      data: project
    });
    
  } catch (error) {
    console.error('خطأ في تحديث تقدم المشروع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث تقدم المشروع',
      error: error.message
    });
  }
});

// GET /api/freelancer-projects/stats/:freelancerId - إحصائيات مشاريع الفريلانسر
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
    const totalProjects = await FreelancerProject.countDocuments({ freelancerId });
    const activeProjects = await FreelancerProject.countDocuments({ 
      freelancerId, 
      status: { $in: ['planning', 'in_progress', 'review'] }
    });
    const completedProjects = await FreelancerProject.countDocuments({ 
      freelancerId, 
      status: 'completed' 
    });
    const onHoldProjects = await FreelancerProject.countDocuments({ 
      freelancerId, 
      status: 'on_hold' 
    });
    
    // حساب إجمالي الإيرادات
    const projects = await FreelancerProject.find({ 
      freelancerId, 
      status: 'completed' 
    }).select('budget');
    
    const totalEarnings = projects.reduce((sum, project) => sum + (project.budget || 0), 0);
    
    // حساب متوسط التقدم للمشاريع النشطة
    const activeProjectsData = await FreelancerProject.find({ 
      freelancerId, 
      status: { $in: ['planning', 'in_progress', 'review'] }
    }).select('progress');
    
    const averageProgress = activeProjectsData.length > 0 
      ? activeProjectsData.reduce((sum, project) => sum + project.progress, 0) / activeProjectsData.length
      : 0;
    
    const stats = {
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      totalEarnings,
      averageProgress: Math.round(averageProgress),
      successRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('خطأ في جلب إحصائيات المشاريع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات المشاريع',
      error: error.message
    });
  }
});

export default router;
