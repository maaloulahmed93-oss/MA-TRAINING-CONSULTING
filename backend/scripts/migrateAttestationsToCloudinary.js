import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Attestation from '../models/Attestation.js';
import cloudinary from '../config/cloudinary.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script de migration des attestations vers Cloudinary
 * Migre tous les fichiers locaux vers Cloudinary pour garantir la persistance
 */

const uploadToCloudinary = async (filePath, attestationId, docType) => {
  try {
    console.log(`  📤 Uploading ${docType}...`);
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'matc/attestations',
      public_id: `${attestationId}-${docType}`,
      resource_type: 'raw',
      format: 'pdf',
      overwrite: true
    });
    
    console.log(`  ✅ Uploaded: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`  ❌ Error uploading ${docType}:`, error.message);
    throw error;
  }
};

const migrateAttestations = async () => {
  try {
    console.log('🔍 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    console.log('📋 MIGRATION DES ATTESTATIONS VERS CLOUDINARY');
    console.log('='.repeat(60));
    console.log('');

    // Récupérer toutes les attestations
    const attestations = await Attestation.find();
    console.log(`📊 ${attestations.length} attestation(s) trouvée(s)\n`);

    if (attestations.length === 0) {
      console.log('⚠️  Aucune attestation à migrer');
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const attestation of attestations) {
      console.log('─'.repeat(60));
      console.log(`\n📄 Attestation: ${attestation.attestationId}`);
      console.log(`   Nom: ${attestation.fullName}`);

      let needsUpdate = false;
      const updatedDocuments = { ...attestation.documents };

      // Vérifier chaque type de document
      for (const docType of ['attestation', 'recommandation', 'evaluation']) {
        const docPath = attestation.documents[docType];

        if (!docPath) {
          console.log(`  ⚠️  ${docType}: Non disponible`);
          continue;
        }

        // Vérifier si déjà sur Cloudinary
        if (/^https?:\/\//i.test(docPath)) {
          console.log(`  ✅ ${docType}: Déjà sur Cloudinary`);
          console.log(`     ${docPath.substring(0, 60)}...`);
          continue;
        }

        // Fichier local - besoin de migration
        console.log(`  🔄 ${docType}: Fichier local détecté`);
        console.log(`     ${docPath}`);

        // Vérifier si le fichier existe
        const absolutePath = path.isAbsolute(docPath) 
          ? docPath 
          : path.join(__dirname, '..', docPath);

        if (!fs.existsSync(absolutePath)) {
          console.log(`  ❌ ${docType}: Fichier introuvable sur le disque`);
          console.log(`     Chemin: ${absolutePath}`);
          errorCount++;
          continue;
        }

        try {
          // Upload vers Cloudinary
          const cloudinaryUrl = await uploadToCloudinary(
            absolutePath,
            attestation.attestationId,
            docType
          );

          updatedDocuments[docType] = cloudinaryUrl;
          needsUpdate = true;
          migratedCount++;
        } catch (error) {
          console.log(`  ❌ ${docType}: Erreur lors de l'upload`);
          console.log(`     ${error.message}`);
          errorCount++;
        }
      }

      // Mettre à jour l'attestation si nécessaire
      if (needsUpdate) {
        try {
          await Attestation.findByIdAndUpdate(attestation._id, {
            documents: updatedDocuments
          });
          console.log(`\n✅ Attestation mise à jour dans MongoDB`);
        } catch (error) {
          console.log(`\n❌ Erreur lors de la mise à jour MongoDB:`, error.message);
          errorCount++;
        }
      } else {
        console.log(`\n⏭️  Aucune migration nécessaire`);
        skippedCount++;
      }

      console.log('');
    }

    console.log('='.repeat(60));
    console.log('\n📊 RÉSUMÉ DE LA MIGRATION');
    console.log('='.repeat(60));
    console.log(`Total attestations: ${attestations.length}`);
    console.log(`Documents migrés: ${migratedCount}`);
    console.log(`Attestations ignorées: ${skippedCount}`);
    console.log(`Erreurs: ${errorCount}`);
    console.log('');

    if (errorCount > 0) {
      console.log('⚠️  Certains fichiers n\'ont pas pu être migrés');
      console.log('   Vérifiez les logs ci-dessus pour plus de détails');
    } else if (migratedCount > 0) {
      console.log('✅ Migration terminée avec succès !');
      console.log('   Tous les fichiers sont maintenant sur Cloudinary');
    } else {
      console.log('✅ Tous les fichiers sont déjà sur Cloudinary');
    }

    console.log('');
    console.log('💡 RECOMMANDATIONS');
    console.log('='.repeat(60));
    console.log('1. Vérifiez que les fichiers sont accessibles sur Cloudinary');
    console.log('2. Testez le téléchargement depuis l\'Admin Panel');
    console.log('3. Une fois validé, vous pouvez supprimer les fichiers locaux');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Déconnexion de MongoDB');
  }
};

// Vérifier les variables d'environnement Cloudinary
const checkCloudinaryConfig = () => {
  console.log('🔍 Vérification configuration Cloudinary...\n');
  
  const requiredVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Variables d\'environnement manquantes:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nAjoutez ces variables dans votre fichier .env');
    console.error('Exemple:');
    console.error('CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.error('CLOUDINARY_API_KEY=your_api_key');
    console.error('CLOUDINARY_API_SECRET=your_api_secret');
    process.exit(1);
  }

  console.log('✅ Configuration Cloudinary OK');
  console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY.substring(0, 8)}...`);
  console.log('');
};

// Exécuter le script
console.log('');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   MIGRATION ATTESTATIONS VERS CLOUDINARY                   ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

checkCloudinaryConfig();
migrateAttestations();
