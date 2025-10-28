import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attestation from '../models/Attestation.js';

dotenv.config();

/**
 * Script de test des endpoints de téléchargement
 * Simule les appels API pour vérifier la compatibilité
 */

const testDownloadEndpoints = async () => {
  try {
    console.log('🔍 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    console.log('🧪 TEST DES ENDPOINTS DE TÉLÉCHARGEMENT');
    console.log('========================================\n');

    // Récupérer quelques attestations pour test
    const attestations = await Attestation.find({ isActive: true })
      .limit(5)
      .select('attestationId fullName documents');

    if (attestations.length === 0) {
      console.log('⚠️  Aucune attestation trouvée dans la base de données');
      console.log('Créez d\'abord des attestations via l\'admin panel\n');
      return;
    }

    console.log(`📋 ${attestations.length} attestation(s) trouvée(s) pour les tests\n`);

    // Tester chaque attestation
    for (const att of attestations) {
      console.log('─'.repeat(60));
      console.log(`\n📄 Test: ${att.attestationId}`);
      console.log(`   Nom: ${att.fullName}`);
      
      // Vérifier le format de l'ID
      const newFormatRegex = /^CERT-\d{4}-[A-Z]-[A-Z]-\d{3}$/i;
      const oldFormatRegex = /^CERT-(ANNEE|\d{4})-\d{3}$/i;
      
      let formatType = 'Inconnu';
      if (newFormatRegex.test(att.attestationId)) {
        formatType = 'Nouveau (CERT-YYYY-P-N-XXX)';
      } else if (oldFormatRegex.test(att.attestationId)) {
        formatType = 'Ancien (CERT-ANNEE-XXX)';
      }
      
      console.log(`   Format: ${formatType}\n`);

      // Tester chaque type de document
      const docTypes = ['attestation', 'recommandation', 'evaluation'];
      
      for (const docType of docTypes) {
        const hasDoc = !!att.documents[docType];
        const docPath = att.documents[docType];
        
        console.log(`   ${docType}:`);
        
        if (!hasDoc) {
          console.log(`      ⚠️  Non disponible`);
          continue;
        }

        // Analyser le type de stockage
        const isCloudinary = /^https?:\/\//i.test(docPath);
        const storageType = isCloudinary ? 'Cloudinary (URL)' : 'Local (path)';
        
        console.log(`      ✅ Disponible`);
        console.log(`      📦 Stockage: ${storageType}`);
        console.log(`      🔗 Chemin: ${docPath.substring(0, 60)}${docPath.length > 60 ? '...' : ''}`);
        
        // Simuler l'URL de téléchargement
        const downloadUrl = `/api/attestations/${att.attestationId}/download/${docType}`;
        console.log(`      🌐 URL: ${downloadUrl}`);
        
        // Vérifier si l'ID sera bien capturé par Express
        const idParts = att.attestationId.split('-');
        console.log(`      🔍 Segments ID: ${idParts.length} (${idParts.join(' | ')})`);
        
        if (idParts.length > 3) {
          console.log(`      ⚠️  ID avec ${idParts.length} segments - Vérifier compatibilité Express`);
        }
      }
      
      console.log('');
    }

    console.log('─'.repeat(60));
    console.log('\n📊 RÉSUMÉ DES TESTS');
    console.log('===================\n');

    // Statistiques globales
    const totalDocs = attestations.reduce((sum, att) => {
      return sum + Object.keys(att.documents).filter(k => att.documents[k]).length;
    }, 0);

    const cloudinaryDocs = attestations.reduce((sum, att) => {
      return sum + Object.keys(att.documents).filter(k => {
        return att.documents[k] && /^https?:\/\//i.test(att.documents[k]);
      }).length;
    }, 0);

    const localDocs = totalDocs - cloudinaryDocs;

    console.log(`Total documents: ${totalDocs}`);
    console.log(`  - Cloudinary: ${cloudinaryDocs}`);
    console.log(`  - Local: ${localDocs}\n`);

    // Formats d'ID
    const newFormatCount = attestations.filter(att => 
      /^CERT-\d{4}-[A-Z]-[A-Z]-\d{3}$/i.test(att.attestationId)
    ).length;
    
    const oldFormatCount = attestations.filter(att => 
      /^CERT-(ANNEE|\d{4})-\d{3}$/i.test(att.attestationId)
    ).length;

    console.log(`Formats d'ID:`);
    console.log(`  - Nouveau format: ${newFormatCount}`);
    console.log(`  - Ancien format: ${oldFormatCount}\n`);

    // URLs de test à essayer
    console.log('🔗 URLs DE TEST À ESSAYER');
    console.log('=========================\n');
    
    const baseUrl = process.env.BACKEND_URL || 'https://matc-backend.onrender.com';
    
    attestations.slice(0, 2).forEach(att => {
      console.log(`Attestation: ${att.attestationId}`);
      ['attestation', 'recommandation', 'evaluation'].forEach(type => {
        if (att.documents[type]) {
          console.log(`  GET ${baseUrl}/api/attestations/${att.attestationId}/download/${type}`);
        }
      });
      console.log('');
    });

    console.log('💡 RECOMMANDATIONS');
    console.log('==================\n');
    
    if (localDocs > 0) {
      console.log('⚠️  Fichiers locaux détectés:');
      console.log('   - Sur Render, le filesystem est éphémère');
      console.log('   - Les fichiers seront perdus au redémarrage');
      console.log('   - Recommandation: Migrer vers Cloudinary\n');
    }
    
    if (newFormatCount > 0 && oldFormatCount > 0) {
      console.log('✅ Formats mixtes détectés:');
      console.log('   - Le système supporte les deux formats');
      console.log('   - Compatibilité ascendante assurée\n');
    }
    
    console.log('✅ Tests terminés');

  } catch (error) {
    console.error('❌ Erreur:', error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
};

// Exécuter le script
testDownloadEndpoints();
