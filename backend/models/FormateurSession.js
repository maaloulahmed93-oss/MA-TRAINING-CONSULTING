import mongoose from 'mongoose';

const formateurSessionSchema = new mongoose.Schema({
  // Référence au partenaire formateur
  formateurId: {
    type: String,
    required: true,
    ref: 'Partner'
  },
  
  // Informations de la session/programme
  titre: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  // Catégorie du programme
  categorie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  
  // Niveau du programme
  niveau: {
    type: String,
    enum: ['Débutant', 'Intermédiaire', 'Avancé'],
    required: true
  },
  
  // Durée et planning
  duree: {
    heures: Number, // Durée totale en heures
    semaines: Number, // Durée en semaines
    sessions: Number // Nombre de sessions
  },
  
  // Prix et revenus
  prix: {
    type: Number,
    required: true
  },
  
  // Participants
  participants: [{
    nom: String,
    email: String,
    telephone: String,
    dateInscription: {
      type: Date,
      default: Date.now
    },
    statut: {
      type: String,
      enum: ['inscrit', 'en_cours', 'termine', 'abandonne'],
      default: 'inscrit'
    },
    noteFinale: Number,
    attestationGeneree: {
      type: Boolean,
      default: false
    }
  }],
  
  // Revenus du formateur
  revenus: {
    montantTotal: Number,
    commission: Number, // Commission MATC
    montantFormateur: Number, // Montant pour le formateur
    statutPaiement: {
      type: String,
      enum: ['en_attente', 'paye', 'reporte'],
      default: 'en_attente'
    }
  },
  
  // Documents uploadés
  documents: {
    attestations: [String], // Chemins des fichiers
    evaluations: [String],
    recommandations: [String],
    supports: [String] // Supports de cours
  },
  
  // Statut de la session
  statut: {
    type: String,
    enum: ['planifiee', 'en_cours', 'terminee', 'annulee'],
    default: 'planifiee'
  },
  
  // Dates importantes
  dateDebut: Date,
  dateFin: Date,
  
  // Évaluations et feedback
  evaluations: [{
    participant: String,
    note: Number,
    commentaire: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Statistiques
  stats: {
    nombreParticipants: {
      type: Number,
      default: 0
    },
    tauxReussite: {
      type: Number,
      default: 0
    },
    noteMoyenne: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index pour recherche rapide
formateurSessionSchema.index({ formateurId: 1, statut: 1 });
formateurSessionSchema.index({ dateDebut: 1, dateFin: 1 });
formateurSessionSchema.index({ categorie: 1 });

const FormateurSession = mongoose.model('FormateurSession', formateurSessionSchema);

export default FormateurSession;
