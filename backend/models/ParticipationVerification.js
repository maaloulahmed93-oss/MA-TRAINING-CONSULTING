import mongoose from 'mongoose';
import ParticipationSequence from './ParticipationSequence.js';

const participationVerificationSchema = new mongoose.Schema(
  {
    participationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    status: {
      type: String,
      required: true,
      enum: ['Complétée', 'En cours', 'Active'],
      default: 'Complétée',
      trim: true,
    },
    servicesList: [
      {
        type: String,
        trim: true,
      },
    ],
    services: {
      service1: {
        type: Boolean,
        default: true,
      },
      service2: {
        type: Boolean,
        default: false,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

participationVerificationSchema.index({ participationId: 1 });
participationVerificationSchema.index({ fullName: 'text' });

participationVerificationSchema.statics.generateParticipationId = async function (year = new Date().getFullYear()) {
  const updated = await ParticipationSequence.findOneAndUpdate(
    { year },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const seq = updated?.seq ?? 1;
  const padded = String(seq).padStart(4, '0');
  return `MTC-AP-${year}-${padded}`;
};

const ParticipationVerification = mongoose.model('ParticipationVerification', participationVerificationSchema);

export default ParticipationVerification;
