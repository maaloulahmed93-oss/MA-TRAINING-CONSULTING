import mongoose from 'mongoose';

const commercialDealSchema = new mongoose.Schema({
  // Référence au partenaire commercial
  commercialId: {
    type: String,
    required: true,
    ref: 'Partner',
    index: true
  },
  
  // Informations de la deal/transaction
  dealTitle: {
    type: String,
    required: true,
    trim: true
  },
  
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  
  clientType: {
    type: String,
    enum: ['particulier', 'entreprise', 'institution'],
    required: true
  },
  
  clientEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  clientPhone: {
    type: String,
    trim: true
  },
  
  clientAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: { type: String, default: 'Tunisie' }
  },
  
  // Détails de la transaction
  serviceType: {
    type: String,
    enum: ['formation', 'consultation', 'pack', 'certification', 'autre'],
    required: true
  },
  
  serviceDescription: {
    type: String,
    required: true
  },
  
  // Montants financiers
  montantTotal: {
    type: Number,
    required: true,
    min: 0
  },
  
  devise: {
    type: String,
    enum: ['EUR', 'TND', 'USD'],
    default: 'EUR'
  },
  
  // Commission du commercial
  tauxCommission: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 10 // 10% par défaut
  },
  
  montantCommission: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Statut de la deal
  statutDeal: {
    type: String,
    enum: ['prospect', 'negociation', 'signee', 'en_cours', 'terminee', 'annulee'],
    default: 'prospect'
  },
  
  // Statut du paiement
  statutPaiement: {
    type: String,
    enum: ['en_attente', 'partiel', 'complet', 'rembourse'],
    default: 'en_attente'
  },
  
  // Dates importantes
  dateProspection: {
    type: Date,
    default: Date.now
  },
  
  dateSignature: Date,
  dateDebutService: Date,
  dateFinService: Date,
  
  // Documents associés
  documents: {
    contrats: [String], // Chemins des fichiers contrats
    factures: [String], // Chemins des fichiers factures
    devis: [String], // Chemins des fichiers devis
    autres: [String] // Autres documents
  },
  
  // Notes et commentaires
  notes: [{
    contenu: String,
    dateAjout: {
      type: Date,
      default: Date.now
    },
    auteur: String // ID du commercial ou admin
  }],
  
  // Historique des modifications
  historique: [{
    action: String,
    ancienneValeur: String,
    nouvelleValeur: String,
    dateModification: {
      type: Date,
      default: Date.now
    },
    modifiePar: String
  }],
  
  // Métriques et KPIs
  metriques: {
    tempsNegociation: Number, // en jours
    tauxConversion: Number,
    satisfactionClient: {
      type: Number,
      min: 1,
      max: 5
    },
    probabiliteReussite: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  // Informations de suivi
  prochaineSuivi: Date,
  frequenceSuivi: {
    type: String,
    enum: ['quotidien', 'hebdomadaire', 'mensuel', 'trimestriel'],
    default: 'hebdomadaire'
  },
  
  // Tags pour classification
  tags: [String],
  
  // Priorité
  priorite: {
    type: String,
    enum: ['basse', 'normale', 'haute', 'urgente'],
    default: 'normale'
  },
  
  // Référence externe (numéro de dossier, etc.)
  referenceExterne: String,
  
  // Actif/Inactif
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index composés pour optimiser les requêtes
commercialDealSchema.index({ commercialId: 1, statutDeal: 1 });
commercialDealSchema.index({ commercialId: 1, dateProspection: -1 });
commercialDealSchema.index({ statutDeal: 1, dateProspection: -1 });
commercialDealSchema.index({ clientEmail: 1 });
commercialDealSchema.index({ serviceType: 1 });

// Middleware pour calculer automatiquement la commission
commercialDealSchema.pre('save', function(next) {
  if (this.isModified('montantTotal') || this.isModified('tauxCommission')) {
    this.montantCommission = (this.montantTotal * this.tauxCommission) / 100;
  }
  next();
});

// Méthodes d'instance
commercialDealSchema.methods.calculerTempsNegociation = function() {
  if (this.dateSignature && this.dateProspection) {
    const diffTime = Math.abs(this.dateSignature - this.dateProspection);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.metriques.tempsNegociation = diffDays;
    return diffDays;
  }
  return null;
};

commercialDealSchema.methods.ajouterNote = function(contenu, auteur) {
  this.notes.push({
    contenu,
    auteur,
    dateAjout: new Date()
  });
  return this.save();
};

commercialDealSchema.methods.changerStatut = function(nouveauStatut, modifiePar) {
  const ancienStatut = this.statutDeal;
  this.statutDeal = nouveauStatut;
  
  this.historique.push({
    action: 'Changement de statut',
    ancienneValeur: ancienStatut,
    nouvelleValeur: nouveauStatut,
    modifiePar
  });
  
  // Mettre à jour les dates selon le statut
  if (nouveauStatut === 'signee' && !this.dateSignature) {
    this.dateSignature = new Date();
  }
  
  return this.save();
};

// Méthodes statiques
commercialDealSchema.statics.getStatistiquesCommercial = async function(commercialId) {
  const pipeline = [
    { $match: { commercialId, isActive: true } },
    {
      $group: {
        _id: null,
        totalDeals: { $sum: 1 },
        chiffreAffaireTotal: { $sum: '$montantTotal' },
        commissionTotale: { $sum: '$montantCommission' },
        dealsSignees: {
          $sum: { $cond: [{ $eq: ['$statutDeal', 'signee'] }, 1, 0] }
        },
        dealsEnCours: {
          $sum: { $cond: [{ $eq: ['$statutDeal', 'en_cours'] }, 1, 0] }
        },
        dealsTerminees: {
          $sum: { $cond: [{ $eq: ['$statutDeal', 'terminee'] }, 1, 0] }
        }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalDeals: 0,
    chiffreAffaireTotal: 0,
    commissionTotale: 0,
    dealsSignees: 0,
    dealsEnCours: 0,
    dealsTerminees: 0
  };
};

const CommercialDeal = mongoose.model('CommercialDeal', commercialDealSchema);

export default CommercialDeal;
