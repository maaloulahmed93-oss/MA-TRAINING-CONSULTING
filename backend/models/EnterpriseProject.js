import mongoose from 'mongoose';

const enterpriseProjectSchema = new mongoose.Schema({
  // ID unique du projet
  projectId: {
    type: String,
    required: true,
    unique: true
  },
  
  // ID du partenaire entreprise
  partnerId: {
    type: String,
    required: true,
    index: true
  },
  
  // Informations du projet
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'completed', 'on_hold'],
    default: 'planning'
  },
  
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Dates
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: Date,
    required: true
  },
  
  // Budget
  budget: {
    type: Number,
    min: 0
  },
  
  // Participants
  participants: [{
    type: String,
    trim: true
  }],
  
  // Objectifs
  objectives: [{
    type: String,
    trim: true
  }],
  
  // Livrables
  deliverables: [{
    type: String,
    trim: true
  }],
  
  // Métadonnées
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index composé pour optimiser les requêtes
enterpriseProjectSchema.index({ partnerId: 1, status: 1 });
enterpriseProjectSchema.index({ partnerId: 1, createdAt: -1 });

// Middleware pour mettre à jour updatedAt
enterpriseProjectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Méthodes statiques
enterpriseProjectSchema.statics.findByPartnerId = function(partnerId) {
  return this.find({ partnerId }).sort({ createdAt: -1 });
};

enterpriseProjectSchema.statics.getActiveProjects = function(partnerId) {
  return this.find({ 
    partnerId, 
    status: { $in: ['planning', 'in_progress'] }
  });
};

enterpriseProjectSchema.statics.getCompletedProjects = function(partnerId) {
  return this.find({ 
    partnerId, 
    status: 'completed'
  });
};

// Méthodes d'instance
enterpriseProjectSchema.methods.updateProgress = function(newProgress) {
  this.progress = Math.max(0, Math.min(100, newProgress));
  if (this.progress === 100 && this.status !== 'completed') {
    this.status = 'completed';
  }
  return this.save();
};

const EnterpriseProject = mongoose.model('EnterpriseProject', enterpriseProjectSchema);

export default EnterpriseProject;
