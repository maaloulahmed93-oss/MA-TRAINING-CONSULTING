import mongoose from 'mongoose';

const freelancerProjectSchema = new mongoose.Schema({
  // معلومات أساسية
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  client: {
    type: String,
    required: true,
    trim: true
  },
  
  // معلومات الفريلانسر
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
  
  // حالة المشروع
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled'],
    default: 'in_progress'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // تواريخ المشروع
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  deadline: {
    type: Date
  },
  
  // معلومات مالية
  budget: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    enum: ['EUR', 'TND', 'USD'],
    default: 'TND'
  },
  
  // تفاصيل العمل
  workMode: {
    type: String,
    enum: ['remote', 'hybrid', 'onsite'],
    default: 'remote'
  },
  estimatedHours: {
    type: Number,
    min: 0
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // مهارات ومتطلبات
  skills: [String],
  requirements: [String],
  
  // أعضاء الفريق (إذا كان مشروع جماعي)
  teamMembers: [String],
  
  // ربط بالعرض الأصلي
  originalOfferId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FreelancerOffer'
  },
  
  // معلومات إضافية
  notes: {
    type: String,
    trim: true
  },
  tags: [String],
  
  // معلومات الإنشاء والتتبع
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

// Indexes للبحث السريع
freelancerProjectSchema.index({ freelancerId: 1, status: 1 });
freelancerProjectSchema.index({ createdAt: -1 });
freelancerProjectSchema.index({ originalOfferId: 1 });

// Middleware لتحديث updatedAt
freelancerProjectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method للحصول على مشاريع الفريلانسر
freelancerProjectSchema.statics.getFreelancerProjects = function(freelancerId, status = null) {
  const filter = { freelancerId };
  
  if (status && status !== 'all') {
    filter.status = status;
  }
  
  return this.find(filter)
    .populate('originalOfferId', 'title company')
    .sort({ createdAt: -1 });
};

// Method لحساب التقدم التلقائي
freelancerProjectSchema.methods.calculateProgress = function() {
  // يمكن إضافة منطق حساب التقدم بناءً على المهام المكتملة
  // في الوقت الحالي، نعيد التقدم الحالي
  return this.progress;
};

// Method للتحقق من انتهاء الموعد النهائي
freelancerProjectSchema.methods.isOverdue = function() {
  if (!this.deadline) return false;
  return new Date() > this.deadline && this.status !== 'completed';
};

const FreelancerProject = mongoose.model('FreelancerProject', freelancerProjectSchema);

export default FreelancerProject;
