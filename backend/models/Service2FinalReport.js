import mongoose from 'mongoose';

const service2FinalReportSchema = new mongoose.Schema(
  {
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service2Exam', required: true, index: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConsultingOperationnelAccount', required: true, index: true },

    globalScore: { type: Number, default: 0 },
    constraintViolationsCount: { type: Number, default: 0 },

    status: { type: String, default: 'À retravailler', trim: true },
    message: { type: String, default: '' },

    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },

    reportText: { type: String, default: '' },
    inputs: { type: mongoose.Schema.Types.Mixed, default: null },

    aiFullReportText: { type: String, default: '' },
    aiFullReportRaw: { type: mongoose.Schema.Types.Mixed, default: null },
    aiFullReportModel: { type: String, default: '' },
    aiFullReportGeneratedAt: { type: Date },
  },
  { timestamps: true }
);

service2FinalReportSchema.index({ examId: 1, accountId: 1 }, { unique: true });

const Service2FinalReport = mongoose.model('Service2FinalReport', service2FinalReportSchema);

export default Service2FinalReport;
