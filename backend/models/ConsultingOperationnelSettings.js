import mongoose from 'mongoose';

const consultingOperationnelSettingsSchema = new mongoose.Schema(
  {
    posteIntitule: {
      type: String,
      default: '',
      trim: true,
    },
    entrepriseSecteur: {
      type: String,
      default: '',
      trim: true,
    },
    element1: {
      type: String,
      default: '',
      trim: true,
    },
    element2: {
      type: String,
      default: '',
      trim: true,
    },
    difficulte1: {
      type: String,
      default: '',
      trim: true,
    },
    difficulte2: {
      type: String,
      default: '',
      trim: true,
    },
    demandeDirection: {
      type: String,
      default: '',
      trim: true,
    },
    session1DateTime: {
      type: String,
      default: '',
      trim: true,
    },
    session1VideoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    session2DateTime: {
      type: String,
      default: '',
      trim: true,
    },
    session2VideoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    session3DateTime: {
      type: String,
      default: '',
      trim: true,
    },
    session3VideoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: String,
      default: 'admin',
      trim: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

consultingOperationnelSettingsSchema.index({ isActive: 1 });

consultingOperationnelSettingsSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

consultingOperationnelSettingsSchema.statics.getActiveSettings = function () {
  return this.findOne({ isActive: true }).sort({ updatedAt: -1 });
};

consultingOperationnelSettingsSchema.statics.createDefaultSettings = function () {
  return this.create({
    posteIntitule: '',
    entrepriseSecteur: '',
    element1: '',
    element2: '',
    difficulte1: '',
    difficulte2: '',
    demandeDirection: '',
    session1DateTime: '',
    session1VideoUrl: '',
    session2DateTime: '',
    session2VideoUrl: '',
    session3DateTime: '',
    session3VideoUrl: '',
    isActive: true,
    updatedBy: 'system',
  });
};

const ConsultingOperationnelSettings = mongoose.model(
  'ConsultingOperationnelSettings',
  consultingOperationnelSettingsSchema
);

export default ConsultingOperationnelSettings;
