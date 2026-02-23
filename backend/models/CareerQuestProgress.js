import mongoose from 'mongoose';

const careerQuestProgressSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DiagnosticSession',
      required: true,
      unique: true,
      index: true,
    },
    tokenHash: { type: String, required: true, default: '' },
    progress: { type: mongoose.Schema.Types.Mixed, default: {} },
    revision: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

careerQuestProgressSchema.index({ sessionId: 1 }, { unique: true });

export default mongoose.model('CareerQuestProgress', careerQuestProgressSchema);
