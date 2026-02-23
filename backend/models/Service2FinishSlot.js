import mongoose from 'mongoose';

const service2FinishSlotSchema = new mongoose.Schema(
  {
    title: { type: String, default: '', trim: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
    assignedAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConsultingOperationnelAccount',
      index: true,
      required: true,
    },
    createdBy: { type: String, default: 'admin', trim: true },
  },
  { timestamps: true }
);

service2FinishSlotSchema.index({ assignedAccountId: 1, isActive: 1, startAt: 1 });

const Service2FinishSlot = mongoose.model('Service2FinishSlot', service2FinishSlotSchema);

export default Service2FinishSlot;
