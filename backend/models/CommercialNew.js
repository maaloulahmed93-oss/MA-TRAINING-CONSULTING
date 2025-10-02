import mongoose from 'mongoose';

// Nouveau modèle Commercial avec système 3 niveaux
const commercialNewSchema = new mongoose.Schema({
  // Informations de base
  partnerId: {
    type: String,
    required: true,
    unique: true,
    match: /^COM-\d{6}$/
  },
  
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  phone: {
    type: String,
    trim: true
  },
  
  // Système de niveaux (3 niveaux)
  niveau: {
    type: Number,
    enum: [1, 2, 3],
    default: 1
  },
  
  // Système de points (5 points par vente confirmée)
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Points historiques (pour garantie niveau 3)
  pointsHistoriques: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Chiffre d'affaires (niveau 2)
  chiffreAffaires: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Commission totale accumulée
  commissionTotale: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Statut de transfert (pour passage niveau 3)
  transfertEffectue: {
    type: Boolean,
    default: false
  },
  
  montantTransfert: {
    type: Number,
    default: 0,
    min: 0
  },
  
  dateTransfert: Date,
  
  // Cadeaux mensuels (niveau 3)
  cadeauxMensuels: [{
    mois: {
      type: String,
      match: /^\d{4}-\d{2}$/ // Format: 2025-09
    },
    valeur: {
      type: Number,
      default: 5
    },
    dateAjout: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Clients gérés (niveau 2+)
  clients: [{
    id: String,
    nom: String,
    prenom: String,
    email: String,
    tel: String,
    status: {
      type: String,
      enum: ['nouveau', 'payé', 'annulé', 'en_attente'],
      default: 'nouveau'
    },
    programme: String,
    montant: Number,
    dateAjout: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Ventes/Programmes vendus
  ventes: [{
    id: String,
    client: String,
    clientEmail: String,
    programme: String,
    montant: Number,
    commission: Number,
    status: {
      type: String,
      enum: ['confirmé', 'en_attente', 'annulé'],
      default: 'en_attente'
    },
    date: {
      type: Date,
      default: Date.now
    },
    methodePaiement: String
  }],
  
  // Programmes/Services attribués par Admin
  servicesAttribues: [{
    id: String,
    titre: String,
    prix: Number,
    commission: Number,
    dateAjout: {
      type: Date,
      default: Date.now
    },
    ajoutePar: String // Admin ID
  }],
  
  // Historique des niveaux
  historiqueNiveaux: [{
    ancienNiveau: Number,
    nouveauNiveau: Number,
    dateChangement: {
      type: Date,
      default: Date.now
    },
    raison: String
  }],
  
  // Dates importantes
  dateInscription: {
    type: Date,
    default: Date.now
  },
  
  dernierActivite: {
    type: Date,
    default: Date.now
  },
  
  // Statut actif
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
commercialNewSchema.index({ partnerId: 1 });
commercialNewSchema.index({ email: 1 });
commercialNewSchema.index({ niveau: 1 });
commercialNewSchema.index({ points: 1 });
commercialNewSchema.index({ chiffreAffaires: 1 });

// Middleware pour mise à jour automatique des niveaux
commercialNewSchema.pre('save', function(next) {
  // Niveau 1 → 2: 1000 points
  if (this.niveau === 1 && this.points >= 1000) {
    this.niveau = 2;
    this.historiqueNiveaux.push({
      ancienNiveau: 1,
      nouveauNiveau: 2,
      raison: '1000 points atteints'
    });
  }
  
  // Niveau 2 → 3: 500€ transférés
  if (this.niveau === 2 && this.transfertEffectue && this.montantTransfert >= 500) {
    this.niveau = 3;
    this.historiqueNiveaux.push({
      ancienNiveau: 2,
      nouveauNiveau: 3,
      raison: '500€ transférés vers entreprise'
    });
  }
  
  this.dernierActivite = new Date();
  next();
});

// Méthodes d'instance
commercialNewSchema.methods.ajouterVente = function(venteData) {
  const nouvelleVente = {
    id: `vente-${Date.now()}`,
    ...venteData,
    date: new Date()
  };
  
  this.ventes.push(nouvelleVente);
  
  // Si vente confirmée, ajouter points et CA
  if (venteData.status === 'confirmé') {
    this.points += 5; // 5 points par vente confirmée
    this.pointsHistoriques += 5;
    this.chiffreAffaires += venteData.montant;
    this.commissionTotale += venteData.commission;
  }
  
  return this.save();
};

commercialNewSchema.methods.ajouterClient = function(clientData) {
  const nouveauClient = {
    id: `client-${Date.now()}`,
    ...clientData,
    dateAjout: new Date()
  };
  
  this.clients.push(nouveauClient);
  return this.save();
};

commercialNewSchema.methods.effectuerTransfert = function(montant) {
  if (this.niveau >= 2 && montant >= 500) {
    this.transfertEffectue = true;
    this.montantTransfert = montant;
    this.dateTransfert = new Date();
    return this.save();
  }
  throw new Error('Conditions de transfert non remplies');
};

commercialNewSchema.methods.ajouterCadeauMensuel = function() {
  if (this.niveau === 3) {
    const maintenant = new Date();
    const moisCourant = `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, '0')}`;
    
    // Vérifier si cadeau déjà ajouté ce mois
    const dejaAjoute = this.cadeauxMensuels.some(c => c.mois === moisCourant);
    
    if (!dejaAjoute) {
      this.cadeauxMensuels.push({
        mois: moisCourant,
        valeur: 5,
        dateAjout: new Date()
      });
      this.commissionTotale += 5;
      return this.save();
    }
  }
  return Promise.resolve(this);
};

// Méthodes statiques
commercialNewSchema.statics.getStatistiques = async function(partnerId) {
  const commercial = await this.findOne({ partnerId, isActive: true });
  if (!commercial) return null;
  
  const ventesConfirmees = commercial.ventes.filter(v => v.status === 'confirmé');
  const clientsPayes = commercial.clients.filter(c => c.status === 'payé');
  
  return {
    niveau: commercial.niveau,
    points: commercial.points,
    chiffreAffaires: commercial.chiffreAffaires,
    commissionTotale: commercial.commissionTotale,
    totalVentes: ventesConfirmees.length,
    totalClients: clientsPayes.length,
    cadeauxMensuels: commercial.cadeauxMensuels.length,
    transfertEffectue: commercial.transfertEffectue,
    montantTransfert: commercial.montantTransfert
  };
};

commercialNewSchema.statics.ajouterCadeauxMensuelsAuto = async function() {
  const commerciauxNiveau3 = await this.find({ niveau: 3, isActive: true });
  
  for (const commercial of commerciauxNiveau3) {
    await commercial.ajouterCadeauMensuel();
  }
  
  return commerciauxNiveau3.length;
};

const CommercialNew = mongoose.model('CommercialNew', commercialNewSchema);

export default CommercialNew;
