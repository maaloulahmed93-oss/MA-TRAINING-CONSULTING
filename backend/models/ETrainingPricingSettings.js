import mongoose from 'mongoose';

const eTrainingPricingSettingsSchema = new mongoose.Schema(
  {
    totalPrice: {
      type: Number,
      required: true,
      default: 1290,
    },
    currency: {
      type: String,
      required: true,
      default: 'TND',
      trim: true,
    },
    defaultDisplayCurrency: {
      type: String,
      default: 'EUR',
      trim: true,
    },
    exchangeRates: {
      type: Map,
      of: Number,
      default: {
        TND: 1,
        EUR: 0.29,
        USD: 0.31,
        MAD: 3.1,
        DZD: 43,
      },
    },
    service1Price: {
      type: Number,
      required: true,
      default: 290,
    },
    service2Price: {
      type: Number,
      required: true,
      default: 590,
    },
    service3Price: {
      type: Number,
      required: true,
      default: 490,
    },
    service1Duration: {
      type: String,
      default: '7–14 jours',
      trim: true,
    },
    service2Duration: {
      type: String,
      default: '2–4 semaines',
      trim: true,
    },
    service3Duration: {
      type: String,
      default: '2–6 semaines',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: String,
      default: 'admin',
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

eTrainingPricingSettingsSchema.index({ isActive: 1 });

eTrainingPricingSettingsSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

eTrainingPricingSettingsSchema.statics.getActiveSettings = function () {
  return this.findOne({ isActive: true }).sort({ updatedAt: -1 });
};

eTrainingPricingSettingsSchema.statics.createDefaultSettings = function () {
  return this.create({
    totalPrice: 1290,
    currency: 'TND',
    defaultDisplayCurrency: 'EUR',
    exchangeRates: {
      TND: 1,
      EUR: 0.29,
      USD: 0.31,
      MAD: 3.1,
      DZD: 43,
    },
    service1Price: 290,
    service2Price: 590,
    service3Price: 490,
    service1Duration: '7–14 jours',
    service2Duration: '2–4 semaines',
    service3Duration: '2–6 semaines',
    isActive: true,
    updatedBy: 'system',
  });
};

const ETrainingPricingSettings = mongoose.model('ETrainingPricingSettings', eTrainingPricingSettingsSchema);

export default ETrainingPricingSettings;
