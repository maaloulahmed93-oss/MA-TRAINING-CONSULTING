import mongoose from 'mongoose';

const digitalizationProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Démo & Produits Prêts'
  },
  intro: {
    type: String,
    required: true,
    default: 'Découvrez nos solutions en action et testez nos produits avant de vous engager'
  },
  products: [{
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    details: [{
      type: String,
      required: true
    }],
    mailtoSubject: {
      type: String,
      required: true
    },
    demoLink: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['web', 'marketing', 'ecommerce', 'automation'],
      default: 'web'
    },
    isActive: {
      type: Boolean,
      default: true
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
digitalizationProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create default products if none exist
digitalizationProductSchema.statics.createDefault = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    const defaultProducts = new this({
      title: 'Démo & Produits Prêts',
      intro: 'Découvrez nos solutions en action et testez nos produits avant de vous engager',
      products: [
        {
          id: 'site-web-demo',
          title: 'Site Web Démo',
          description: 'Site vitrine professionnel avec accès test complet',
          imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop',
          details: [
            'Hébergement et domaine inclus (démo)',
            'Design responsive multi-plateformes',
            'Formulaire de contact et pages essentielles'
          ],
          mailtoSubject: 'Plus d\'infos - Site Web Démo',
          demoLink: '#demo-site',
          category: 'web'
        },
        {
          id: 'pack-publications',
          title: 'Pack Publications Pro',
          description: 'Affiches et contenus visuels professionnels prêts à utiliser',
          imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop',
          details: [
            'Templates multi-format (feed, story, reels)',
            'Charte graphique cohérente',
            'Calendrier éditorial de 30 jours'
          ],
          mailtoSubject: 'Plus d\'infos - Pack Publications Pro',
          demoLink: '#demo-publications',
          category: 'marketing'
        },
        {
          id: 'ecommerce-testable',
          title: 'E-commerce Testable',
          description: 'Plateforme de vente en ligne complète et personnalisable',
          imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1600&auto=format&fit=crop',
          details: [
            'Catalogue produits et gestion panier',
            'Paiement test (sandbox) et factures',
            'Dashboard commandes et clients'
          ],
          mailtoSubject: 'Plus d\'infos - E-commerce Testable',
          demoLink: '#demo-ecommerce',
          category: 'ecommerce'
        },
        {
          id: 'campagnes-sponsoring',
          title: 'Campagnes Sponsoring',
          description: 'Campagnes publicitaires optimisées prêtes à lancer',
          imageUrl: 'https://images.unsplash.com/photo-1543286386-2e659306cd6c?q=80&w=1600&auto=format&fit=crop',
          details: [
            'Ciblage précis et audiences lookalike',
            'Cohortes tests et A/B testing',
            'Rapports de performance clairs'
          ],
          mailtoSubject: 'Plus d\'infos - Campagnes Sponsoring',
          demoLink: '#demo-campaigns',
          category: 'marketing'
        }
      ]
    });
    
    await defaultProducts.save();
    console.log('✅ Default digitalization products created');
    return defaultProducts;
  }
};

export default mongoose.model('DigitalizationProduct', digitalizationProductSchema);
