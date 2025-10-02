import mongoose from 'mongoose';

const attestationSchema = new mongoose.Schema({
  attestationId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: true
  },
  dateObtention: {
    type: Date,
    required: true,
    default: Date.now
  },
  note: {
    type: Number,
    required: true,
    min: 0,
    max: 20
  },
  niveau: {
    type: String,
    required: true,
    enum: ['Débutant', 'Intermédiaire', 'Avancé'],
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  techniques: [{
    type: String,
    trim: true
  }],
  documents: {
    attestation: {
      type: String,
      required: true,
      trim: true
    },
    recommandation: {
      type: String,
      required: false,
      trim: true
    },
    evaluation: {
      type: String,
      required: false,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance (attestationId has unique: true already)
attestationSchema.index({ programId: 1 });
attestationSchema.index({ fullName: 'text' });

// Static method to generate unique attestation ID
attestationSchema.statics.generateAttestationId = async function() {
  const currentYear = new Date().getFullYear();
  const prefix = `CERT-${currentYear}-`;
  
  // Find the highest number for current year
  const lastAttestation = await this.findOne({
    attestationId: { $regex: `^${prefix}` }
  }).sort({ attestationId: -1 });
  
  let nextNumber = 1;
  if (lastAttestation) {
    const lastNumber = parseInt(lastAttestation.attestationId.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  // Format with leading zeros (4 digits)
  const formattedNumber = nextNumber.toString().padStart(4, '0');
  return `${prefix}${formattedNumber}`;
};

const Attestation = mongoose.model('Attestation', attestationSchema);

export default Attestation;
