import mongoose from 'mongoose';

const PortfolioExampleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  detail: {
    type: String,
    required: true,
    trim: true
  },
  link: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  }
});

const PortfolioCardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  result: {
    type: String,
    trim: true
  },
  emoji: {
    type: String,
    trim: true
  },
  examples: [PortfolioExampleSchema]
});

const DigitalizationPortfolioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Portfolio & Réalisations'
  },
  intro: {
    type: String,
    required: true,
    default: 'Découvrez les résultats concrets obtenus pour nos clients'
  },
  cards: [PortfolioCardSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create default data if none exists
DigitalizationPortfolioSchema.statics.createDefault = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    const defaultPortfolio = new this({
      title: 'Portfolio & Réalisations',
      intro: 'Découvrez les résultats concrets obtenus pour nos clients',
      cards: [
        {
          title: 'Transformation E-commerce',
          description: 'Lancement boutique + campagnes acquisition',
          result: '+300% ventes',
          emoji: '🛒',
          examples: [
            {
              name: 'Boutique Alpha',
              detail: 'Migration Shopify + campagnes Meta/Google → CA x3 en 4 mois',
              link: '#case-boutique-alpha',
              imageUrl: 'https://images.unsplash.com/photo-1515165562835-c3b8c2e5d3c4?q=80&w=400&auto=format&fit=crop'
            },
            {
              name: 'ModeLine',
              detail: 'Optimisation checkout et upsell → +22% panier moyen',
              link: '#case-modeline'
            },
            {
              name: 'TechGear',
              detail: 'Emailing automation (Klaviyo) → +35% revenus récurrents',
              link: '#case-techgear'
            }
          ]
        },
        {
          title: 'Automatisation RH',
          description: 'Onboarding, signature, suivi candidats',
          result: '-70% temps',
          emoji: '🤖',
          examples: [
            {
              name: 'HRPro',
              detail: 'Flux onboarding automatisé (Zapier) → -70% temps administratif',
              link: '#case-hrpro'
            },
            {
              name: 'EduNext',
              detail: 'Signature électronique + suivi candidats → délais divisés par 2',
              link: '#case-edunext'
            },
            {
              name: 'AgriSmart',
              detail: 'Portail self-service employés → -40% tickets support',
              link: '#case-agri'
            }
          ]
        },
        {
          title: 'Présence Digitale',
          description: 'Site, SEO, social, branding',
          result: '+250% visibilité',
          emoji: '✨',
          examples: [
            {
              name: 'FinSolve',
              detail: 'SEO + contenu LinkedIn → +250% impressions organiques',
              link: '#case-finsolve'
            },
            {
              name: 'RetailPlus',
              detail: 'Refonte site + social kit → +180% trafic qualifié',
              link: '#case-retailplus'
            },
            {
              name: 'StartupXYZ',
              detail: 'Branding cohérent + blog → 3x leads marketing',
              link: '#case-startupxyz'
            }
          ]
        }
      ]
    });
    
    await defaultPortfolio.save();
    console.log('✅ Default digitalization portfolio created');
    return defaultPortfolio;
  }
};

export default mongoose.model('DigitalizationPortfolio', DigitalizationPortfolioSchema);
