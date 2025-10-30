const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/matc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Attestation = require('./models/Attestation');

async function debugAttestation() {
  try {
    console.log('🔍 Searching for attestation: CERT-2025-M-S-001');
    
    const attestation = await Attestation.findOne({
      attestationId: 'CERT-2025-M-S-001',
      isActive: true
    });

    if (!attestation) {
      console.log('❌ Attestation not found');
      return;
    }

    console.log('✅ Found attestation:');
    console.log('ID:', attestation.attestationId);
    console.log('Name:', attestation.fullName);
    console.log('Documents:', JSON.stringify(attestation.documents, null, 2));
    
    // Check if documents exist
    const fs = require('fs');
    const path = require('path');
    
    console.log('\n📁 File existence check:');
    console.log('Current directory:', process.cwd());
    console.log('Uploads directory exists:', fs.existsSync('./uploads'));
    
    if (fs.existsSync('./uploads')) {
      console.log('Uploads contents:', fs.readdirSync('./uploads'));
    }
    
    Object.entries(attestation.documents).forEach(([type, filePath]) => {
      if (filePath) {
        const exists = fs.existsSync(filePath);
        console.log(`${type}: ${filePath} - ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
        if (!exists) {
          console.log(`  Absolute path: ${path.resolve(filePath)}`);
        }
      } else {
        console.log(`${type}: No file path`);
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugAttestation();
