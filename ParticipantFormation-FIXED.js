import mongoose from 'mongoose';

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
    // 🔧 FIXED: Sessions schema now matches frontend expectations
    sessions: [{
      id: String,
      title: String,
      description: String,        // ✅ Added: Frontend sends description
      date: Date,                 // ✅ Kept: For backward compatibility
      duration: String,
      isCompleted: {
        type: Boolean,
        default: false
      },
      order: {                    // ✅ Added: Frontend sends order
        type: Number,
        default: 0
      },
      // 🔧 CRITICAL FIX: Added missing links field for sessions
      links: [{
        id: String,
        title: String,
        url: String,
        type: {
          type: String,
          enum: ['video', 'article', 'quiz', 'file', 'external'],
          default: 'article'
        }
      }]
    }]
  }],
  
  // Additional links and resources (formation-level)
  links: [{
    id: String,
    title: String,
    url: String,
    type: String,
    description: String
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
participantFormationSchema.index({ participantId: 1, status: 1 });
participantFormationSchema.index({ participantId: 1, createdAt: -1 });
participantFormationSchema.index({ participantId: 1, progress: -1 });

const ParticipantFormation = mongoose.model('ParticipantFormation', participantFormationSchema);

export default ParticipantFormation;
