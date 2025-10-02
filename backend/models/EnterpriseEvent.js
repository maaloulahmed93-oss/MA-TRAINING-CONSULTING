import mongoose from 'mongoose';

const enterpriseEventSchema = new mongoose.Schema({
  // ID unique de l'événement
  eventId: {
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
  
  // Informations de l'événement
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  type: {
    type: String,
    enum: ['seminar', 'workshop', 'conference', 'networking'],
    required: true
  },
  
  // Planning
  date: {
    type: Date,
    required: true
  },
  
  time: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  
  duration: {
    type: Number,
    required: true,
    min: 1 // en heures
  },
  
  // Lieu
  location: {
    type: String,
    required: true,
    trim: true
  },
  
  // Participants
  maxParticipants: {
    type: Number,
    min: 1
  },
  
  currentParticipants: {
    type: Number,
    min: 0,
    default: 0
  },
  
  registeredParticipants: [{
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    company: String,
    registrationDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Statut
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  
  // Organisation
  organizers: [{
    type: String,
    trim: true
  }],
  
  // Programme
  agenda: [{
    type: String,
    trim: true
  }],
  
  // Ressources
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['presentation', 'document', 'video', 'other']
    }
  }],
  
  // Évaluation
  feedback: [{
    participantName: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  averageRating: {
    type: Number,
    min: 0,
    max: 5
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
enterpriseEventSchema.index({ partnerId: 1, status: 1 });
enterpriseEventSchema.index({ partnerId: 1, date: 1 });
enterpriseEventSchema.index({ date: 1, status: 1 });

// Middleware
enterpriseEventSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculer la note moyenne
  if (this.feedback && this.feedback.length > 0) {
    const totalRating = this.feedback.reduce((sum, fb) => sum + fb.rating, 0);
    this.averageRating = totalRating / this.feedback.length;
  }
  
  next();
});

// Méthodes statiques
enterpriseEventSchema.statics.findByPartnerId = function(partnerId) {
  return this.find({ partnerId }).sort({ date: -1 });
};

enterpriseEventSchema.statics.getUpcomingEvents = function(partnerId) {
  return this.find({ 
    partnerId, 
    date: { $gte: new Date() },
    status: { $in: ['upcoming', 'ongoing'] }
  }).sort({ date: 1 });
};

enterpriseEventSchema.statics.getPastEvents = function(partnerId) {
  return this.find({ 
    partnerId, 
    status: { $in: ['completed', 'cancelled'] }
  }).sort({ date: -1 });
};

// Méthodes d'instance
enterpriseEventSchema.methods.registerParticipant = function(participantData) {
  if (this.maxParticipants && this.currentParticipants >= this.maxParticipants) {
    throw new Error('Événement complet');
  }
  
  this.registeredParticipants.push(participantData);
  this.currentParticipants = this.registeredParticipants.length;
  return this.save();
};

enterpriseEventSchema.methods.addFeedback = function(feedbackData) {
  this.feedback.push(feedbackData);
  return this.save();
};

const EnterpriseEvent = mongoose.model('EnterpriseEvent', enterpriseEventSchema);

export default EnterpriseEvent;
