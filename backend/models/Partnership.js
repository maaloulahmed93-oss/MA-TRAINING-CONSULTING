import mongoose from 'mongoose';

const partnershipSchema = new mongoose.Schema({
  partnershipId: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['formateur', 'freelance', 'commercial', 'entreprise']
  },
  title: {
    type: String,
  },
  subtitle: {
    type: String,
    required: true
  },
  intro: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true,
    enum: ['blue', 'green', 'orange', 'purple', 'red', 'yellow']
  },
  gradient: {
    type: String,
  },
  details: [{
    type: String,
    required: true
  }],
  requirements: [{
    type: String,
    required: false
  }],
  contactEmail: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  ctaLabel: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    default: 'En savoir plus'
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
});

// Update the updatedAt field before saving
partnershipSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for better performance (removed duplicates)
partnershipSchema.index({ type: 1 });
partnershipSchema.index({ isActive: 1 });

export default mongoose.model('Partnership', partnershipSchema);
