import mongoose from 'mongoose';

const participationSequenceSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
      unique: true,
    },
    seq: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const ParticipationSequence = mongoose.model('ParticipationSequence', participationSequenceSchema);

export default ParticipationSequence;
