import mongoose from 'mongoose';

/**
 * AdminUser Model
 * For Admin Panel users (Administrators and Moderators)
 */
const adminUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
  },
  role: {
    type: String,
    required: [true, 'Le rôle est requis'],
    enum: {
      values: ['admin', 'moderator'],
      message: 'Le rôle doit être admin ou moderator'
    },
    default: 'moderator'
  },
  avatar: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  collection: 'admin_users'
});

// Index for faster email lookups
adminUserSchema.index({ email: 1 });

// Index for role filtering
adminUserSchema.index({ role: 1 });

// Virtual for user initials
adminUserSchema.virtual('initials').get(function() {
  return this.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
});

// Method to update last login
adminUserSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save();
};

// Static method to find by email
adminUserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to get all active users
adminUserSchema.statics.getActiveUsers = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// Static method to get users by role
adminUserSchema.statics.getUsersByRole = function(role) {
  return this.find({ role, isActive: true }).sort({ createdAt: -1 });
};

// Transform output (remove sensitive data when converting to JSON)
adminUserSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    // Note: We're keeping password for now as per user request
    // In production, you should remove it: delete ret.password;
    return ret;
  }
});

const AdminUser = mongoose.model('AdminUser', adminUserSchema);

export default AdminUser;
