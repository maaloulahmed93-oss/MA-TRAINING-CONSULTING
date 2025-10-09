import mongoose from 'mongoose';

const partnerTestimonialSchema = new mongoose.Schema({
  // معرف فريد للتيمونيال
  testimonialId: {
    type: String,
    required: true,
    unique: true,
    default: () => `TEST-${Date.now()}`
  },
  
  // معلومات الشركة/الشريك
  companyName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  // منصب الشخص
  position: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  // اسم الشخص (اختياري)
  authorName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  // نص التيمونيال
  testimonialText: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // التقييم (1-5 نجوم)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5
  },
  
  // الأحرف الأولى للعرض
  initials: {
    type: String,
    required: true,
    trim: true,
    maxlength: 3,
    uppercase: true
  },
  
  // حالة النشر
  isPublished: {
    type: Boolean,
    default: true
  },
  
  // ترتيب العرض
  displayOrder: {
    type: Number,
    default: 0
  },
  
  // معلومات إضافية
  metadata: {
    industry: {
      type: String,
      trim: true
    },
    projectType: {
      type: String,
      trim: true
    },
    collaborationDuration: {
      type: String,
      trim: true
    }
  },
  
  // تواريخ الإنشاء والتحديث
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'partnertestimonials'
});

// Index للبحث السريع
partnerTestimonialSchema.index({ companyName: 1 });
partnerTestimonialSchema.index({ isPublished: 1 });
partnerTestimonialSchema.index({ displayOrder: 1 });
partnerTestimonialSchema.index({ createdAt: -1 });

// Middleware لتحديث updatedAt
partnerTestimonialSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method لتحويل إلى format الموقع الرئيسي
partnerTestimonialSchema.methods.toWebsiteFormat = function() {
  return {
    id: this._id,
    text: this.testimonialText,
    initials: this.initials,
    name: this.companyName,
    position: this.position,
    rating: this.rating
  };
};

// Static method لإنشاء بيانات افتراضية
partnerTestimonialSchema.statics.createDefaults = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    const defaultTestimonials = [
      {
        testimonialId: 'TEST-DEFAULT-001',
        companyName: 'BIZCONNECT',
        position: 'CEO',
        authorName: 'Ahmed Benali',
        testimonialText: 'Un partenariat qui a transformé notre approche du digital.',
        rating: 5,
        initials: 'BC',
        isPublished: true,
        displayOrder: 1,
        metadata: {
          industry: 'Technology',
          projectType: 'Digital Transformation'
        }
      },
      {
        testimonialId: 'TEST-DEFAULT-002',
        companyName: 'Nova Market',
        position: 'Directrice Marketing',
        authorName: 'Sarah Mansouri',
        testimonialText: 'Des solutions concrètes et efficaces pour nos projets.',
        rating: 5,
        initials: 'NM',
        isPublished: true,
        displayOrder: 2,
        metadata: {
          industry: 'Marketing',
          projectType: 'Marketing Strategy'
        }
      },
      {
        testimonialId: 'TEST-DEFAULT-003',
        companyName: 'SmartConsult',
        position: 'Consultante Senior',
        authorName: 'Fatma Trabelsi',
        testimonialText: 'Une équipe à l\'écoute et réactive à chaque étape.',
        rating: 5,
        initials: 'SC',
        isPublished: true,
        displayOrder: 3,
        metadata: {
          industry: 'Consulting',
          projectType: 'Business Consulting'
        }
      }
    ];
    
    await this.insertMany(defaultTestimonials);
    console.log('✅ Default partner testimonials created');
  }
};

const PartnerTestimonial = mongoose.model('PartnerTestimonial', partnerTestimonialSchema);

export default PartnerTestimonial;
