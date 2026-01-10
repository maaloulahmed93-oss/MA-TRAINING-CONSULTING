import mongoose from 'mongoose';
import crypto from 'crypto';

const espaceProAccountSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },

    firstNameNormalized: { type: String, required: true, index: true },
    lastNameNormalized: { type: String, required: true, index: true },
    phoneNormalized: { type: String, required: true, unique: true, index: true },

    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

function normalizePhone(value) {
  return String(value || '').replace(/\s+/g, '').trim();
}

function normalizeName(value) {
  return String(value || '').trim().toLowerCase();
}

espaceProAccountSchema.pre('validate', function (next) {
  this.firstNameNormalized = normalizeName(this.firstName);
  this.lastNameNormalized = normalizeName(this.lastName);
  this.phoneNormalized = normalizePhone(this.phone);
  next();
});

espaceProAccountSchema.methods.setPassword = function (password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
  this.passwordHash = `${salt}:${derived}`;
};

espaceProAccountSchema.methods.verifyPassword = function (password) {
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

const EspaceProAccount = mongoose.model('EspaceProAccount', espaceProAccountSchema);

export default EspaceProAccount;
