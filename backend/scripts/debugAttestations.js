import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attestation from '../models/Attestation.js';

dotenv.config();

/**
 * Script de debug pour vérifier les attestations en DB
 */

const debugAttestations = async () => {
  try {
    console.log('🔍 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    console.log('📋 DEBUG ATTESTATIONS');
    console.log('='.repeat(80));
    console.log('');

    // Récupérer toutes les attestations actives
    const attestations = await Attestation.find({ isActive: true })
      .populate('programId', 'title')
      .sort({ createdAt: -1 });

    console.log(`📊 ${attestations.length} attestation(s) active(s) trouvée(s)\n`);

    if (attestations.length === 0) {
      console.log('⚠️  Aucune attestation active en base de données');
      console.log('');
      
      // Vérifier les attestations inactives
      const inactiveAttestations = await Attestation.find({ isActive: false })
        .sort({ createdAt: -1 })
        .limit(5);
      
      if (inactiveAttestations.length > 0) {
        console.log(`📊 ${inactiveAttestations.length} attestation(s) inactive(s) trouvée(s):`);
        inactiveAttestations.forEach(att => {
          console.log(`   - ${att.attestationId} (${att.fullName})`);
        });
      }
      
      return;
    }

    // Afficher chaque attestation
    for (const attestation of attestations) {
      console.log('─'.repeat(80));
      console.log(`\n📄 Attestation: ${attestation.attestationId}`);
      console.log(`   Nom: ${attestation.fullName}`);
      console.log(`   Programme: ${attestation.programId?.title || 'N/A'}`);
      console.log(`   Note: ${attestation.note}/20`);
      console.log(`   Niveau: ${attestation.niveau}`);
      console.log(`   Date: ${attestation.dateObtention.toLocaleDateString('fr-FR')}`);
      console.log(`   Créé le: ${attestation.createdAt.toLocaleString('fr-FR')}`);
      console.log('');

      // Analyser les documents
      console.log('   📎 Documents:');
      
      for (const docType of ['attestation', 'recommandation', 'evaluation']) {
        const docPath = attestation.documents[docType];
        
        if (!docPath) {
          console.log(`      ⚠️  ${docType}: Non disponible`);
          continue;
        }

        // Vérifier si c'est une URL Cloudinary
        if (/^https?:\/\//i.test(docPath)) {
          const isCloudinary = docPath.includes('cloudinary.com');
          if (isCloudinary) {
            console.log(`      ✅ ${docType}: Cloudinary URL`);
            console.log(`         ${docPath.substring(0, 80)}...`);
          } else {
            console.log(`      ⚠️  ${docType}: URL externe (non-Cloudinary)`);
            console.log(`         ${docPath}`);
          }
        } else {
          console.log(`      ❌ ${docType}: Chemin local (fichier perdu)`);
          console.log(`         ${docPath}`);
        }
      }

      console.log('');

      // Test de téléchargement
      console.log('   🔗 URLs de téléchargement:');
      for (const docType of ['attestation', 'recommandation', 'evaluation']) {
        if (attestation.documents[docType]) {
          const downloadUrl = `https://matc-backend.onrender.com/api/attestations/${attestation.attestationId}/download/${docType}`;
          console.log(`      ${docType}: ${downloadUrl}`);
        }
      }

      console.log('');
    }

    console.log('='.repeat(80));
    console.log('\n📊 RÉSUMÉ');
    console.log('='.repeat(80));

    let cloudinaryCount = 0;
    let localCount = 0;

    for (const attestation of attestations) {
      let hasCloudinary = false;
      let hasLocal = false;

      for (const docType of ['attestation', 'recommandation', 'evaluation']) {
        const docPath = attestation.documents[docType];
        if (docPath) {
          if (/^https?:\/\//i.test(docPath) && docPath.includes('cloudinary.com')) {
            hasCloudinary = true;
          } else if (!/^https?:\/\//i.test(docPath)) {
            hasLocal = true;
          }
        }
      }

      if (hasCloudinary) cloudinaryCount++;
      if (hasLocal) localCount++;
    }

    console.log(`Total attestations actives: ${attestations.length}`);
    console.log(`Avec fichiers Cloudinary: ${cloudinaryCount}`);
    console.log(`Avec fichiers locaux (perdus): ${localCount}`);
    console.log('');

    if (localCount > 0) {
      console.log('⚠️  ATTENTION: Des attestations ont des fichiers locaux perdus');
      console.log('   Utilisez cleanOrphanedAttestations.js pour les nettoyer');
    }

    if (cloudinaryCount > 0) {
      console.log('✅ Des attestations ont des fichiers Cloudinary (OK)');
    }

    console.log('');

    // Tester une attestation spécifique
    const testId = 'CERT-2025-P-M-001';
    console.log(`🧪 TEST: Recherche de l'attestation ${testId}`);
    const testAttestation = await Attestation.findOne({ 
      attestationId: testId,
      isActive: true 
    });

    if (testAttestation) {
      console.log(`   ✅ Trouvée: ${testAttestation.fullName}`);
      console.log(`   Documents:`);
      console.log(`      - attestation: ${testAttestation.documents.attestation ? '✅' : '❌'}`);
      console.log(`      - recommandation: ${testAttestation.documents.recommandation ? '✅' : '❌'}`);
      console.log(`      - evaluation: ${testAttestation.documents.evaluation ? '✅' : '❌'}`);
    } else {
      console.log(`   ❌ Non trouvée en base de données`);
      
      // Chercher des IDs similaires
      const similar = await Attestation.find({
        attestationId: { $regex: '^CERT-2025-P-M' }
      }).select('attestationId fullName isActive');
      
      if (similar.length > 0) {
        console.log(`   📋 IDs similaires trouvés:`);
        similar.forEach(att => {
          console.log(`      - ${att.attestationId} (${att.fullName}) ${att.isActive ? '✅ active' : '⚠️ inactive'}`);
        });
      }
    }

    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Déconnexion de MongoDB');
  }
};

// Exécuter le script
console.log('');
console.log('╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║   DEBUG ATTESTATIONS - Analyse complète                                    ║');
console.log('╚════════════════════════════════════════════════════════════════════════════╝');
console.log('');

debugAttestations();
