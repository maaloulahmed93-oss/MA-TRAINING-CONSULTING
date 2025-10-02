import mongoose from 'mongoose';

const formateurProgrammeSchema = new mongoose.Schema({
  formateurId: {
    type: String,
    required: true,
    ref: 'Partner'
  },
  titre: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dateDebut: {
    type: Date,
    required: true
  },
  dateFin: {
    type: Date,
    required: true
  },
  duree: {
    jours: {
      type: Number,
      default: function() {
        if (this.dateDebut && this.dateFin) {
          const diffTime = Math.abs(this.dateFin - this.dateDebut);
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        return 0;
      }
    },
    heures: {
      type: Number,
      default: 0
    }
  },
  statut: {
    type: String,
    enum: ['planifie', 'en_cours', 'termine', 'annule'],
    default: 'planifie'
  },
  prix: {
    type: Number,
    default: 0
  },
  maxParticipants: {
    type: Number,
    default: 20
  },
  lieu: {
    type: String,
    default: 'En ligne'
  },
  notes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
formateurProgrammeSchema.index({ formateurId: 1, dateDebut: -1 });
formateurProgrammeSchema.index({ statut: 1 });

// Méthode virtuelle pour calculer la durée automatiquement
formateurProgrammeSchema.pre('save', function(next) {
  if (this.dateDebut && this.dateFin) {
    const diffTime = Math.abs(this.dateFin - this.dateDebut);
    this.duree.jours = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  next();
});

export default mongoose.model('FormateurProgramme', formateurProgrammeSchema);
