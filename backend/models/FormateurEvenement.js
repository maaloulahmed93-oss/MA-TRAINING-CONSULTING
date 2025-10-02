import mongoose from 'mongoose';

const formateurEvenementSchema = new mongoose.Schema({
  formateurId: {
    type: String,
    required: true,
    ref: 'Partner'
  },
  programmeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FormateurProgramme'
  },
  sujet: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  heureDebut: {
    type: String,
    required: true // Format: "14:00"
  },
  heureFin: {
    type: String,
    required: true // Format: "16:00"
  },
  dureeMinutes: {
    type: Number,
    default: function() {
      if (this.heureDebut && this.heureFin) {
        const [startH, startM] = this.heureDebut.split(':').map(Number);
        const [endH, endM] = this.heureFin.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        return endMinutes - startMinutes;
      }
      return 0;
    }
  },
  type: {
    type: String,
    enum: ['reunion', 'formation', 'conference', 'webinaire', 'entretien', 'autre'],
    default: 'reunion'
  },
  lieu: {
    type: String,
    default: 'En ligne'
  },
  lienVisio: {
    type: String
  },
  participants: [{
    nom: String,
    email: String,
    confirme: {
      type: Boolean,
      default: false
    }
  }],
  statut: {
    type: String,
    enum: ['planifie', 'en_cours', 'termine', 'annule', 'reporte'],
    default: 'planifie'
  },
  priorite: {
    type: String,
    enum: ['basse', 'normale', 'haute', 'urgente'],
    default: 'normale'
  },
  rappels: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'notification']
    },
    delai: {
      type: Number // en minutes avant l'événement
    },
    envoye: {
      type: Boolean,
      default: false
    }
  }],
  documents: [{
    nom: String,
    url: String,
    type: String
  }],
  notes: {
    type: String
  },
  couleur: {
    type: String,
    default: '#3B82F6' // Bleu par défaut
  },
  isRecurrent: {
    type: Boolean,
    default: false
  },
  recurrence: {
    frequence: {
      type: String,
      enum: ['quotidien', 'hebdomadaire', 'mensuel']
    },
    finRecurrence: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
formateurEvenementSchema.index({ formateurId: 1, date: -1 });
formateurEvenementSchema.index({ programmeId: 1, date: 1 });
formateurEvenementSchema.index({ statut: 1 });
formateurEvenementSchema.index({ type: 1 });
formateurEvenementSchema.index({ date: 1, heureDebut: 1 });

// Calculer la durée automatiquement
formateurEvenementSchema.pre('save', function(next) {
  if (this.heureDebut && this.heureFin) {
    const [startH, startM] = this.heureDebut.split(':').map(Number);
    const [endH, endM] = this.heureFin.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    this.dureeMinutes = endMinutes - startMinutes;
  }
  next();
});

// Méthode pour vérifier les conflits d'horaires
formateurEvenementSchema.statics.verifierConflits = async function(formateurId, date, heureDebut, heureFin, excludeId = null) {
  const query = {
    formateurId,
    date,
    statut: { $ne: 'annule' },
    $or: [
      {
        $and: [
          { heureDebut: { $lte: heureDebut } },
          { heureFin: { $gt: heureDebut } }
        ]
      },
      {
        $and: [
          { heureDebut: { $lt: heureFin } },
          { heureFin: { $gte: heureFin } }
        ]
      },
      {
        $and: [
          { heureDebut: { $gte: heureDebut } },
          { heureFin: { $lte: heureFin } }
        ]
      }
    ]
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return await this.find(query);
};

export default mongoose.model('FormateurEvenement', formateurEvenementSchema);
