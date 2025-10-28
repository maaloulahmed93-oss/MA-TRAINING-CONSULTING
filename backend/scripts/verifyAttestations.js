import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Attestation from '../models/Attestation.js';

dotenv.config();

/**
 * Script de vérification et diagnostic des attestations
 * Vérifie la compatibilité avec les nouveaux formats d'ID
 */

const verifyAttestations = async () => {
  try {
    console.log('🔍 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // 1. Compter toutes les attestations
    const totalCount = await Attestation.countDocuments();
    const activeCount = await Attestation.countDocuments({ isActive: true });
    
    console.log('📊 STATISTIQUES GLOBALES');
    console.log('========================');
    console.log(`Total attestations: ${totalCount}`);
    console.log(`Attestations actives: ${activeCount}`);
    console.log(`Attestations inactives: ${totalCount - activeCount}\n`);

    // 2. Analyser les formats d'ID
    const allAttestations = await Attestation.find().select('attestationId fullName documents createdAt');
    
    console.log('📋 ANALYSE DES FORMATS D\'ID');
    console.log('============================');
    
    const formatStats = {
      newFormat: [], // CERT-2025-M-M-001
      oldFormat: [], // CERT-ANNEE-001
      otherFormat: []
    };
    
    const newFormatRegex = /^CERT-\d{4}-[A-Z]-[A-Z]-\d{3}$/i;
    const oldFormatRegex = /^CERT-(ANNEE|\d{4})-\d{3}$/i;
    
    allAttestations.forEach(att => {
      if (newFormatRegex.test(att.attestationId)) {
        formatStats.newFormat.push(att);
      } else if (oldFormatRegex.test(att.attestationId)) {
        formatStats.oldFormat.push(att);
      } else {
        formatStats.otherFormat.push(att);
      }
    });
    
    console.log(`✅ Nouveau format (CERT-YYYY-P-N-XXX): ${formatStats.newFormat.length}`);
    console.log(`⚠️  Ancien format (CERT-ANNEE-XXX): ${formatStats.oldFormat.length}`);
    console.log(`❌ Autre format: ${formatStats.otherFormat.length}\n`);
    
    // 3. Afficher exemples de chaque format
    if (formatStats.newFormat.length > 0) {
      console.log('📌 Exemples nouveau format:');
      formatStats.newFormat.slice(0, 3).forEach(att => {
        console.log(`   - ${att.attestationId} (${att.fullName})`);
      });
      console.log('');
    }
    
    if (formatStats.oldFormat.length > 0) {
      console.log('📌 Exemples ancien format:');
      formatStats.oldFormat.slice(0, 3).forEach(att => {
        console.log(`   - ${att.attestationId} (${att.fullName})`);
      });
      console.log('');
    }
    
    if (formatStats.otherFormat.length > 0) {
      console.log('⚠️  Formats non reconnus:');
      formatStats.otherFormat.forEach(att => {
        console.log(`   - ${att.attestationId} (${att.fullName})`);
      });
      console.log('');
    }

    // 4. Vérifier les documents disponibles
    console.log('📄 ANALYSE DES DOCUMENTS');
    console.log('========================');
    
    const docStats = {
      withAttestation: 0,
      withRecommandation: 0,
      withEvaluation: 0,
      withAllDocs: 0,
      missingAttestation: []
    };
    
    allAttestations.forEach(att => {
      const hasAttestation = !!att.documents?.attestation;
      const hasRecommandation = !!att.documents?.recommandation;
      const hasEvaluation = !!att.documents?.evaluation;
      
      if (hasAttestation) docStats.withAttestation++;
      if (hasRecommandation) docStats.withRecommandation++;
      if (hasEvaluation) docStats.withEvaluation++;
      if (hasAttestation && hasRecommandation && hasEvaluation) docStats.withAllDocs++;
      
      if (!hasAttestation) {
        docStats.missingAttestation.push(att.attestationId);
      }
    });
    
    console.log(`Avec attestation: ${docStats.withAttestation}/${totalCount}`);
    console.log(`Avec recommandation: ${docStats.withRecommandation}/${totalCount}`);
    console.log(`Avec évaluation: ${docStats.withEvaluation}/${totalCount}`);
    console.log(`Avec tous les documents: ${docStats.withAllDocs}/${totalCount}`);
    
    if (docStats.missingAttestation.length > 0) {
      console.log(`\n⚠️  Attestations sans fichier principal:`);
      docStats.missingAttestation.forEach(id => console.log(`   - ${id}`));
    }
    console.log('');

    // 5. Vérifier les chemins de fichiers
    console.log('🔗 ANALYSE DES CHEMINS DE FICHIERS');
    console.log('===================================');
    
    const pathStats = {
      cloudinary: 0,
      local: 0,
      invalid: []
    };
    
    allAttestations.forEach(att => {
      if (att.documents?.attestation) {
        const path = att.documents.attestation;
        if (/^https?:\/\//i.test(path)) {
          pathStats.cloudinary++;
        } else if (typeof path === 'string' && path.length > 0) {
          pathStats.local++;
        } else {
          pathStats.invalid.push({ id: att.attestationId, path });
        }
      }
    });
    
    console.log(`Fichiers Cloudinary (URL): ${pathStats.cloudinary}`);
    console.log(`Fichiers locaux (path): ${pathStats.local}`);
    console.log(`Chemins invalides: ${pathStats.invalid.length}`);
    
    if (pathStats.invalid.length > 0) {
      console.log(`\n⚠️  Chemins invalides détectés:`);
      pathStats.invalid.forEach(item => {
        console.log(`   - ${item.id}: ${JSON.stringify(item.path)}`);
      });
    }
    console.log('');

    // 6. Test de recherche par ID
    console.log('🔍 TEST DE RECHERCHE');
    console.log('====================');
    
    if (formatStats.newFormat.length > 0) {
      const testId = formatStats.newFormat[0].attestationId;
      console.log(`Test avec nouveau format: ${testId}`);
      
      const found = await Attestation.findOne({ attestationId: testId });
      if (found) {
        console.log(`✅ Recherche réussie`);
        console.log(`   - Nom: ${found.fullName}`);
        console.log(`   - Documents disponibles: ${Object.keys(found.documents).filter(k => found.documents[k]).join(', ')}`);
      } else {
        console.log(`❌ Recherche échouée`);
      }
      console.log('');
    }
    
    if (formatStats.oldFormat.length > 0) {
      const testId = formatStats.oldFormat[0].attestationId;
      console.log(`Test avec ancien format: ${testId}`);
      
      const found = await Attestation.findOne({ attestationId: testId });
      if (found) {
        console.log(`✅ Recherche réussie`);
        console.log(`   - Nom: ${found.fullName}`);
        console.log(`   - Documents disponibles: ${Object.keys(found.documents).filter(k => found.documents[k]).join(', ')}`);
      } else {
        console.log(`❌ Recherche échouée`);
      }
      console.log('');
    }

    // 7. Recommandations
    console.log('💡 RECOMMANDATIONS');
    console.log('==================');
    
    const recommendations = [];
    
    if (formatStats.oldFormat.length > 0) {
      recommendations.push(`⚠️  ${formatStats.oldFormat.length} attestation(s) utilisent l'ancien format. Elles restent compatibles.`);
    }
    
    if (docStats.missingAttestation.length > 0) {
      recommendations.push(`❌ ${docStats.missingAttestation.length} attestation(s) sans fichier principal. À corriger.`);
    }
    
    if (pathStats.invalid.length > 0) {
      recommendations.push(`❌ ${pathStats.invalid.length} chemin(s) de fichier invalide(s). À corriger.`);
    }
    
    if (pathStats.local > 0) {
      recommendations.push(`⚠️  ${pathStats.local} fichier(s) stocké(s) localement. Risque de perte sur Render (filesystem éphémère).`);
      recommendations.push(`   → Recommandation: Migrer vers Cloudinary pour la production.`);
    }
    
    if (recommendations.length === 0) {
      console.log('✅ Aucun problème détecté. Système prêt pour la production.');
    } else {
      recommendations.forEach(rec => console.log(rec));
    }
    
    console.log('\n✅ Vérification terminée');

  } catch (error) {
    console.error('❌ Erreur:', error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
};

// Exécuter le script
verifyAttestations();
