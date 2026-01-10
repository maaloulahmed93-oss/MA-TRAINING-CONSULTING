import mongoose from 'mongoose';

const espaceRessourcesSettingsSchema = new mongoose.Schema(
  {
    accessCode: {
      type: String,
      default: '00000000',
      trim: true,
    },
    bonusCode: {
      type: String,
      default: '00000000',
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

espaceRessourcesSettingsSchema.index({ isActive: 1 });

espaceRessourcesSettingsSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

espaceRessourcesSettingsSchema.statics.getActiveSettings = function () {
  return this.findOne({ isActive: true }).sort({ updatedAt: -1 });
};

espaceRessourcesSettingsSchema.statics.createDefaultSettings = function () {
  return this.create({
    accessCode: '00000000',
    bonusCode: '00000000',
    isActive: true,
    updatedBy: 'system',
  });
};

const EspaceRessourcesSettings = mongoose.model(
  'EspaceRessourcesSettings',
  espaceRessourcesSettingsSchema
);

export default EspaceRessourcesSettings;
