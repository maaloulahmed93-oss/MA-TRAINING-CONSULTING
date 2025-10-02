import mongoose from 'mongoose';

const freelancerDecisionSchema = new mongoose.Schema({
  // معرف الفريلانسر
  freelancerId: {
    type: String,
    required: true,
    match: /^FRE-\d{6}$/,
    index: true
  },
  
  // اسم الفريلانسر
  freelancerName: {
    type: String,
    required: true,
    trim: true
  },
  
  // عنوان الـ Livrable
  deliverableTitle: {
    type: String,
    required: true,
    trim: true
  },
  
  // القرار (مقبول أو مرفوض)
  decision: {
    type: String,
    required: true,
    enum: ['approved', 'rejected'],
    index: true
  },
  
  // ملاحظات الإدارة
  observation: {
    type: String,
    default: '',
    trim: true
  },
  
  // معرف الأدمين الذي أرسل القرار
  adminId: {
    type: String,
    default: 'admin',
    trim: true
  },
  
  // حالة القرار (مرسل، مقروء)
  status: {
    type: String,
    enum: ['sent', 'read'],
    default: 'sent',
    index: true
  },
  
  // تاريخ القراءة
  readAt: {
    type: Date,
    default: null
  },
  
  // معلومات إضافية
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true, // createdAt, updatedAt
  collection: 'freelancer_decisions'
});

// Indexes للبحث السريع
freelancerDecisionSchema.index({ freelancerId: 1, createdAt: -1 });
freelancerDecisionSchema.index({ freelancerId: 1, status: 1 });
freelancerDecisionSchema.index({ freelancerId: 1, decision: 1 });
freelancerDecisionSchema.index({ createdAt: -1 });

// Methods مساعدة
freelancerDecisionSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

freelancerDecisionSchema.methods.isRead = function() {
  return this.status === 'read';
};

freelancerDecisionSchema.methods.isApproved = function() {
  return this.decision === 'approved';
};

freelancerDecisionSchema.methods.isRejected = function() {
  return this.decision === 'rejected';
};

// Static methods للإحصائيات
freelancerDecisionSchema.statics.getStatsForFreelancer = async function(freelancerId) {
  return await this.aggregate([
    { $match: { freelancerId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        approved: {
          $sum: { $cond: [{ $eq: ['$decision', 'approved'] }, 1, 0] }
        },
        rejected: {
          $sum: { $cond: [{ $eq: ['$decision', 'rejected'] }, 1, 0] }
        },
        unread: {
          $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
        },
        read: {
          $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
        }
      }
    }
  ]);
};

freelancerDecisionSchema.statics.getRecentDecisions = async function(freelancerId, limit = 10) {
  return await this.find({ freelancerId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

freelancerDecisionSchema.statics.getUnreadCount = async function(freelancerId) {
  return await this.countDocuments({ 
    freelancerId, 
    status: 'sent' 
  });
};

// Virtual للعنوان المنسق
freelancerDecisionSchema.virtual('formattedTitle').get(function() {
  const status = this.decision === 'approved' ? '✅ مقبول' : '❌ مرفوض';
  return `${status} - ${this.deliverableTitle}`;
});

// Virtual للتاريخ المنسق
freelancerDecisionSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Transform للـ JSON output
freelancerDecisionSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const FreelancerDecision = mongoose.model('FreelancerDecision', freelancerDecisionSchema);

export default FreelancerDecision;
