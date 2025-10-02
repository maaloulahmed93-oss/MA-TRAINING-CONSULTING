import mongoose from 'mongoose';

// Schema للـ Livrables الخاصة بالفريلانسرز
const freelancerDeliverableSchema = new mongoose.Schema({
  // معلومات أساسية
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // ربط بالفريلانسر والمشروع
  freelancerId: {
    type: String,
    required: true,
    match: /^FRE-\d{6}$/,
    index: true
  },
  
  projectId: {
    type: String,
    required: true,
    index: true
  },
  
  projectTitle: {
    type: String,
    required: true
  },
  
  // نوع الـ Livrable
  type: {
    type: String,
    enum: ['design', 'code', 'documentation', 'prototype', 'file', 'link'],
    required: true,
    default: 'file'
  },
  
  // حالة الـ Livrable
  status: {
    type: String,
    enum: ['pending', 'approved', 'revision_requested', 'rejected', 'revision_needed'],
    required: true,
    default: 'pending'
  },
  
  // التواريخ
  dueDate: {
    type: Date,
    required: true
  },
  
  submittedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // المحتوى والملفات
  fileUrl: {
    type: String,
    default: ''
  },
  
  fileName: {
    type: String,
    default: ''
  },
  
  fileSize: {
    type: Number,
    default: 0
  },
  
  mimeType: {
    type: String,
    default: ''
  },
  
  // للروابط الخارجية
  linkUrl: {
    type: String,
    default: ''
  },
  
  // ملاحظات إضافية
  content: {
    type: String,
    default: ''
  },
  
  // التقييم والملاحظات
  feedback: {
    type: String,
    default: ''
  },
  
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  
  // معلومات المراجعة
  reviewedBy: {
    type: String,
    default: ''
  },
  
  reviewedAt: {
    type: Date
  },
  
  // سجل التعديلات
  revisionHistory: [{
    version: Number,
    submittedAt: Date,
    fileUrl: String,
    notes: String
  }],
  
  // معلومات الإنشاء والتحديث
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'freelancer_deliverables'
});

// فهارس للبحث السريع
freelancerDeliverableSchema.index({ freelancerId: 1, status: 1 });
freelancerDeliverableSchema.index({ freelancerId: 1, projectId: 1 });
freelancerDeliverableSchema.index({ freelancerId: 1, submittedDate: -1 });
freelancerDeliverableSchema.index({ status: 1, submittedDate: -1 });

// Middleware لتحديث updatedAt
freelancerDeliverableSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Methods للنموذج
freelancerDeliverableSchema.methods.updateStatus = function(newStatus, feedback = '', rating = 0) {
  this.status = newStatus;
  this.feedback = feedback;
  this.rating = rating;
  this.reviewedAt = new Date();
  return this.save();
};

freelancerDeliverableSchema.methods.addRevision = function(fileUrl, notes = '') {
  this.revisionHistory.push({
    version: this.revisionHistory.length + 1,
    submittedAt: new Date(),
    fileUrl: fileUrl,
    notes: notes
  });
  this.fileUrl = fileUrl;
  this.status = 'pending';
  return this.save();
};

// Static methods
freelancerDeliverableSchema.statics.getByFreelancer = function(freelancerId, status = null) {
  const query = { freelancerId };
  if (status && status !== 'all') {
    query.status = status;
  }
  return this.find(query).sort({ submittedDate: -1 });
};

freelancerDeliverableSchema.statics.getByProject = function(freelancerId, projectId) {
  return this.find({ freelancerId, projectId }).sort({ submittedDate: -1 });
};

freelancerDeliverableSchema.statics.getStats = function(freelancerId) {
  return this.aggregate([
    { $match: { freelancerId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
};

const FreelancerDeliverable = mongoose.model('FreelancerDeliverable', freelancerDeliverableSchema);

export default FreelancerDeliverable;
