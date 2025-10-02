import mongoose from 'mongoose';

// 🔧 Formation Link Schema - مرن ليقبل جميع القيم
const FormationLinkSchema = new mongoose.Schema({
  id: String,
  title: String,
  url: String,
  type: String  // ✅ إزالة enum restriction لقبول أي قيمة
});

// 🔧 Session Link Schema - مرن ليقبل جميع القيم
const SessionLinkSchema = new mongoose.Schema({
  id: String,
  title: String,
  url: String,
  type: String  // ✅ إزالة enum restriction لقبول أي قيمة
});

// 🔧 Session Schema - محدث ليتوافق مع الفورم
const SessionSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,        // ✅ Frontend يبعثو
  duration: String,
  isCompleted: { type: Boolean, default: false },
  order: Number,              // ✅ Frontend يبعثو
  links: [SessionLinkSchema]  // ✅ Session links
});

const participantFormationSchema = new mongoose.Schema({
  // Owner field - critical for data isolation
  participantId: {
    type: String,
    required: true,
    index: true
  },
  
  // Formation basic info
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  domain: {
    type: String,
    default: 'Général'
  },
  
  level: {
    type: String,
    enum: ['Débutant', 'Intermédiaire', 'Avancé'],
    default: 'Débutant'
  },
  
  duration: {
    type: String,
    default: '0 heures'
  },
  
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'paused'],
    default: 'not_started'
  },
  
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  
  completionDate: {
    type: Date
  },
  
  thumbnail: {
    type: String
  },
  
  // Courses within the formation
  courses: [{
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    duration: String,
    modules: [{
      id: String,
      title: String,
      description: String,
      duration: String,
      isCompleted: {
        type: Boolean,
        default: false
      },
      isLocked: {
        type: Boolean,
        default: false
      },
      type: {
        type: String,
        enum: ['video', 'text', 'quiz', 'exercise'],
        default: 'video'
      },
      content: String,
      dataLinks: [{
        id: String,
        title: String,
        url: String,
        type: {
          type: String,
          enum: ['video', 'document', 'resource', 'exercise', 'download', 'external', 'action', 'interactive'],
          default: 'resource'
        },
        description: String,
        duration: String,
        fileSize: String
      }]
    }],
    sessions: [SessionSchema]  // ✅ استخدام الـ Schema المنفصل
  }],
  
  // Formation links - استخدام الـ FormationLinkSchema الصحيح
  links: [FormationLinkSchema],
  
  // Active status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
participantFormationSchema.index({ participantId: 1, status: 1 });
participantFormationSchema.index({ participantId: 1, createdAt: -1 });
participantFormationSchema.index({ participantId: 1, progress: -1 });

const ParticipantFormation = mongoose.model('ParticipantFormation', participantFormationSchema);

export default ParticipantFormation;
