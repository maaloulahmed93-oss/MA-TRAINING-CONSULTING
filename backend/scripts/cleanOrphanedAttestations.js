import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attestation from '../models/Attestation.js';

dotenv.config();

/**
 * Script pour nettoyer les attestations avec fichiers manquants
 * Marque comme inactives les attestations dont les fichiers n'existent plus
 */

const cleanOrphanedAttestations = async () => {
  try {
    console.log('🔍 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    console.log('📋 NETTOYAGE DES ATTESTATIONS ORPHELINES');
    console.log('='.repeat(60));
    console.log('');

    // Récupérer toutes les attestations actives
    const attestations = await Attestation.find({ isActive: true });
    console.log(`📊 ${attestations.length} attestation(s) active(s) trouvée(s)\n`);

    if (attestations.length === 0) {
      console.log('⚠️  Aucune attestation à vérifier');
      return;
    }

    let orphanedCount = 0;
    const orphanedIds = [];

    for (const attestation of attestations) {
      console.log('─'.repeat(60));
      console.log(`\n📄 Attestation: ${attestation.attestationId}`);
      console.log(`   Nom: ${attestation.fullName}`);

      let hasCloudinaryFiles = false;
      let hasLocalFiles = false;

      // Vérifier chaque type de document
      for (const docType of ['attestation', 'recommandation', 'evaluation']) {
        const docPath = attestation.documents[docType];

        if (!docPath) {
          console.log(`  ⚠️  ${docType}: Non disponible`);
          continue;
        }

        // Vérifier si c'est une URL Cloudinary
        if (/^https?:\/\//i.test(docPath)) {
          console.log(`  ✅ ${docType}: Cloudinary URL`);
          hasCloudinaryFiles = true;
        } else {
          console.log(`  ⚠️  ${docType}: Fichier local (probablement perdu)`);
          hasLocalFiles = true;
        }
      }

      // Si l'attestation n'a que des fichiers locaux (pas de Cloudinary)
      if (hasLocalFiles && !hasCloudinaryFiles) {
        console.log(`\n  ❌ ORPHELINE: Tous les fichiers sont locaux (perdus)`);
        console.log(`     → Marquage comme inactive`);
        
        orphanedIds.push(attestation.attestationId);
        orphanedCount++;

        // Marquer comme inactive
        await Attestation.findByIdAndUpdate(attestation._id, {
          isActive: false
        });
      } else if (hasCloudinaryFiles) {
        console.log(`\n  ✅ OK: Fichiers sur Cloudinary`);
      }

      console.log('');
    }

    console.log('='.repeat(60));
    console.log('\n📊 RÉSUMÉ DU NETTOYAGE');
    console.log('='.repeat(60));
    console.log(`Total attestations vérifiées: ${attestations.length}`);
    console.log(`Attestations orphelines: ${orphanedCount}`);
    console.log(`Attestations OK: ${attestations.length - orphanedCount}`);
    console.log('');

    if (orphanedCount > 0) {
      console.log('⚠️  ATTESTATIONS MARQUÉES COMME INACTIVES:');
      orphanedIds.forEach(id => console.log(`   - ${id}`));
      console.log('');
      console.log('💡 RECOMMANDATION:');
      console.log('   Ces attestations doivent être re-créées avec le nouveau système');
      console.log('   qui uploade directement vers Cloudinary.');
      console.log('');
      console.log('   Étapes:');
      console.log('   1. Préparer les fichiers PDF originaux');
      console.log('   2. Utiliser l\'Admin Panel pour créer de nouvelles attestations');
      console.log('   3. Les nouveaux fichiers seront automatiquement uploadés vers Cloudinary');
    } else {
      console.log('✅ Toutes les attestations ont des fichiers sur Cloudinary');
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
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   NETTOYAGE ATTESTATIONS ORPHELINES                        ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

cleanOrphanedAttestations();
