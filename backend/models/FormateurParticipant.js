import mongoose from 'mongoose';

const formateurParticipantSchema = new mongoose.Schema({
  programmeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'FormateurProgramme'
  },
  formateurId: {
    type: String,
    required: true,
    ref: 'Partner'
  },
  nom: {
    type: String,
    required: true,
    trim: true
  },
  prenom: {
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
  telephone: {
    type: String,
    trim: true
  },
  dateInscription: {
    type: Date,
    default: Date.now
  },
  statut: {
    type: String,
    enum: ['inscrit', 'confirme', 'en_cours', 'termine', 'abandonne'],
    default: 'inscrit'
  },
  progression: {
    seancesAssistees: {
      type: Number,
      default: 0
    },
    totalSeances: {
      type: Number,
      default: 0
    },
    pourcentage: {
      type: Number,
      default: 0
    }
  },
  evaluations: [{
    seanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FormateurSeance'
    },
    note: {
      type: Number,
      min: 0,
      max: 20
    },
    commentaire: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  noteFinale: {
    type: Number,
    min: 0,
    max: 20
  },
  certificatGenere: {
    type: Boolean,
    default: false
  },
  certificatUrl: {
    type: String
  },
  informationsSupplementaires: {
    entreprise: String,
    poste: String,
    experience: String,
    objectifs: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
formateurParticipantSchema.index({ programmeId: 1 });
formateurParticipantSchema.index({ formateurId: 1 });
formateurParticipantSchema.index({ email: 1 });
formateurParticipantSchema.index({ statut: 1 });

// Méthode pour calculer la progression
formateurParticipantSchema.methods.calculerProgression = function() {
  if (this.progression.totalSeances > 0) {
    this.progression.pourcentage = Math.round(
      (this.progression.seancesAssistees / this.progression.totalSeances) * 100
    );
  }
  return this.progression.pourcentage;
};

// Méthode pour calculer la note finale
formateurParticipantSchema.methods.calculerNoteFinale = function() {
  if (this.evaluations.length > 0) {
    const total = this.evaluations.reduce((sum, evaluation) => sum + (evaluation.note || 0), 0);
    this.noteFinale = Math.round((total / this.evaluations.length) * 100) / 100;
  }
  return this.noteFinale;
};

export default mongoose.model('FormateurParticipant', formateurParticipantSchema);
