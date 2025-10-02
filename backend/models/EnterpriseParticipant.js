import mongoose from 'mongoose';

const enterpriseParticipantSchema = new mongoose.Schema({
  // ID unique du participant
  participantId: {
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
  
  // Informations personnelles
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  
  phone: {
    type: String,
    trim: true
  },
  
  // Informations professionnelles
  position: {
    type: String,
    trim: true
  },
  
  department: {
    type: String,
    trim: true
  },
  
  employeeId: {
    type: String,
    trim: true
  },
  
  // Programmes suivis
  enrolledPrograms: [{
    programId: {
      type: String,
      required: true
    },
    programTitle: String,
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['enrolled', 'in_progress', 'completed', 'dropped'],
      default: 'enrolled'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    completionDate: Date,
    grade: {
      type: Number,
      min: 0,
      max: 20
    },
    certificateIssued: {
      type: Boolean,
      default: false
    }
  }],
  
  // Formations suivies
  formations: [{
    formationId: String,
    formationTitle: String,
    date: Date,
    duration: Number,
    status: {
      type: String,
      enum: ['registered', 'attended', 'completed', 'missed'],
      default: 'registered'
    },
    evaluation: {
      type: Number,
      min: 0,
      max: 5
    },
    feedback: String
  }],
  
  // Événements
  events: [{
    eventId: String,
    eventTitle: String,
    date: Date,
    registrationDate: {
      type: Date,
      default: Date.now
    },
    attended: {
      type: Boolean,
      default: false
    },
    feedback: String
  }],
  
  // Documents
  documents: {
    attestation: {
      filename: String,
      path: String,
      uploadDate: Date
    },
    evaluation: {
      filename: String,
      path: String,
      uploadDate: Date
    },
    recommendation: {
      filename: String,
      path: String,
      uploadDate: Date
    },
    certificate: {
      filename: String,
      path: String,
      issueDate: Date
    }
  },
  
  // Statut global
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed', 'suspended'],
    default: 'active'
  },
  
  // Dates importantes
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  
  lastActivityDate: {
    type: Date,
    default: Date.now
  },
  
  completionDate: Date,
  
  // Statistiques
  totalHoursCompleted: {
    type: Number,
    default: 0
  },
  
  averageGrade: {
    type: Number,
    min: 0,
    max: 20
  },
  
  certificatesEarned: {
    type: Number,
    default: 0
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
enterpriseParticipantSchema.index({ partnerId: 1, status: 1 });
enterpriseParticipantSchema.index({ partnerId: 1, fullName: 1 });
enterpriseParticipantSchema.index({ email: 1 });

// Middleware
enterpriseParticipantSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.lastActivityDate = new Date();
  
  // Calculer la note moyenne
  const completedPrograms = this.enrolledPrograms.filter(p => p.grade !== undefined);
  if (completedPrograms.length > 0) {
    const totalGrades = completedPrograms.reduce((sum, p) => sum + p.grade, 0);
    this.averageGrade = totalGrades / completedPrograms.length;
  }
  
  // Compter les certificats
  this.certificatesEarned = this.enrolledPrograms.filter(p => p.certificateIssued).length;
  
  next();
});

// Méthodes statiques
enterpriseParticipantSchema.statics.findByPartnerId = function(partnerId) {
  return this.find({ partnerId }).sort({ fullName: 1 });
};

enterpriseParticipantSchema.statics.getActiveParticipants = function(partnerId) {
  return this.find({ 
    partnerId, 
    status: 'active'
  });
};

enterpriseParticipantSchema.statics.getParticipantsByProgram = function(partnerId, programId) {
  return this.find({ 
    partnerId,
    'enrolledPrograms.programId': programId
  });
};

// Méthodes d'instance
enterpriseParticipantSchema.methods.enrollInProgram = function(programData) {
  this.enrolledPrograms.push(programData);
  return this.save();
};

enterpriseParticipantSchema.methods.updateProgramProgress = function(programId, progress, grade) {
  const program = this.enrolledPrograms.find(p => p.programId === programId);
  if (program) {
    program.progress = progress;
    if (grade !== undefined) {
      program.grade = grade;
    }
    if (progress === 100) {
      program.status = 'completed';
      program.completionDate = new Date();
    }
  }
  return this.save();
};

enterpriseParticipantSchema.methods.addFormation = function(formationData) {
  this.formations.push(formationData);
  return this.save();
};

enterpriseParticipantSchema.methods.registerForEvent = function(eventData) {
  this.events.push(eventData);
  return this.save();
};

const EnterpriseParticipant = mongoose.model('EnterpriseParticipant', enterpriseParticipantSchema);

export default EnterpriseParticipant;
