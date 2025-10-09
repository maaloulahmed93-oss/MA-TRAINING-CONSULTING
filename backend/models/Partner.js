import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema({
  // ID unique généré automatiquement (FOR-123456, FRE-123456, etc.)
  partnerId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Informations de base
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
    lowercase: true
  },
  
  // Champs spécifiques aux entreprises
  contactPerson: {
    type: String,
    trim: true
  },
  
  phone: {
    type: String,
    trim: true
  },
  
  address: {
    type: String,
    trim: true
  },
  
  website: {
    type: String,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  joinDate: {
    type: Date,
    default: Date.now
  },
  
  // Type de partenaire
  type: {
    type: String,
    required: true,
    enum: ['formateur', 'freelancer', 'commercial', 'entreprise', 'participant']
  },
  
  // Mot de passe optionnel pour l'accès à l'espace
  password: {
    type: String,
    default: null
  },
  
  // Statut du compte
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Date de création
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Dernière connexion
  lastLogin: {
    type: Date,
    default: null
  },
  
  // Informations supplémentaires pour formateurs
  formateurInfo: {
    specialites: [String], // Spécialités du formateur
    experience: Number, // Années d'expérience
    certifications: [String], // Certifications
    tarifHoraire: Number, // Tarif par heure
    disponibilite: {
      type: String,
      enum: ['disponible', 'occupe', 'indisponible'],
      default: 'disponible'
    }
  }
}, {
  timestamps: true
});

// Index pour recherche rapide par type
partnerSchema.index({ type: 1 });

const Partner = mongoose.model('Partner', partnerSchema);

export default Partner;
