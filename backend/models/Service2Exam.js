import mongoose from 'mongoose';

const service2TaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    title: { type: String, default: '', trim: true },
    prompt: { type: String, default: '' },
  },
  { _id: false }
);

const service2ExamSchema = new mongoose.Schema(
  {
    title: { type: String, default: '', trim: true },
    scenarioBrief: { type: String, required: true },
    constraints: { type: [String], default: [] },
    successCriteria: { type: [String], default: [] },
    tasks: { type: [service2TaskSchema], default: [] },
    verdictRules: { type: mongoose.Schema.Types.Mixed, default: [] },
    assignedAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConsultingOperationnelAccount',
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

service2ExamSchema.index({ assignedAccountId: 1, isActive: 1 });

const Service2Exam = mongoose.model('Service2Exam', service2ExamSchema);

export default Service2Exam;
