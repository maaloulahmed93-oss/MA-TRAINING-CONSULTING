import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  skills: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    required: true,
    enum: ['Intermédiaire', 'Avancé', 'Expert'],
    default: 'Intermédiaire'
  },
  progress: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  badge: {
    type: String,
    trim: true,
    default: ''
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  // Champs pour l'affichage sur le site principal
  avatar: {
    type: String,
    default: '' // URL de l'avatar ou initiales
  },
  company: {
    type: String,
    trim: true,
    default: ''
  },
  // Métadonnées
  createdBy: {
    type: String,
    default: 'admin'
  },
  updatedBy: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances
testimonialSchema.index({ isPublished: 1 });
testimonialSchema.index({ category: 1 });
testimonialSchema.index({ level: 1 });
testimonialSchema.index({ createdAt: -1 });

// Virtual pour les initiales
testimonialSchema.virtual('initials').get(function() {
  if (!this.name) return '';
  return this.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
});

// Méthode statique pour créer des données par défaut
testimonialSchema.statics.createDefault = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    const defaultTestimonials = [
      {
        name: "Sarah Benlahsen",
        position: "DevOps Engineer",
        skills: "React, Node.js",
        category: "Développement Full-Stack",
        level: "Expert",
        progress: 100,
        content: "Grâce à VirtualClass Pro, j'ai pu maîtriser les technologies modernes et décrocher un poste de Lead Developer...",
        badge: "TOP des participants",
        isPublished: true,
        rating: 5,
        company: "TechCorp"
      },
      {
        name: "Mohamed Alami",
        position: "Business Analyst",
        skills: "Leadership, Management",
        category: "Leadership stratégique",
        level: "Avancé",
        progress: 75,
        content: "L'approche personnalisée et l'expertise des formateurs m'ont permis de développer mes compétences en leadership...",
        isPublished: true,
        rating: 5,
        company: "BusinessPro"
      },
      {
        name: "Fatima Zahra",
        position: "Data Scientist",
        skills: "Data Science, Python",
        category: "Analyse prédictive",
        level: "Expert",
        progress: 100,
        content: "Remarquable réussite avec la Data Science ! Les cours étaient parfaitement structurés...",
        isPublished: true,
        rating: 5,
        company: "DataTech"
      }
    ];

    await this.insertMany(defaultTestimonials);
    console.log('✅ Données par défaut des témoignages créées');
  }
};

export default mongoose.model('Testimonial', testimonialSchema);
