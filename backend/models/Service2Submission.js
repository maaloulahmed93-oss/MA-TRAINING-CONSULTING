import mongoose from 'mongoose';

const service2AiAnalysisSchema = new mongoose.Schema(
  {
    score: { type: Number, default: 0 },
    summary: { type: String, default: '' },
    warnings: { type: [String], default: [] },
    tips: { type: [String], default: [] },
    constraintViolations: { type: [mongoose.Schema.Types.Mixed], default: [] },
    successCriteria: { type: [mongoose.Schema.Types.Mixed], default: [] },
    raw: { type: mongoose.Schema.Types.Mixed, default: null },
    model: { type: String, default: '' },
  },
  { _id: false }
);

const service2SubmissionSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service2Exam', required: true, index: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConsultingOperationnelAccount', required: true, index: true },
    taskId: { type: String, default: 'main', trim: true },
    submissionText: { type: String, default: '' },
    attempt: { type: Number, default: 1 },
    aiAnalysis: { type: service2AiAnalysisSchema, default: () => ({}) },
  },
  { timestamps: true }
);

service2SubmissionSchema.index({ examId: 1, accountId: 1, taskId: 1, createdAt: -1 });

const Service2Submission = mongoose.model('Service2Submission', service2SubmissionSchema);

export default Service2Submission;
