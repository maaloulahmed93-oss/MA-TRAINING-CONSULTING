import mongoose from 'mongoose';

const courseModuleSchema = new mongoose.Schema({
  moduleId: {
    type: Number,
    required: true
  },
  courseId: {
    type: String,
    required: true,
    trim: true,
    ref: 'Course'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    trim: true,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
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

// Index composé pour éviter les doublons et optimiser les requêtes
courseModuleSchema.index({ moduleId: 1, courseId: 1 }, { unique: true });
courseModuleSchema.index({ courseId: 1, isActive: 1, order: 1 });

// Middleware pour mettre à jour updatedAt
courseModuleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const CourseModule = mongoose.model('CourseModule', courseModuleSchema);

export default CourseModule;
