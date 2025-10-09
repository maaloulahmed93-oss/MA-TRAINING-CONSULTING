import mongoose from 'mongoose';

const digitalizationServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Nos Services'
  },
  intro: {
    type: String,
    required: true,
    default: 'Des prestations complètes pour propulser votre transformation digitale'
  },
  services: [{
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    items: [{
      type: String,
      required: true
    }],
    icon: {
      type: String,
      default: 'Globe'
    },
    color: {
      type: String,
      default: 'blue'
    },
    gradient: {
      type: String,
      default: 'from-blue-500 to-blue-600'
    }
  }],
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

// Middleware to update updatedAt on save
digitalizationServiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create default services if none exist
digitalizationServiceSchema.statics.createDefault = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    const defaultServices = new this({
      title: 'Nos Services',
      intro: 'Des solutions complètes pour digitaliser votre entreprise et optimiser vos performances',
      services: [
        {
          id: 'creation',
          title: 'Création digitale & présence en ligne',
          items: [
            'Site web vitrine avec démo',
            'Plateforme e-commerce prête à l\'emploi',
            'Packs publications (affiches, vidéos)',
            'Sponsoring & campagnes réseaux sociaux'
          ],
          icon: 'Globe',
          color: 'blue',
          gradient: 'from-blue-500 to-blue-600'
        },
        {
          id: 'automation',
          title: 'Automatisation & Applications IA',
          items: [
            'Automatisation des processus internes',
            'Applications IA sur mesure',
            'Marketing automatisé',
            'Analyse BI & rapports'
          ],
          icon: 'Bot',
          color: 'purple',
          gradient: 'from-purple-500 to-purple-600'
        },
        {
          id: 'training',
          title: 'Accompagnement & formation',
          items: [
            'Certification ISO',
            'Transformation digitale sur mesure',
            'Formations pratiques'
          ],
          icon: 'GraduationCap',
          color: 'green',
          gradient: 'from-green-500 to-green-600'
        },
        {
          id: 'saas',
          title: 'Solutions (SaaS)',
          items: [
            'ERP modulaire',
            'CRM en ligne',
            'Gestion réseaux sociaux avec IA',
            'Plateforme e-commerce + maintenance'
          ],
          icon: 'Database',
          color: 'orange',
          gradient: 'from-orange-500 to-orange-600'
        }
      ]
    });
    
    await defaultServices.save();
    console.log('✅ Default digitalization services created');
    return defaultServices;
  }
};

export default mongoose.model('DigitalizationService', digitalizationServiceSchema);
