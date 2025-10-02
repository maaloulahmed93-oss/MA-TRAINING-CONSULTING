import mongoose from 'mongoose';

const formateurSeanceSchema = new mongoose.Schema({
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
  numero: {
    type: String,
    required: true // ex: S1, S2, S3...
  },
  module: {
    type: String,
    required: true,
    trim: true // ex: SEO, Branding, Marketing Digital...
  },
  titre: {
    type: String,
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
    required: true // Format: "09:00"
  },
  heureFin: {
    type: String,
    required: true // Format: "12:00"
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
  lieu: {
    type: String,
    default: 'En ligne'
  },
  lienVisio: {
    type: String
  },
  supports: [{
    nom: String,
    url: String,
    type: String // pdf, ppt, doc...
  }],
  statut: {
    type: String,
    enum: ['planifiee', 'en_cours', 'terminee', 'annulee'],
    default: 'planifiee'
  },
  participantsPresents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FormateurParticipant'
  }],
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
formateurSeanceSchema.index({ programmeId: 1, date: 1 });
formateurSeanceSchema.index({ formateurId: 1, date: -1 });
formateurSeanceSchema.index({ statut: 1 });

// Calculer la durée automatiquement
formateurSeanceSchema.pre('save', function(next) {
  if (this.heureDebut && this.heureFin) {
    const [startH, startM] = this.heureDebut.split(':').map(Number);
    const [endH, endM] = this.heureFin.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    this.dureeMinutes = endMinutes - startMinutes;
  }
  next();
});

export default mongoose.model('FormateurSeance', formateurSeanceSchema);
