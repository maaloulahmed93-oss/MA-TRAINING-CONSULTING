import mongoose from 'mongoose';
import crypto from 'crypto';

const consultingOperationnelAccountSchema = new mongoose.Schema(
  {
    participantId: { type: String, required: true, trim: true },
    participantIdNormalized: { type: String, required: true, unique: true, index: true },

    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },

    firstName: { type: String, default: '', trim: true },
    lastName: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    entreprise: { type: String, default: '', trim: true },
    notesAdmin: { type: String, default: '' },

    situation: {
      posteIntitule: { type: String, default: '', trim: true },
      entrepriseSecteur: { type: String, default: '', trim: true },
      element1: { type: String, default: '', trim: true },
      element2: { type: String, default: '', trim: true },
      difficulte1: { type: String, default: '', trim: true },
      difficulte2: { type: String, default: '', trim: true },
      demandeDirection: { type: String, default: '', trim: true },
      session1DateTime: { type: String, default: '', trim: true },
      session1VideoUrl: { type: String, default: '', trim: true },
      session2DateTime: { type: String, default: '', trim: true },
      session2VideoUrl: { type: String, default: '', trim: true },
      session3DateTime: { type: String, default: '', trim: true },
      session3VideoUrl: { type: String, default: '', trim: true },
    },
  },
  { timestamps: true }
);

function normalizeParticipantId(value) {
  return String(value || '').trim().toUpperCase();
}

consultingOperationnelAccountSchema.pre('validate', function (next) {
  this.participantIdNormalized = normalizeParticipantId(this.participantId);
  next();
});

consultingOperationnelAccountSchema.methods.setPassword = function (password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
  this.passwordHash = `${salt}:${derived}`;
};

consultingOperationnelAccountSchema.methods.verifyPassword = function (password) {
  const raw = String(this.passwordHash || '');
  const [salt, stored] = raw.split(':');
  if (!salt || !stored) return false;
  const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(stored, 'hex'), Buffer.from(derived, 'hex'));
  } catch {
    return false;
  }
};

const ConsultingOperationnelAccount = mongoose.model(
  'ConsultingOperationnelAccount',
  consultingOperationnelAccountSchema
);

export default ConsultingOperationnelAccount;
