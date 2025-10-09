import mongoose from 'mongoose';

const websitePageSchema = new mongoose.Schema({
  pageId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return `PAGE-${Date.now()}`;
    }
  },
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
  icon: {
    type: String,
    required: true,
    trim: true
  },
  buttonText: {
    type: String,
    required: true,
    trim: true,
    default: 'En savoir plus'
  },
  buttonLink: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  backgroundColor: {
    type: String,
    default: '#3B82F6'
  },
  textColor: {
    type: String,
    default: '#FFFFFF'
  },
  category: {
    type: String,
    enum: ['service', 'formation', 'about', 'contact', 'other'],
    default: 'other'
  },
  isDefault: {
    type: Boolean,
    default: false // للصفحات الافتراضية الأربع
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

// Middleware لتحديث updatedAt
websitePageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index للاستعلامات السريعة
websitePageSchema.index({ isActive: 1, order: 1 });
websitePageSchema.index({ pageId: 1 });
websitePageSchema.index({ isDefault: 1 });

// إنشاء الصفحات الافتراضية الأربع
websitePageSchema.statics.createDefaultPages = async function() {
  const defaultPages = [
    {
      pageId: 'PAGE-ABOUT',
      title: 'À propos de nous',
      description: 'Des experts humains, une mission claire, une vision tournée vers l\'impact.',
      icon: '👥',
      buttonText: 'En savoir plus',
      buttonLink: '/about',
      backgroundColor: '#3B82F6',
      textColor: '#FFFFFF',
      category: 'about',
      order: 1,
      isDefault: true,
      isActive: true
    },
    {
      pageId: 'PAGE-ETRAINING',
      title: 'E-Training',
      description: 'Formez-vous autrement. Progressez durablement.',
      icon: '🎓',
      buttonText: 'Accéder',
      buttonLink: '/etraining',
      backgroundColor: '#8B5CF6',
      textColor: '#FFFFFF',
      category: 'formation',
      order: 2,
      isDefault: true,
      isActive: true
    },
    {
      pageId: 'PAGE-DIGITALISATION',
      title: 'Digitalisation',
      description: 'Moderniser n\'est plus un choix, c\'est une nécessité.',
      icon: '📱',
      buttonText: 'Découvrir',
      buttonLink: '/digitalisation',
      backgroundColor: '#F97316',
      textColor: '#FFFFFF',
      category: 'service',
      order: 3,
      isDefault: true,
      isActive: true
    },
    {
      pageId: 'PAGE-PARTENARIAT',
      title: 'Partenariat',
      description: 'Mobilisation des compétences & articulation fonctionnelle. Ensemble, construisons des projets à impact réel.',
      icon: '🤝',
      buttonText: 'Nous rejoindre',
      buttonLink: '/partenariat',
      backgroundColor: '#10B981',
      textColor: '#FFFFFF',
      category: 'contact',
      order: 4,
      isDefault: true,
      isActive: true
    }
  ];

  try {
    // التحقق من وجود الصفحات الافتراضية
    const existingCount = await this.countDocuments({ isDefault: true });
    
    if (existingCount === 0) {
      await this.insertMany(defaultPages);
      console.log('✅ الصفحات الافتراضية الأربع تم إنشاؤها');
    } else {
      console.log('ℹ️ الصفحات الافتراضية موجودة بالفعل');
    }
  } catch (error) {
    console.error('❌ خطأ في إنشاء الصفحات الافتراضية:', error);
  }
};

export default mongoose.model('WebsitePage', websitePageSchema);
