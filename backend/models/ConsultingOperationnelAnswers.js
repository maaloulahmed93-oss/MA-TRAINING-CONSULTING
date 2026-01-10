import mongoose from 'mongoose';

const consultingOperationnelAnswersSchema = new mongoose.Schema(
  {
    ownerAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConsultingOperationnelAccount',
      required: true,
      unique: true,
      index: true,
    },
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const ConsultingOperationnelAnswers = mongoose.model(
  'ConsultingOperationnelAnswers',
  consultingOperationnelAnswersSchema
);

export default ConsultingOperationnelAnswers;
