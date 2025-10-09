import mongoose from 'mongoose';

const DigitalizationTestimonialsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Témoignages Clients'
  },
  subtitle: {
    type: String,
    required: true,
    default: 'Ce que disent nos clients de nos services de digitalisation'
  },
  testimonials: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    avatar: {
      type: String,
      trim: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create default data if none exists
DigitalizationTestimonialsSchema.statics.createDefault = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    const defaultTestimonials = new this({
      title: 'Témoignages Clients',
      subtitle: 'Ce que disent nos clients de nos services de digitalisation',
      testimonials: [
        {
          name: 'Sarah Dubois',
          company: 'TechStart SAS',
          rating: 5,
          comment: 'Transformation digitale exceptionnelle ! Notre productivité a doublé en 3 mois.',
          avatar: 'SD'
        },
        {
          name: 'Ahmed Benali',
          company: 'Commerce Plus',
          rating: 5,
          comment: 'L\'équipe a créé notre e-commerce de A à Z. Résultats au-delà de nos attentes !',
          avatar: 'AB'
        },
        {
          name: 'Marie Laurent',
          company: 'Consulting Pro',
          rating: 5,
          comment: 'Support 24/7 exceptionnel et formations très pratiques. Je recommande vivement !',
          avatar: 'ML'
        },
        {
          name: 'Amel Rekik',
          company: 'RetailPlus',
          rating: 5,
          comment: 'Nos ventes en ligne ont doublé grâce à leur stratégie et automatisation marketing.',
          avatar: 'AR'
        },
        {
          name: 'Mohamed Ali Saidi',
          company: 'EduNext',
          rating: 5,
          comment: 'Plateforme e-learning livrée à temps, UX impeccable et support réactif.',
          avatar: 'MS'
        },
        {
          name: 'Ines Bouaziz',
          company: 'FinSolve',
          rating: 4,
          comment: 'Tableaux de bord clairs, décisions plus rapides. Très bon rapport qualité/prix.',
          avatar: 'IB'
        }
      ]
    });
    
    await defaultTestimonials.save();
    console.log('✅ Default digitalization testimonials created');
    return defaultTestimonials;
  }
};

export default mongoose.model('DigitalizationTestimonials', DigitalizationTestimonialsSchema);
