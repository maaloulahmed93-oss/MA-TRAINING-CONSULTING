// Script to fix attestation file paths - migrate from local to Cloudinary
// Run this in MongoDB Atlas or via Node.js

const mongoose = require('mongoose');

// Connect to your MongoDB Atlas
const MONGODB_URI = 'your-mongodb-uri-here';

const attestationSchema = new mongoose.Schema({
  attestationId: String,
  fullName: String,
  documents: {
    attestation: String,
    recommandation: String,
    evaluation: String
  }
});

const Attestation = mongoose.model('Attestation', attestationSchema);

async function fixAttestationFiles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find attestation with local file paths
    const attestation = await Attestation.findOne({
      attestationId: 'CERT-2025-M-M-001'
    });

    if (!attestation) {
      console.log('Attestation not found');
      return;
    }

    console.log('Current documents:', attestation.documents);

    // Update to use placeholder Cloudinary URLs (you need to upload actual files)
    const updatedDocs = {
      attestation: 'https://res.cloudinary.com/djvtktjgc/raw/upload/v1/matc_attestations/attestation-CERT-2025-M-M-001.pdf',
      recommandation: 'https://res.cloudinary.com/djvtktjgc/raw/upload/v1/matc_attestations/recommandation-CERT-2025-M-M-001.pdf',
      evaluation: 'https://res.cloudinary.com/djvtktjgc/raw/upload/v1/matc_attestations/evaluation-CERT-2025-M-M-001.pdf'
    };

    await Attestation.updateOne(
      { attestationId: 'CERT-2025-M-M-001' },
      { $set: { documents: updatedDocs } }
    );

    console.log('Updated documents to Cloudinary URLs');
    console.log('New documents:', updatedDocs);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Uncomment to run:
// fixAttestationFiles();
