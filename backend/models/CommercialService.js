import mongoose from 'mongoose';

// Modèle pour les services/programmes attribués aux commerciaux
const commercialServiceSchema = new mongoose.Schema({
  // Service/Programme info
  titre: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  categorie: {
    type: String,
    trim: true
  },
  
  // Prix et commissions
  prixPublic: {
    type: Number,
    required: true,
    min: 0
  },
  
  prixCommercial: {
    type: Number,
    required: true,
    min: 0
  },
  
  commission: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Durée et détails
  duree: {
    type: String,
    trim: true
  },
  
  // Commerciaux ayant accès à ce service
  commerciauxAutorises: [{
    partnerId: {
      type: String,
      required: true
    },
    dateAjout: {
      type: Date,
      default: Date.now
    },
    ajoutePar: String // Admin ID
  }],
  
  // Statistiques d'utilisation
  statistiques: {
    totalVentes: {
      type: Number,
      default: 0
    },
    chiffreAffaireGenere: {
      type: Number,
      default: 0
    },
    commissionTotalePayee: {
      type: Number,
      default: 0
    }
  },
  
  // Métadonnées
  creePar: {
    type: String,
    required: true // Admin ID
  },
  
  dateCreation: {
    type: Date,
    default: Date.now
  },
  
  derniereMiseAJour: {
    type: Date,
    default: Date.now
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index
commercialServiceSchema.index({ titre: 1 });
commercialServiceSchema.index({ categorie: 1 });
commercialServiceSchema.index({ 'commerciauxAutorises.partnerId': 1 });

// Middleware
commercialServiceSchema.pre('save', function(next) {
  this.derniereMiseAJour = new Date();
  next();
});

// Méthodes d'instance
commercialServiceSchema.methods.ajouterCommercial = function(partnerId, adminId) {
  // Vérifier si déjà autorisé
  const dejaAutorise = this.commerciauxAutorises.some(c => c.partnerId === partnerId);
  
  if (!dejaAutorise) {
    this.commerciauxAutorises.push({
      partnerId,
      ajoutePar: adminId,
      dateAjout: new Date()
    });
  }
  
  return this.save();
};

commercialServiceSchema.methods.retirerCommercial = function(partnerId) {
  this.commerciauxAutorises = this.commerciauxAutorises.filter(c => c.partnerId !== partnerId);
  return this.save();
};

commercialServiceSchema.methods.mettreAJourStatistiques = function(montantVente, commission) {
  this.statistiques.totalVentes += 1;
  this.statistiques.chiffreAffaireGenere += montantVente;
  this.statistiques.commissionTotalePayee += commission;
  return this.save();
};

// Méthodes statiques
commercialServiceSchema.statics.getServicesCommercial = async function(partnerId) {
  return await this.find({
    'commerciauxAutorises.partnerId': partnerId,
    isActive: true
  }).select('-commerciauxAutorises');
};

commercialServiceSchema.statics.verifierAcces = async function(serviceId, partnerId) {
  const service = await this.findById(serviceId);
  if (!service) return false;
  
  return service.commerciauxAutorises.some(c => c.partnerId === partnerId);
};

const CommercialService = mongoose.model('CommercialService', commercialServiceSchema);

export default CommercialService;
