import mongoose from 'mongoose';

const freeCourseAccessSchema = new mongoose.Schema({
  accessId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
    uppercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxUsage: {
    type: Number,
    default: -1, // -1 = illimité
    min: -1
  },
  expiresAt: {
    type: Date,
    default: null
  },
  lastUsedAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: String,
    default: 'system'
  },
  description: {
    type: String,
    trim: true,
    default: ''
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

// Index pour optimiser les requêtes
freeCourseAccessSchema.index({ isActive: 1 });
freeCourseAccessSchema.index({ expiresAt: 1 });

// Middleware pour mettre à jour updatedAt
freeCourseAccessSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Méthode pour vérifier si l'ID d'accès est valide
freeCourseAccessSchema.methods.isValidAccess = function() {
  // Vérifier si actif
  if (!this.isActive) return false;
  
  // Vérifier expiration
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  
  // Vérifier limite d'usage
  if (this.maxUsage > 0 && this.usageCount >= this.maxUsage) return false;
  
  return true;
};

// Méthode pour incrémenter l'usage
freeCourseAccessSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  return this.save();
};

const FreeCourseAccess = mongoose.model('FreeCourseAccess', freeCourseAccessSchema);

export default FreeCourseAccess;
