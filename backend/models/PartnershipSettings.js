import mongoose from 'mongoose';

// OPTIMIZATION: In-memory cache for partnership settings
let settingsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

const partnershipSettingsSchema = new mongoose.Schema({
  // Global contact email for all partnerships
  globalContactEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    default: 'contact@matc.com',
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  
  // Visibility settings for each partnership type
  visibilitySettings: {
    formateur: {
      isVisible: { type: Boolean, default: true }
    },
    freelance: {
      isVisible: { type: Boolean, default: true }
    },
    commercial: {
      isVisible: { type: Boolean, default: true }
    },
    entreprise: {
      isVisible: { type: Boolean, default: true }
    }
  },
  
  // Singleton pattern - only one settings document
  settingsId: {
    type: String,
    default: 'partnership_settings',
    unique: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
partnershipSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get or create settings (Singleton pattern with CACHE)
partnershipSettingsSchema.statics.getSettings = async function() {
  // OPTIMIZATION: Check cache first
  const now = Date.now();
  if (settingsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('✅ Using cached partnership settings');
    return settingsCache;
  }

  let settings = await this.findOne({ settingsId: 'partnership_settings' });
  
  if (!settings) {
    // Create default settings if none exist
    settings = new this({
      settingsId: 'partnership_settings',
      globalContactEmail: 'contact@matc.com',
      visibilitySettings: {
        formateur: { isVisible: true },
        freelance: { isVisible: true },
        commercial: { isVisible: true },
        entreprise: { isVisible: true }
      }
    });
    await settings.save();
    console.log('✅ Default partnership settings created');
  }
  
  // OPTIMIZATION: Update cache
  settingsCache = settings;
  cacheTimestamp = now;
  
  return settings;
};

// Static method to update global email
partnershipSettingsSchema.statics.updateGlobalEmail = async function(email) {
  const settings = await this.getSettings();
  settings.globalContactEmail = email;
  await settings.save();
  
  // OPTIMIZATION: Invalidate cache
  settingsCache = null;
  cacheTimestamp = null;
  
  return settings;
};

// Static method to update visibility settings
partnershipSettingsSchema.statics.updateVisibility = async function(visibilityData) {
  const settings = await this.getSettings();
  settings.visibilitySettings = { ...settings.visibilitySettings, ...visibilityData };
  await settings.save();
  
  // OPTIMIZATION: Invalidate cache
  settingsCache = null;
  cacheTimestamp = null;
  
  return settings;
};

export default mongoose.model('PartnershipSettings', partnershipSettingsSchema);
