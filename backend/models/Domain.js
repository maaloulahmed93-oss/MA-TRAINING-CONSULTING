import mongoose from 'mongoose';

const domainSchema = new mongoose.Schema({
  domainId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
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
domainSchema.index({ isActive: 1, order: 1 });

// Middleware pour mettre à jour updatedAt
domainSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Domain = mongoose.model('Domain', domainSchema);

export default Domain;
