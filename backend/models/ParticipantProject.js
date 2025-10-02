import mongoose from 'mongoose';

const participantProjectSchema = new mongoose.Schema({
  // Owner field - critical for data isolation
  participantId: {
    type: String,
    required: true,
    index: true
  },
  
  // Project basic info
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  formationId: {
    type: String,
    required: false  // ✅ جعلناه اختياري
  },
  
  formationTitle: {
    type: String,
    required: false  // ✅ جعلناه اختياري
  },
  
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'submitted', 'accepted', 'rejected', 'revision_needed'],
    default: 'not_started'
  },
  
  submittedDate: {
    type: Date
  },
  
  dueDate: {
    type: Date
  },
  
  feedback: {
    type: String
  },
  
  grade: {
    type: Number,
    min: 0,
    max: 20
  },
  
  // Project URL/Link
  projectUrl: {
    type: String,
    trim: true
  },
  
  // Project files
  files: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    size: String,
    type: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    url: String
  }],
  
  // Active status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
participantProjectSchema.index({ participantId: 1, status: 1 });
participantProjectSchema.index({ participantId: 1, dueDate: 1 });
participantProjectSchema.index({ participantId: 1, createdAt: -1 });

const ParticipantProject = mongoose.model('ParticipantProject', participantProjectSchema);

export default ParticipantProject;
