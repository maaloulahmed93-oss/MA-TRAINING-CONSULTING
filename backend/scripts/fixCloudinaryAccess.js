import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import Attestation from '../models/Attestation.js';

dotenv.config();

/**
 * Script pour corriger l'accès aux fichiers Cloudinary
 * Change les fichiers de 'authenticated' à 'public'
 */

const fixCloudinaryAccess = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    console.log('🔧 CORRECTION ACCÈS CLOUDINARY');
    console.log('='.repeat(60));
    console.log('');

    // Récupérer toutes les attestations
    const attestations = await Attestation.find({});
    console.log(`📋 ${attestations.length} attestation(s) trouvée(s)\n`);

    let fixedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const attestation of attestations) {
      console.log(`\n📄 ${attestation.attestationId} - ${attestation.fullName}`);
      console.log('-'.repeat(60));

      for (const docType of ['attestation', 'recommandation', 'evaluation']) {
        const docUrl = attestation.documents[docType];

        if (!docUrl) {
          console.log(`  ⏭️  ${docType}: Pas de fichier`);
          continue;
        }

        // Vérifier si c'est une URL Cloudinary
        if (!docUrl.includes('cloudinary.com')) {
          console.log(`  ⏭️  ${docType}: Pas sur Cloudinary`);
          skippedCount++;
          continue;
        }

        console.log(`  🔍 ${docType}: Vérification...`);
        console.log(`     URL: ${docUrl.substring(0, 80)}...`);

        try {
          // Extraire le public_id de l'URL
          const urlParts = docUrl.split('/upload/');
          if (urlParts.length < 2) {
            console.log(`  ⚠️  ${docType}: Format URL invalide`);
            errorCount++;
            continue;
          }

          // Le public_id est après /upload/v{version}/
          const pathAfterUpload = urlParts[1];
          const pathParts = pathAfterUpload.split('/');
          
          // Enlever la version si présente (v1234567890)
          const startIndex = pathParts[0].startsWith('v') && !isNaN(pathParts[0].substring(1)) ? 1 : 0;
          const publicIdWithExt = pathParts.slice(startIndex).join('/');
          
          // Enlever l'extension .pdf
          const publicId = publicIdWithExt.replace(/\.pdf$/, '');

          console.log(`     Public ID: ${publicId}`);

          // Vérifier l'accès actuel
          try {
            const resource = await cloudinary.api.resource(publicId, {
              resource_type: 'raw',
              type: 'upload'
            });

            console.log(`     Accès actuel: ${resource.access_mode || 'public'}`);

            // Si déjà public, skip
            if (resource.access_mode === 'public' || !resource.access_mode) {
              console.log(`  ✅ ${docType}: Déjà public`);
              skippedCount++;
              continue;
            }

            // Changer l'accès à public
            await cloudinary.api.update(publicId, {
              resource_type: 'raw',
              type: 'upload',
              access_mode: 'public'
            });

            console.log(`  ✅ ${docType}: Accès changé à public`);
            fixedCount++;

          } catch (apiError) {
            // Si l'erreur est 404, essayer avec type 'authenticated'
            if (apiError.error && apiError.error.http_code === 404) {
              console.log(`     Tentative avec type 'authenticated'...`);
              
              try {
                const resource = await cloudinary.api.resource(publicId, {
                  resource_type: 'raw',
                  type: 'authenticated'
                });

                console.log(`     Trouvé en mode authenticated`);

                // Changer à public
                await cloudinary.api.update(publicId, {
                  resource_type: 'raw',
                  type: 'authenticated',
                  access_mode: 'public'
                });

                console.log(`  ✅ ${docType}: Accès changé à public`);
                fixedCount++;

              } catch (authError) {
                console.log(`  ❌ ${docType}: Fichier introuvable sur Cloudinary`);
                console.log(`     Erreur: ${authError.message}`);
                errorCount++;
              }
            } else {
              throw apiError;
            }
          }

        } catch (error) {
          console.log(`  ❌ ${docType}: Erreur`);
          console.log(`     ${error.message}`);
          errorCount++;
        }
      }
    }

    // Résumé
    console.log('\n');
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(60));
    console.log(`✅ Fichiers corrigés: ${fixedCount}`);
    console.log(`⏭️  Fichiers déjà publics/skippés: ${skippedCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log('');

    if (fixedCount > 0) {
      console.log('🎉 Correction terminée avec succès !');
      console.log('   Les fichiers sont maintenant accessibles publiquement');
      console.log('');
      console.log('💡 PROCHAINES ÉTAPES:');
      console.log('   1. Testez les liens dans le navigateur');
      console.log('   2. Vérifiez le téléchargement depuis l\'Admin Panel');
      console.log('   3. Les nouveaux uploads seront automatiquement publics');
    } else if (errorCount === 0) {
      console.log('✅ Tous les fichiers sont déjà publics !');
    } else {
      console.log('⚠️  Certains fichiers n\'ont pas pu être corrigés');
      console.log('   Vérifiez les erreurs ci-dessus');
    }

    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');
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
console.log('║   CORRECTION ACCÈS CLOUDINARY                              ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

checkCloudinaryConfig();
fixCloudinaryAccess();
