import mongoose from 'mongoose';
import ParticipantProject from './models/ParticipantProject.js';
import Partner from './models/Partner.js';

const MONGODB_URI = 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error);
    process.exit(1);
  }
}

// Diagnostic précis du problème projectUrl
async function diagnoseProjectUrlIssue(participantId = 'PART-177037') {
  console.log(`\n🔍 === DIAGNOSTIC PROJECTURL POUR ${participantId} ===\n`);

  try {
    // 1. Vérifier participant existe
    const participant = await Partner.findOne({ 
      partnerId: participantId, 
      type: 'participant',
      isActive: true 
    });

    if (!participant) {
      console.log(`❌ Participant ${participantId} non trouvé dans Partner collection`);
      return false;
    }

    console.log(`✅ Participant trouvé: ${participant.fullName}`);

    // 2. Vérifier projets dans ParticipantProject collection
    const projects = await ParticipantProject.find({ 
      participantId: participantId,
      isActive: true 
    });

    console.log(`📊 Projets dans MongoDB: ${projects.length}`);

    if (projects.length === 0) {
      console.log(`⚠️ Aucun projet trouvé dans ParticipantProject collection`);
      return false;
    }

    // 3. Analyser chaque projet pour projectUrl
    console.log(`\n📋 ANALYSE PROJECTURL PAR PROJET:`);
    let projectsWithUrl = 0;
    let projectsWithoutUrl = 0;

    projects.forEach((project, index) => {
      const hasUrl = !!(project.projectUrl && project.projectUrl.trim());
      console.log(`${index + 1}. "${project.title}"`);
      console.log(`   📅 Créé: ${project.createdAt}`);
      console.log(`   📅 Modifié: ${project.updatedAt}`);
      console.log(`   🔗 ProjectUrl: "${project.projectUrl || 'VIDE'}"`);
      console.log(`   ✅ A une URL: ${hasUrl ? 'OUI' : 'NON'}`);
      console.log(`   ---`);

      if (hasUrl) projectsWithUrl++;
      else projectsWithoutUrl++;
    });

    console.log(`\n📊 RÉSUMÉ:`);
    console.log(`✅ Projets avec URL: ${projectsWithUrl}`);
    console.log(`❌ Projets sans URL: ${projectsWithoutUrl}`);
    console.log(`📈 Taux de réussite: ${projects.length > 0 ? Math.round((projectsWithUrl / projects.length) * 100) : 0}%`);

    return projectsWithUrl > 0;

  } catch (error) {
    console.error('❌ Erreur diagnostic:', error);
    return false;
  }
}

// Correction ciblée des URLs manquantes
async function fixMissingProjectUrls(participantId = 'PART-177037') {
  console.log(`\n🛠️ === CORRECTION PROJECTURL POUR ${participantId} ===\n`);

  const urlMappings = {
    'nde': 'https://www.youtube.com/watch?v=P9ot-NGv2Qg',
    'تليي': 'https://chatgpt.com/c/68c6fb2a-3cd8-832e-88fe-7b081a7aaf2d',
    'بوينج': 'https://www.youtube.com/watch?v=oqo2bSoem5g',
    'cima': 'https://tv.animerco.org/'
  };

  try {
    const projects = await ParticipantProject.find({ 
      participantId: participantId,
      isActive: true 
    });

    if (projects.length === 0) {
      console.log(`⚠️ Aucun projet à corriger`);
      return false;
    }

    let correctedCount = 0;
    let skippedCount = 0;

    for (const project of projects) {
      const currentUrl = project.projectUrl?.trim();
      const titleLower = project.title.toLowerCase();
      
      // Chercher une URL correspondante
      let newUrl = null;
      for (const [key, url] of Object.entries(urlMappings)) {
        if (titleLower.includes(key.toLowerCase()) || project.title.includes(key)) {
          newUrl = url;
          break;
        }
      }

      if (newUrl && !currentUrl) {
        console.log(`🔧 Correction "${project.title}"`);
        console.log(`   Ancienne URL: "${currentUrl || 'VIDE'}"`);
        console.log(`   Nouvelle URL: "${newUrl}"`);
        
        project.projectUrl = newUrl;
        await project.save();
        
        console.log(`✅ URL mise à jour avec succès`);
        correctedCount++;
      } else if (currentUrl) {
        console.log(`⏭️ Projet "${project.title}" a déjà une URL: ${currentUrl}`);
        skippedCount++;
      } else {
        console.log(`⚠️ Pas de mapping trouvé pour "${project.title}"`);
        skippedCount++;
      }
      console.log(`   ---`);
    }

    console.log(`\n📊 RÉSULTATS CORRECTION:`);
    console.log(`✅ Projets corrigés: ${correctedCount}`);
    console.log(`⏭️ Projets ignorés: ${skippedCount}`);
    console.log(`📈 Total traité: ${correctedCount + skippedCount}`);

    return correctedCount > 0;

  } catch (error) {
    console.error('❌ Erreur correction:', error);
    return false;
  }
}

// Test de persistance après correction
async function testPersistence(participantId = 'PART-177037') {
  console.log(`\n🧪 === TEST PERSISTANCE APRÈS CORRECTION ===\n`);

  try {
    // Attendre un peu pour s'assurer que les changements sont persistés
    await new Promise(resolve => setTimeout(resolve, 1000));

    const projects = await ParticipantProject.find({ 
      participantId: participantId,
      isActive: true 
    });

    console.log(`📊 Projets récupérés: ${projects.length}`);

    const projectsWithUrl = projects.filter(p => p.projectUrl && p.projectUrl.trim());
    const projectsWithoutUrl = projects.filter(p => !p.projectUrl || !p.projectUrl.trim());

    console.log(`✅ Avec URL: ${projectsWithUrl.length}`);
    console.log(`❌ Sans URL: ${projectsWithoutUrl.length}`);

    if (projectsWithUrl.length > 0) {
      console.log(`\n🔗 URLS PERSISTÉES:`);
      projectsWithUrl.forEach((project, index) => {
        console.log(`${index + 1}. "${project.title}" → ${project.projectUrl}`);
      });
    }

    if (projectsWithoutUrl.length > 0) {
      console.log(`\n⚠️ PROJETS SANS URL:`);
      projectsWithoutUrl.forEach((project, index) => {
        console.log(`${index + 1}. "${project.title}"`);
      });
    }

    const successRate = projects.length > 0 ? Math.round((projectsWithUrl.length / projects.length) * 100) : 0;
    console.log(`\n📈 Taux de persistance: ${successRate}%`);

    return successRate >= 80; // Considérer comme succès si 80%+ ont des URLs

  } catch (error) {
    console.error('❌ Erreur test persistance:', error);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('🚀 === CORRECTIF PROJECTURL PERSISTENCE ===');
  
  await connectDB();

  const args = process.argv.slice(2);
  const command = args[0];
  const participantId = args[1] || 'PART-177037';

  switch (command) {
    case 'diagnose':
      await diagnoseProjectUrlIssue(participantId);
      break;
      
    case 'fix':
      await fixMissingProjectUrls(participantId);
      break;
      
    case 'test':
      await testPersistence(participantId);
      break;
      
    case 'full':
      console.log('🔄 Exécution complète: diagnostic → correction → test');
      const diagResult = await diagnoseProjectUrlIssue(participantId);
      if (!diagResult) {
        console.log('⚠️ Diagnostic révèle des problèmes, lancement correction...');
        await fixMissingProjectUrls(participantId);
      }
      await testPersistence(participantId);
      break;
      
    default:
      console.log('\n📖 COMMANDES DISPONIBLES:');
      console.log('  diagnose [participantId] - Diagnostiquer problème projectUrl');
      console.log('  fix [participantId]      - Corriger URLs manquantes');
      console.log('  test [participantId]     - Tester persistance');
      console.log('  full [participantId]     - Processus complet');
      console.log('\n📝 EXEMPLES:');
      console.log('  node fix-projecturl-persistence.js diagnose PART-177037');
      console.log('  node fix-projecturl-persistence.js fix PART-177037');
      console.log('  node fix-projecturl-persistence.js full PART-177037');
      break;
  }

  await mongoose.disconnect();
  console.log('\n✅ Script terminé');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
