import mongoose from 'mongoose';

const phaseSchema = new mongoose.Schema(
  {
    phaseId: { type: Number, required: true },
    status: {
      type: String,
      enum: ['A_VENIR', 'EN_COURS', 'TERMINEE'],
      default: 'A_VENIR',
    },
    shortDescription: { type: String, default: '' },
    externalLinkUrl: { type: String, default: '' },
  },
  { _id: false }
);

const decisionSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    decisionType: { type: String, required: true },
    phaseId: { type: Number, required: true },
    noteInternal: { type: String, default: '' },
  },
  { _id: true }
);

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, enum: ['DIAGNOSTIC', 'PHASE'], required: true },
    phaseId: { type: Number },
    documentUrl: { type: String, required: true },
    visibility: { type: String, enum: ['PARTICIPANT', 'INTERNAL'], default: 'PARTICIPANT' },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const espaceProDossierSchema = new mongoose.Schema(
  {
    ownerAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EspaceProAccount',
      required: true,
      unique: true,
      index: true,
    },

    situationCurrent: {
      levelLabel: { type: String, default: '' },
      statusLabel: { type: String, default: '' },
    },

    notesVisibleToParticipant: { type: String, default: '' },

    currentPhaseId: { type: Number, default: 1 },

    phases: { type: [phaseSchema], default: [] },

    decisionsHistory: { type: [decisionSchema], default: [] },

    documents: { type: [documentSchema], default: [] },
  },
  { timestamps: true }
);

espaceProDossierSchema.statics.createDefaultForAccount = async function (accountId) {
  const existing = await this.findOne({ ownerAccountId: accountId });
  if (existing) return existing;

  const phases = Array.from({ length: 5 }, (_, i) => ({ phaseId: i + 1 }));

  const dossier = new this({
    ownerAccountId: accountId,
    currentPhaseId: 1,
    phases,
  });

  await dossier.save();
  return dossier;
};

const EspaceProDossier = mongoose.model('EspaceProDossier', espaceProDossierSchema);

export default EspaceProDossier;
