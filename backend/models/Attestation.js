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
// Format: CERT-{Année}-{حرف البرنامج}-{حرف الاسم}-{الرقم}
attestationSchema.statics.generateAttestationId = async function(fullName = '', programTitle = '') {
  const currentYear = new Date().getFullYear();
  
  // Extract first letter from fullName (uppercase)
  const nameInitial = fullName.trim().charAt(0).toUpperCase();
  
  // Extract first letter from program title (uppercase)
  const programInitial = programTitle.trim().charAt(0).toUpperCase();
  
  // Search for last attestation with same pattern
  const lastAttestation = await this.findOne({
    attestationId: { $regex: `^CERT-${currentYear}-${programInitial}-${nameInitial}-` }
  }).sort({ attestationId: -1 });
  
  let nextNumber = 1;
  if (lastAttestation) {
    // Extract last number from ID like: CERT-2025-P-A-001 → 1
    const parts = lastAttestation.attestationId.split('-');
    if (parts.length >= 5) {
      nextNumber = parseInt(parts[4]) + 1;
    }
  }
  
  // Format with leading zeros (3 digits)
  const formattedNumber = nextNumber.toString().padStart(3, '0');
  return `CERT-${currentYear}-${programInitial}-${nameInitial}-${formattedNumber}`;
};

const Attestation = mongoose.model('Attestation', attestationSchema);

export default Attestation;
