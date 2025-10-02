import mongoose from 'mongoose';

// Schema للاجتماعات الخاصة بالفريلانسرز
const freelancerMeetingSchema = new mongoose.Schema({
  // معلومات أساسية
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  // نوع الاجتماع
  type: {
    type: String,
    enum: ['visio', 'presentiel'],
    required: true,
    default: 'visio'
  },
  
  // التاريخ والوقت
  date: {
    type: String, // YYYY-MM-DD format
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'Date must be in YYYY-MM-DD format'
    }
  },
  
  startTime: {
    type: String, // HH:MM format
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:MM format'
    }
  },
  
  endTime: {
    type: String, // HH:MM format
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:MM format'
    }
  },
  
  timezone: {
    type: String,
    default: 'Africa/Tunis'
  },
  
  // معلومات المكان/الرابط
  locationText: {
    type: String,
    trim: true,
    maxlength: 300
  },
  
  meetingLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Meeting link must be a valid URL'
    }
  },
  
  // معلومات المشاركين
  withWhom: {
    type: String,
    trim: true,
    maxlength: 200
  },
  
  // الحقل المهم: معرفات الفريلانسرز المشاركين
  participantFreelancerIds: [{
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^FRE-\d{6}$/.test(v);
      },
      message: 'Freelancer ID must be in format FRE-XXXXXX'
    }
  }],
  
  // جدول الأعمال
  agenda: [{
    type: String,
    trim: true,
    maxlength: 500
  }],
  
  // ملاحظات
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  
  // مرفقات
  attachments: [{
    id: String,
    name: String,
    url: String
  }],
  
  // منظم الاجتماع
  organizerId: {
    type: String,
    trim: true
  },
  
  // تذكيرات
  reminders: [{
    minutesBefore: {
      type: Number,
      min: 0,
      max: 10080 // أسبوع بالدقائق
    },
    channel: {
      type: String,
      enum: ['email', 'in-app']
    }
  }],
  
  // حالة الاجتماع
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  
  // نتيجة الاجتماع
  outcome: {
    type: String,
    enum: ['accepted', 'rejected', 'pending', 'hired'],
    default: 'pending'
  },
  
  // رابط التسجيل
  recordingLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Recording link must be a valid URL'
    }
  },
  
  // معلومات إضافية لتتبع ردود الفريلانسرز
  freelancerResponses: [{
    freelancerId: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^FRE-\d{6}$/.test(v);
        },
        message: 'Freelancer ID must be in format FRE-XXXXXX'
      }
    },
    response: {
      type: String,
      enum: ['accepted', 'declined', 'pending'],
      default: 'pending'
    },
    responseDate: Date,
    notes: String
  }]
}, {
  timestamps: true, // يضيف createdAt و updatedAt تلقائياً
  collection: 'freelancer_meetings'
});

// Indexes لتحسين الأداء
freelancerMeetingSchema.index({ participantFreelancerIds: 1 });
freelancerMeetingSchema.index({ date: 1, startTime: 1 });
freelancerMeetingSchema.index({ status: 1 });
freelancerMeetingSchema.index({ createdAt: -1 });

// Static method للحصول على الاجتماعات الخاصة بفريلانسر معين
freelancerMeetingSchema.statics.getFreelancerMeetings = function(freelancerId) {
  return this.find({
    participantFreelancerIds: { $in: [freelancerId] }
  }).sort({ date: 1, startTime: 1 });
};

// Static method للحصول على الاجتماعات القادمة لفريلانسر
freelancerMeetingSchema.statics.getUpcomingMeetings = function(freelancerId) {
  const today = new Date().toISOString().split('T')[0];
  return this.find({
    participantFreelancerIds: { $in: [freelancerId] },
    status: 'scheduled',
    date: { $gte: today }
  }).sort({ date: 1, startTime: 1 });
};

// Instance method للتحقق من إمكانية رؤية الفريلانسر للاجتماع
freelancerMeetingSchema.methods.isVisibleToFreelancer = function(freelancerId) {
  return this.participantFreelancerIds.includes(freelancerId);
};

// Instance method لتحديث رد الفريلانسر
freelancerMeetingSchema.methods.updateFreelancerResponse = function(freelancerId, response, notes = '') {
  const existingResponse = this.freelancerResponses.find(r => r.freelancerId === freelancerId);
  
  if (existingResponse) {
    existingResponse.response = response;
    existingResponse.responseDate = new Date();
    existingResponse.notes = notes;
  } else {
    this.freelancerResponses.push({
      freelancerId,
      response,
      responseDate: new Date(),
      notes
    });
  }
  
  return this.save();
};

// Instance method للحصول على رد فريلانسر معين
freelancerMeetingSchema.methods.getFreelancerResponse = function(freelancerId) {
  return this.freelancerResponses.find(r => r.freelancerId === freelancerId);
};

// Virtual للحصول على مدة الاجتماع بالدقائق
freelancerMeetingSchema.virtual('durationMinutes').get(function() {
  if (!this.endTime) return null;
  
  const [startHour, startMin] = this.startTime.split(':').map(Number);
  const [endHour, endMin] = this.endTime.split(':').map(Number);
  
  const startTotalMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;
  
  return endTotalMin - startTotalMin;
});

// Virtual للتحقق من كون الاجتماع قادم
freelancerMeetingSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const meetingDateTime = new Date(`${this.date}T${this.startTime}`);
  return meetingDateTime > now && this.status === 'scheduled';
});

// Pre-save middleware للتحقق من صحة البيانات
freelancerMeetingSchema.pre('save', function(next) {
  // التحقق من أن نوع الاجتماع يتطابق مع البيانات المطلوبة
  if (this.type === 'visio' && !this.meetingLink) {
    return next(new Error('Meeting link is required for video meetings'));
  }
  
  if (this.type === 'presentiel' && !this.locationText) {
    return next(new Error('Location is required for in-person meetings'));
  }
  
  // التحقق من وجود مشاركين
  if (!this.participantFreelancerIds || this.participantFreelancerIds.length === 0) {
    return next(new Error('At least one participant freelancer ID is required'));
  }
  
  next();
});

const FreelancerMeeting = mongoose.model('FreelancerMeeting', freelancerMeetingSchema);

export default FreelancerMeeting;
