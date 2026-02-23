import mongoose from 'mongoose';

const service2ActionPlanTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    dueAt: { type: Date },
    status: { type: String, enum: ['todo', 'done'], default: 'todo' },
    completedAt: { type: Date },
    aiFeedback: {
      score: { type: Number, default: 0 },
      summary: { type: String, default: '' },
      warnings: { type: Array, default: [] },
      tips: { type: Array, default: [] },
      strengths: { type: Array, default: [] },
      weaknesses: { type: Array, default: [] },
      recommendations: { type: Array, default: [] },
      raw: { type: Object, default: null },
      model: { type: String, default: '' },
      analyzedAt: { type: Date },
    },
  },
  { _id: true, timestamps: true }
);

const service2ActionPlanSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service2Exam', index: true, required: true },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConsultingOperationnelAccount',
      index: true,
      required: true,
    },
    tasks: { type: [service2ActionPlanTaskSchema], default: [] },
  },
  { timestamps: true }
);

service2ActionPlanSchema.index({ examId: 1, accountId: 1 }, { unique: true });

export default mongoose.model('Service2ActionPlan', service2ActionPlanSchema);
