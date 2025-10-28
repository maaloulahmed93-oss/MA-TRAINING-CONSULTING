import mongoose from 'mongoose';

/**
 * Modèle pour les uploads individuels de PDF
 * Utilisé pour tracker les fichiers uploadés vers Cloudinary
 */

const attestationUploadSchema = new mongoose.Schema({
  participantId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['attestation', 'recommandation', 'evaluation', 'autre'],
    default: 'attestation'
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  cloudinaryPublicId: {
    type: String,
    required: false,
    trim: true
  },
  fileName: {
    type: String,
    required: false,
    trim: true
  },
  fileSize: {
    type: Number,
    required: false
  },
  uploadedBy: {
    type: String,
    required: false,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour recherche rapide
attestationUploadSchema.index({ participantId: 1, type: 1 });
attestationUploadSchema.index({ createdAt: -1 });

// Méthode pour vérifier si un participant existe
attestationUploadSchema.statics.validateParticipant = async function(participantId) {
  // Import dynamique pour éviter les dépendances circulaires
  const Participant = mongoose.model('Participant');
  const participant = await Participant.findOne({ participantId: participantId });
  return !!participant;
};

// Méthode pour récupérer tous les uploads d'un participant
attestationUploadSchema.statics.getByParticipant = async function(participantId) {
  return this.find({ participantId: participantId, isActive: true })
    .sort({ createdAt: -1 });
};

const AttestationUpload = mongoose.model('AttestationUpload', attestationUploadSchema);

export default AttestationUpload;
