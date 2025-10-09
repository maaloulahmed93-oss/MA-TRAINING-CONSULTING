import mongoose from 'mongoose';

const digitalizationContactSchema = new mongoose.Schema({
  // معلومات الاتصال الأساسية
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  whatsapp: {
    type: String,
    required: true,
    trim: true
  },
  
  // معلومات إضافية
  companyName: {
    type: String,
    default: 'MA Training & Consulting',
    trim: true
  },
  supportHours: {
    type: String,
    default: '24/7',
    trim: true
  },
  responseTime: {
    type: String,
    default: 'Sous 2h',
    trim: true
  },
  
  // رسائل مخصصة
  emailSubjectPrefix: {
    type: String,
    default: 'Demande de consultation - Digitalisation',
    trim: true
  },
  emailTemplate: {
    type: String,
    default: `Bonjour,

Je souhaite obtenir plus d'informations concernant vos services de digitalisation.

Mes coordonnées :
- Nom : [Votre nom]
- Entreprise : [Nom de votre entreprise]
- Téléphone : [Votre numéro]
- Secteur d'activité : [Votre secteur]

Besoins spécifiques :
[Décrivez brièvement vos besoins]

Cordialement,
[Votre nom]`,
    trim: true
  },
  whatsappMessage: {
    type: String,
    default: 'Bonjour, je souhaite obtenir des informations sur vos services de digitalisation.',
    trim: true
  },
  
  // Configuration des boutons
  buttons: {
    email: {
      text: {
        type: String,
        default: '📩 Email'
      },
      enabled: {
        type: Boolean,
        default: true
      },
      style: {
        type: String,
        default: 'primary'
      }
    },
    phone: {
      text: {
        type: String,
        default: '📞 Téléphone'
      },
      enabled: {
        type: Boolean,
        default: true
      },
      style: {
        type: String,
        default: 'secondary'
      }
    },
    whatsapp: {
      text: {
        type: String,
        default: 'WhatsApp'
      },
      enabled: {
        type: Boolean,
        default: true
      },
      style: {
        type: String,
        default: 'whatsapp'
      }
    }
  },
  
  // Métadonnées
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
digitalizationContactSchema.index({ isActive: 1 });
digitalizationContactSchema.index({ lastUpdated: -1 });

// Méthode pour générer le lien mailto
digitalizationContactSchema.methods.generateMailto = function(customSubject) {
  const subject = customSubject || this.emailSubjectPrefix;
  return `mailto:${this.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(this.emailTemplate)}`;
};

// Méthode pour générer le lien WhatsApp
digitalizationContactSchema.methods.generateWhatsAppLink = function() {
  const cleanPhone = this.whatsapp.replace(/\s+/g, '').replace(/^\+/, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(this.whatsappMessage)}`;
};

// Méthode pour générer le lien téléphone
digitalizationContactSchema.methods.generatePhoneLink = function() {
  return `tel:${this.phone.replace(/\s+/g, '')}`;
};

// Méthode statique pour créer des données par défaut
digitalizationContactSchema.statics.createDefault = async function() {
  try {
    const existingContact = await this.findOne({ isActive: true });
    if (existingContact) {
      console.log('✅ Contact par défaut existe déjà');
      return existingContact;
    }

    const defaultContact = new this({
      email: 'contact@matc-consulting.com',
      phone: '+216 52 345 678',
      whatsapp: '+216 52 345 678',
      companyName: 'MA Training & Consulting',
      supportHours: '24/7',
      responseTime: 'Sous 2h',
      emailSubjectPrefix: 'Demande de consultation - Digitalisation MATC',
      whatsappMessage: 'Bonjour, je souhaite obtenir des informations sur vos services de digitalisation MATC.',
      buttons: {
        email: {
          text: '📩 Email',
          enabled: true,
          style: 'primary'
        },
        phone: {
          text: '📞 Téléphone', 
          enabled: true,
          style: 'secondary'
        },
        whatsapp: {
          text: 'WhatsApp',
          enabled: true,
          style: 'whatsapp'
        }
      },
      isActive: true,
      updatedBy: 'system'
    });

    await defaultContact.save();
    console.log('✅ Contact par défaut créé avec succès');
    return defaultContact;
  } catch (error) {
    console.error('❌ Erreur lors de la création du contact par défaut:', error);
    throw error;
  }
};

const DigitalizationContact = mongoose.model('DigitalizationContact', digitalizationContactSchema);

export default DigitalizationContact;
