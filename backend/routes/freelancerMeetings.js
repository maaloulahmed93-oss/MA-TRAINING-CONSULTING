import express from 'express';
import FreelancerMeeting from '../models/FreelancerMeeting.js';

const router = express.Router();

// GET /api/freelancer-meetings - جلب جميع الاجتماعات (للـ Admin Panel)
router.get('/', async (req, res) => {
  try {
    const meetings = await FreelancerMeeting.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: meetings,
      count: meetings.length
    });

  } catch (error) {
    console.error('خطأ في جلب الاجتماعات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الاجتماعات',
      error: error.message
    });
  }
});

// GET /api/freelancer-meetings/freelancer/:freelancerId - جلب اجتماعات فريلانسر معين
router.get('/freelancer/:freelancerId', async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const { status, upcoming } = req.query;

    // التحقق من صحة معرف الفريلانسر
    if (!/^FRE-\d{6}$/.test(freelancerId)) {
      return res.status(400).json({
        success: false,
        message: 'معرف الفريلانسر غير صحيح'
      });
    }

    let query = { participantFreelancerIds: { $in: [freelancerId] } };

    // فلترة حسب الحالة
    if (status && status !== 'all') {
      query.status = status;
    }

    // فلترة الاجتماعات القادمة فقط
    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      query.date = { $gte: today };
      query.status = 'scheduled';
    }

    const meetings = await FreelancerMeeting.find(query)
      .sort({ date: 1, startTime: 1 });

    console.log(`📅 تم جلب ${meetings.length} اجتماع للفريلانسر ${freelancerId}`);

    res.json({
      success: true,
      data: meetings,
      count: meetings.length,
      freelancerId
    });

  } catch (error) {
    console.error('خطأ في جلب اجتماعات الفريلانسر:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب اجتماعات الفريلانسر',
      error: error.message
    });
  }
});

// GET /api/freelancer-meetings/:id - جلب تفاصيل اجتماع معين
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await FreelancerMeeting.findById(id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'الاجتماع غير موجود'
      });
    }

    res.json({
      success: true,
      data: meeting
    });

  } catch (error) {
    console.error('خطأ في جلب تفاصيل الاجتماع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب تفاصيل الاجتماع',
      error: error.message
    });
  }
});

// POST /api/freelancer-meetings - إنشاء اجتماع جديد (للـ Admin Panel)
router.post('/', async (req, res) => {
  try {
    const meetingData = req.body;

    // التحقق من البيانات المطلوبة
    if (!meetingData.subject || !meetingData.date || !meetingData.startTime || 
        !meetingData.participantFreelancerIds || meetingData.participantFreelancerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'البيانات المطلوبة مفقودة'
      });
    }

    // التحقق من نوع الاجتماع والبيانات المطلوبة
    if (meetingData.type === 'visio' && !meetingData.meetingLink) {
      return res.status(400).json({
        success: false,
        message: 'رابط الاجتماع مطلوب للاجتماعات المرئية'
      });
    }

    if (meetingData.type === 'presentiel' && !meetingData.locationText) {
      return res.status(400).json({
        success: false,
        message: 'موقع الاجتماع مطلوب للاجتماعات الحضورية'
      });
    }

    const newMeeting = new FreelancerMeeting(meetingData);
    await newMeeting.save();

    console.log(`✅ تم إنشاء اجتماع جديد: ${newMeeting.subject} مع ${newMeeting.participantFreelancerIds.length} مشارك`);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الاجتماع بنجاح',
      data: newMeeting
    });

  } catch (error) {
    console.error('خطأ في إنشاء الاجتماع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء الاجتماع',
      error: error.message
    });
  }
});

// PUT /api/freelancer-meetings/:id - تحديث اجتماع
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const meeting = await FreelancerMeeting.findById(id);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'الاجتماع غير موجود'
      });
    }

    // تحديث البيانات
    Object.assign(meeting, updateData);
    await meeting.save();

    console.log(`📝 تم تحديث الاجتماع: ${meeting.subject}`);

    res.json({
      success: true,
      message: 'تم تحديث الاجتماع بنجاح',
      data: meeting
    });

  } catch (error) {
    console.error('خطأ في تحديث الاجتماع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الاجتماع',
      error: error.message
    });
  }
});

// DELETE /api/freelancer-meetings/:id - حذف اجتماع
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await FreelancerMeeting.findById(id);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'الاجتماع غير موجود'
      });
    }

    await FreelancerMeeting.findByIdAndDelete(id);

    console.log(`🗑️ تم حذف الاجتماع: ${meeting.subject}`);

    res.json({
      success: true,
      message: 'تم حذف الاجتماع بنجاح'
    });

  } catch (error) {
    console.error('خطأ في حذف الاجتماع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الاجتماع',
      error: error.message
    });
  }
});

// POST /api/freelancer-meetings/:id/respond - رد الفريلانسر على الاجتماع
router.post('/:id/respond', async (req, res) => {
  try {
    const { id } = req.params;
    const { freelancerId, response, notes } = req.body;

    // التحقق من صحة البيانات
    if (!freelancerId || !response) {
      return res.status(400).json({
        success: false,
        message: 'معرف الفريلانسر والرد مطلوبان'
      });
    }

    if (!/^FRE-\d{6}$/.test(freelancerId)) {
      return res.status(400).json({
        success: false,
        message: 'معرف الفريلانسر غير صحيح'
      });
    }

    if (!['accepted', 'declined'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'الرد يجب أن يكون accepted أو declined'
      });
    }

    const meeting = await FreelancerMeeting.findById(id);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'الاجتماع غير موجود'
      });
    }

    // التحقق من أن الفريلانسر مدعو للاجتماع
    if (!meeting.isVisibleToFreelancer(freelancerId)) {
      return res.status(403).json({
        success: false,
        message: 'غير مخول للرد على هذا الاجتماع'
      });
    }

    // تحديث رد الفريلانسر
    await meeting.updateFreelancerResponse(freelancerId, response, notes || '');

    const responseText = response === 'accepted' ? 'قبول' : 'رفض';
    console.log(`${response === 'accepted' ? '✅' : '❌'} ${responseText} الاجتماع "${meeting.subject}" من قبل ${freelancerId}`);

    res.json({
      success: true,
      message: `تم ${responseText} الاجتماع بنجاح`,
      data: {
        meetingId: meeting._id,
        freelancerId,
        response,
        responseDate: new Date()
      }
    });

  } catch (error) {
    console.error('خطأ في الرد على الاجتماع:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الرد على الاجتماع',
      error: error.message
    });
  }
});

// POST /api/freelancer-meetings/:id/notes - إضافة/تحديث ملاحظات الفريلانسر
router.post('/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { freelancerId, notes } = req.body;

    if (!freelancerId || !notes) {
      return res.status(400).json({
        success: false,
        message: 'معرف الفريلانسر والملاحظات مطلوبان'
      });
    }

    const meeting = await FreelancerMeeting.findById(id);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'الاجتماع غير موجود'
      });
    }

    // التحقق من أن الفريلانسر مدعو للاجتماع
    if (!meeting.isVisibleToFreelancer(freelancerId)) {
      return res.status(403).json({
        success: false,
        message: 'غير مخول لإضافة ملاحظات لهذا الاجتماع'
      });
    }

    // البحث عن رد الفريلانسر أو إنشاء واحد جديد
    const existingResponse = meeting.freelancerResponses.find(r => r.freelancerId === freelancerId);
    
    if (existingResponse) {
      existingResponse.notes = notes;
    } else {
      meeting.freelancerResponses.push({
        freelancerId,
        response: 'pending',
        responseDate: new Date(),
        notes
      });
    }

    await meeting.save();

    console.log(`📝 تم تحديث ملاحظات الاجتماع "${meeting.subject}" من قبل ${freelancerId}`);

    res.json({
      success: true,
      message: 'تم حفظ الملاحظات بنجاح',
      data: {
        meetingId: meeting._id,
        freelancerId,
        notes
      }
    });

  } catch (error) {
    console.error('خطأ في حفظ الملاحظات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حفظ الملاحظات',
      error: error.message
    });
  }
});

// GET /api/freelancer-meetings/stats/:freelancerId - إحصائيات اجتماعات الفريلانسر
router.get('/stats/:freelancerId', async (req, res) => {
  try {
    const { freelancerId } = req.params;

    if (!/^FRE-\d{6}$/.test(freelancerId)) {
      return res.status(400).json({
        success: false,
        message: 'معرف الفريلانسر غير صحيح'
      });
    }

    const totalMeetings = await FreelancerMeeting.countDocuments({
      participantFreelancerIds: { $in: [freelancerId] }
    });

    const scheduledMeetings = await FreelancerMeeting.countDocuments({
      participantFreelancerIds: { $in: [freelancerId] },
      status: 'scheduled'
    });

    const completedMeetings = await FreelancerMeeting.countDocuments({
      participantFreelancerIds: { $in: [freelancerId] },
      status: 'completed'
    });

    const cancelledMeetings = await FreelancerMeeting.countDocuments({
      participantFreelancerIds: { $in: [freelancerId] },
      status: 'cancelled'
    });

    // الاجتماعات القادمة
    const today = new Date().toISOString().split('T')[0];
    const upcomingMeetings = await FreelancerMeeting.countDocuments({
      participantFreelancerIds: { $in: [freelancerId] },
      status: 'scheduled',
      date: { $gte: today }
    });

    const stats = {
      total: totalMeetings,
      scheduled: scheduledMeetings,
      completed: completedMeetings,
      cancelled: cancelledMeetings,
      upcoming: upcomingMeetings
    };

    res.json({
      success: true,
      data: stats,
      freelancerId
    });

  } catch (error) {
    console.error('خطأ في جلب إحصائيات الاجتماعات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات الاجتماعات',
      error: error.message
    });
  }
});

export default router;
