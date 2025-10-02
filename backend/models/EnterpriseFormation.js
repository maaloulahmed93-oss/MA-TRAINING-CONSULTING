import mongoose from 'mongoose';

const enterpriseFormationSchema = new mongoose.Schema({
  // ID unique de la formation
  formationId: {
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
  
  // Informations de la formation
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  // Formateurs
  trainers: [{
    type: String,
    trim: true
  }],
  
  partnerTrainers: [{
    type: String,
    trim: true
  }],
  
  // Planning
  date: {
    type: Date,
    required: true
  },
  
  duration: {
    type: Number,
    required: true,
    min: 1 // en heures
  },
  
  location: {
    type: String,
    enum: ['online', 'onsite', 'hybrid'],
    required: true
  },
  
  // Participants
  participants: {
    type: Number,
    min: 0,
    default: 0
  },
  
  maxParticipants: {
    type: Number,
    min: 1
  },
  
  // Statut
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  
  // Matériaux pédagogiques
  materials: [{
    type: String,
    trim: true
  }],
  
  // Évaluation
  evaluationScore: {
    type: Number,
    min: 0,
    max: 5
  },
  
  feedback: {
    type: String
  },
  
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

// Index composés
enterpriseFormationSchema.index({ partnerId: 1, status: 1 });
enterpriseFormationSchema.index({ partnerId: 1, date: 1 });

// Middleware
enterpriseFormationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Méthodes statiques
enterpriseFormationSchema.statics.findByPartnerId = function(partnerId) {
  return this.find({ partnerId }).sort({ date: -1 });
};

enterpriseFormationSchema.statics.getUpcomingFormations = function(partnerId) {
  return this.find({ 
    partnerId, 
    date: { $gte: new Date() },
    status: { $in: ['scheduled', 'ongoing'] }
  }).sort({ date: 1 });
};

enterpriseFormationSchema.statics.getCompletedFormations = function(partnerId) {
  return this.find({ 
    partnerId, 
    status: 'completed'
  }).sort({ date: -1 });
};

const EnterpriseFormation = mongoose.model('EnterpriseFormation', enterpriseFormationSchema);

export default EnterpriseFormation;
