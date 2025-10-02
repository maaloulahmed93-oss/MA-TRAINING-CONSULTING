import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  // Basic registration info
  type: {
    type: String,
    enum: ['program', 'pack'],
    required: true
  },
  itemId: {
    type: String,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    default: null
  },
  currency: {
    type: String,
    default: '€'
  },
  
  // User information
  user: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
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
    whatsapp: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    message: {
      type: String,
      trim: true
    }
  },
  
  // Program-specific fields
  sessionId: {
    type: String,
    required: function() {
      return this.type === 'program';
    }
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  
  // Admin notes
  adminNotes: {
    type: String,
    trim: true
  },
  
  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
registrationSchema.index({ type: 1, submittedAt: -1 });
registrationSchema.index({ 'user.email': 1 });
registrationSchema.index({ itemId: 1 });
registrationSchema.index({ status: 1 });

// Virtual for full name
registrationSchema.virtual('user.fullName').get(function() {
  return `${this.user.firstName} ${this.user.lastName}`;
});

// Ensure virtual fields are serialized
registrationSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Registration', registrationSchema);
