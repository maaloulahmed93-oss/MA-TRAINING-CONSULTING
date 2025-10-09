import mongoose from 'mongoose';

const footerSettingsSchema = new mongoose.Schema({
  // معلومات الاتصال
  contactInfo: {
    email: {
      type: String,
      required: true,
      default: 'contact@ma-training-consulting.com'
    },
    phone: {
      type: String,
      required: true,
      default: '+33 1 23 45 67 89'
    },
    address: {
      type: String,
      required: true,
      default: '123 Avenue des Champs-Élysées, 75008 Paris'
    }
  },

  // روابط FAQ
  faqLinks: [{
    title: {
      type: String,
      required: true
    },
    href: {
      type: String,
      required: true
    }
  }],

  // روابط الشبكات الاجتماعية
  socialLinks: [{
    name: {
      type: String,
      required: true,
      enum: ['Facebook', 'LinkedIn', 'WhatsApp', 'Telegram']
    },
    href: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    }
  }],

  // معلومات الشركة
  companyInfo: {
    name: {
      type: String,
      default: 'MA-TRAINING-CONSULTING'
    },
    description: {
      type: String,
      default: 'Votre partenaire stratégique pour la transformation digitale et le développement des compétences.'
    }
  },

  // معلومات التحديث
  isActive: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: String,
    default: 'admin'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// إنشاء index للبحث السريع
footerSettingsSchema.index({ isActive: 1 });

// Middleware لتحديث updatedAt عند التعديل
footerSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// دالة للحصول على الإعدادات النشطة
footerSettingsSchema.statics.getActiveSettings = function() {
  return this.findOne({ isActive: true }).sort({ updatedAt: -1 });
};

// دالة لإنشاء الإعدادات الافتراضية
footerSettingsSchema.statics.createDefaultSettings = function() {
  const defaultSettings = {
    contactInfo: {
      email: 'contact@ma-training-consulting.com',
      phone: '+33 1 23 45 67 89',
      address: '123 Avenue des Champs-Élysées, 75008 Paris'
    },
    faqLinks: [
      { title: 'Comment s\'inscrire ?', href: '#' },
      { title: 'Conditions de partenariat', href: '#' },
      { title: 'Avantages du programme', href: '#' },
      { title: 'Nos partenaires', href: '#' }
    ],
    socialLinks: [
      { name: 'Facebook', href: '#', icon: 'FaFacebookF' },
      { name: 'LinkedIn', href: '#', icon: 'FaLinkedinIn' },
      { name: 'WhatsApp', href: '#', icon: 'FaWhatsapp' },
      { name: 'Telegram', href: '#', icon: 'FaTelegramPlane' }
    ],
    companyInfo: {
      name: 'MA-TRAINING-CONSULTING',
      description: 'Votre partenaire stratégique pour la transformation digitale et le développement des compétences.'
    },
    isActive: true,
    updatedBy: 'system'
  };

  return this.create(defaultSettings);
};

const FooterSettings = mongoose.model('FooterSettings', footerSettingsSchema);

export default FooterSettings;
