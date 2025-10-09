import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  // معرف فريد للحدث
  eventId: {
    type: String,
    required: true,
    unique: true,
    default: () => `EVT-${Date.now()}`
  },
  
  // معلومات أساسية
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  // فئة الحدث
  category: {
    type: String,
    enum: ['formation', 'webinaire', 'conference', 'team-building', 'voyage'],
    required: true
  },
  
  // التاريخ والوقت
  date: {
    type: Date,
    required: true
  },
  
  // تنسيق الحدث
  format: {
    type: {
      type: String,
      enum: ['Présentiel', 'En ligne', 'Hybride', 'Voyage'],
      required: true
    },
    details: {
      type: String,
      trim: true // مثل: "Hôtel Golden Tulip" أو "Zoom Link"
    }
  },
  
  // المدة
  duration: {
    type: String,
    required: true // مثل: "2 jours", "3h"
  },
  
  // السعر
  price: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // الأماكن
  places: {
    total: {
      type: Number,
      required: true,
      min: 1
    },
    registered: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // حالة النشر
  isPublished: {
    type: Boolean,
    default: false
  },
  
  // رابط الحدث (للعين)
  url: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // URL اختياري
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL must be a valid web address'
    }
  },
  
  // المكان (للأحداث الحضورية)
  location: {
    type: String,
    trim: true
  },
  
  // المسجلين
  registrations: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled'],
      default: 'confirmed'
    }
  }],
  
  // حالة الحدث
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  
  // معلومات إضافية
  organizer: {
    type: String,
    trim: true,
    default: 'MATC'
  },
  
  // الأجندة
  agenda: [{
    time: String,
    activity: String,
    speaker: String
  }],
  
  // المواد والوثائق
  materials: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['presentation', 'document', 'video', 'link']
    }
  }],
  
  // التقييمات
  feedback: [{
    participantName: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // متوسط التقييم
  averageRating: {
    type: Number,
    min: 0,
    max: 5
  },
  
  // العلامات
  tags: [{
    type: String,
    trim: true
  }],
  
  // معلومات الإنشاء والتحديث
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// فهارس للبحث السريع
eventSchema.index({ category: 1, isPublished: 1 });
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ isPublished: 1, date: 1 });
eventSchema.index({ 'places.registered': 1, 'places.total': 1 });

// Middleware لتحديث updatedAt
eventSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // تحديث عدد المسجلين
  if (this.registrations) {
    this.places.registered = this.registrations.filter(reg => reg.status === 'confirmed').length;
  }
  
  // حساب متوسط التقييم
  if (this.feedback && this.feedback.length > 0) {
    const totalRating = this.feedback.reduce((sum, fb) => sum + fb.rating, 0);
    this.averageRating = totalRating / this.feedback.length;
  }
  
  next();
});

// دوال مساعدة
eventSchema.statics.getPublishedEvents = function() {
  return this.find({ isPublished: true }).sort({ date: 1 });
};

eventSchema.statics.getUpcomingEvents = function() {
  return this.find({ 
    isPublished: true,
    date: { $gte: new Date() },
    status: 'upcoming'
  }).sort({ date: 1 });
};

eventSchema.statics.getEventsByCategory = function(category) {
  return this.find({ 
    category,
    isPublished: true 
  }).sort({ date: 1 });
};

eventSchema.statics.getFreeEvents = function() {
  return this.find({ 
    price: 0,
    isPublished: true 
  }).sort({ date: 1 });
};

// دوال للمثيل
eventSchema.methods.registerParticipant = function(participantData) {
  // التحقق من توفر أماكن
  if (this.places.registered >= this.places.total) {
    throw new Error('Event is full');
  }
  
  // التحقق من عدم التسجيل المسبق
  const existingRegistration = this.registrations.find(
    reg => reg.email === participantData.email
  );
  
  if (existingRegistration) {
    throw new Error('Already registered');
  }
  
  this.registrations.push(participantData);
  return this.save();
};

eventSchema.methods.cancelRegistration = function(email) {
  const registration = this.registrations.find(reg => reg.email === email);
  if (registration) {
    registration.status = 'cancelled';
    return this.save();
  }
  throw new Error('Registration not found');
};

eventSchema.methods.addFeedback = function(feedbackData) {
  this.feedback.push(feedbackData);
  return this.save();
};

eventSchema.methods.isRegistrationOpen = function() {
  return this.isPublished && 
         this.status === 'upcoming' && 
         this.places.registered < this.places.total &&
         new Date() < this.date;
};

const Event = mongoose.model('Event', eventSchema);

export default Event;
