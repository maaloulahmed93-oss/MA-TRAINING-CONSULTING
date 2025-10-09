import mongoose from 'mongoose';

const siteConfigSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true,
    default: '3d MA-TRAINING-CONSULTING',
    trim: true,
    maxlength: 100
  },
  siteTitle: {
    type: String,
    required: true,
    default: '3d MA-TRAINING-CONSULTING - Formation et Consulting',
    trim: true,
    maxlength: 200
  },
  siteDescription: {
    type: String,
    default: 'Centre de formation professionnelle et consulting en Tunisie',
    trim: true,
    maxlength: 500
  },
  favicon: {
    type: String,
    default: '/favicon.ico',
    trim: true
  },
  logo: {
    type: String,
    default: '/logo.png',
    trim: true
  },
  primaryColor: {
    type: String,
    default: '#3B82F6',
    trim: true
  },
  secondaryColor: {
    type: String,
    default: '#1E40AF',
    trim: true
  },
  contactEmail: {
    type: String,
    default: 'contact@ma-training-consulting.com',
    trim: true
  },
  contactPhone: {
    type: String,
    default: '+216 XX XXX XXX',
    trim: true
  },
  address: {
    type: String,
    default: 'Tunis, Tunisie',
    trim: true
  },
  socialMedia: {
    facebook: { type: String, default: '', trim: true },
    linkedin: { type: String, default: '', trim: true },
    twitter: { type: String, default: '', trim: true },
    instagram: { type: String, default: '', trim: true }
  },
  seo: {
    keywords: {
      type: String,
      default: 'formation, consulting, tunisie, professionnelle',
      trim: true
    },
    googleAnalytics: { type: String, default: '', trim: true },
    googleTagManager: { type: String, default: '', trim: true }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour mettre à jour updatedAt
siteConfigSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode statique pour obtenir la configuration active
siteConfigSchema.statics.getActiveConfig = async function() {
  let config = await this.findOne({ isActive: true });
  
  // Si aucune configuration n'existe, créer une configuration par défaut
  if (!config) {
    config = new this({
      siteName: '3d MA-TRAINING-CONSULTING',
      siteTitle: '3d MA-TRAINING-CONSULTING - Formation et Consulting',
      siteDescription: 'Centre de formation professionnelle et consulting en Tunisie',
      isActive: true
    });
    await config.save();
  }
  
  return config;
};

// Index pour optimiser les requêtes
siteConfigSchema.index({ isActive: 1 });
siteConfigSchema.index({ updatedAt: -1 });

export default mongoose.model('SiteConfig', siteConfigSchema);
