import mongoose from 'mongoose';

const eTrainingTestimonialSchema = new mongoose.Schema(
  {
    quote: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    initials: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      trim: true,
      default: '',
    },
    domain: {
      type: String,
      trim: true,
      default: '',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

eTrainingTestimonialSchema.index({ isPublished: 1 });
eTrainingTestimonialSchema.index({ displayOrder: 1, createdAt: -1 });

eTrainingTestimonialSchema.virtual('id').get(function () {
  return this._id.toString();
});

export default mongoose.model('ETrainingTestimonial', eTrainingTestimonialSchema);
