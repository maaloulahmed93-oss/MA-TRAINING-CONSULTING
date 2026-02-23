import mongoose from 'mongoose';

const diagnosticQuestionOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    score: { type: Number, required: true },
  },
  { _id: false }
);

const diagnosticQuestionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    options: {
      type: [diagnosticQuestionOptionSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 2,
        message: 'At least 2 options are required',
      },
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

diagnosticQuestionSchema.index({ isActive: 1, order: 1, createdAt: -1 });

diagnosticQuestionSchema.pre('save', function (next) {
  if (typeof this.text === 'string') this.text = this.text.trim();
  if (typeof this.category === 'string') this.category = this.category.trim();
  next();
});

export default mongoose.model('DiagnosticQuestion', diagnosticQuestionSchema);
