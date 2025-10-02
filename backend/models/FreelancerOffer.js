import mongoose from 'mongoose';

const freelancerOfferSchema = new mongoose.Schema({
  // معلومات أساسية
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // تفاصيل العمل
  locationType: {
    type: String,
    enum: ['remote', 'hybrid', 'onsite'],
    default: 'remote'
  },
  locationText: {
    type: String,
    trim: true
  },
  contractType: {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'contract'],
    required: true
  },
  seniority: {
    type: String,
    enum: ['junior', 'mid', 'senior'],
    default: 'junior'
  },
  
  // معلومات الراتب
  salaryMin: {
    type: Number,
    min: 0
  },
  salaryMax: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    enum: ['EUR', 'TND', 'USD'],
    default: 'TND'
  },
  workHours: {
    type: String,
    trim: true
  },
  
  // المهارات والمتطلبات
  skills: [String],
  requirements: [String],
  benefits: [String],
  
  // معلومات التواصل
  applicationLink: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  deadline: {
    type: Date
  },
  
  // نظام الرؤية - المحور الأساسي
  visibility: {
    type: String,
    enum: ['all', 'assigned'],
    required: true,
    default: 'all'
  },
  assignedFreelancerIds: [{
    type: String,
    validate: {
      validator: function(v) {
        // التحقق من صيغة ID الفريلانسر (FRE-XXXXXX)
        return /^FRE-\d{6}$/.test(v);
      },
      message: 'Freelancer ID must be in format FRE-XXXXXX'
    }
  }],
  
  // حالة العرض
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'accepted', 'rejected'],
    default: 'draft'
  },
  tags: [String],
  
  // معلومات القبول/الرفض
  acceptedBy: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^FRE-\d{6}$/.test(v);
      },
      message: 'Accepted by must be a valid freelancer ID (FRE-XXXXXX)'
    }
  },
  acceptedAt: {
    type: Date
  },
  rejectedBy: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^FRE-\d{6}$/.test(v);
      },
      message: 'Rejected by must be a valid freelancer ID (FRE-XXXXXX)'
    }
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  
  // معلومات الإنشاء والتتبع
  createdBy: {
    type: String,
    required: true,
    default: 'admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index للبحث السريع
freelancerOfferSchema.index({ status: 1, visibility: 1 });
freelancerOfferSchema.index({ assignedFreelancerIds: 1 });
freelancerOfferSchema.index({ createdAt: -1 });

// Middleware لتحديث updatedAt
freelancerOfferSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method للتحقق من إمكانية رؤية العرض للفريلانسر
freelancerOfferSchema.methods.isVisibleToFreelancer = function(freelancerId) {
  if (this.status !== 'published') return false;
  
  if (this.visibility === 'all') return true;
  
  if (this.visibility === 'assigned') {
    return this.assignedFreelancerIds.includes(freelancerId);
  }
  
  return false;
};

// Static method للحصول على العروض المرئية للفريلانسر (استثناء العروض المقبولة/المرفوضة)
freelancerOfferSchema.statics.getVisibleOffers = function(freelancerId) {
  return this.find({
    status: 'published', // فقط العروض المنشورة
    $or: [
      { visibility: 'all' },
      { 
        visibility: 'assigned', 
        assignedFreelancerIds: { $in: [freelancerId] } 
      }
    ],
    // استثناء العروض المقبولة أو المرفوضة
    acceptedBy: { $exists: false },
    rejectedBy: { $ne: freelancerId } // لا تظهر العروض المرفوضة من هذا الفريلانسر
  }).sort({ createdAt: -1 });
};

const FreelancerOffer = mongoose.model('FreelancerOffer', freelancerOfferSchema);

export default FreelancerOffer;
