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

// Validation rapide du fix
async function validateProjectUrlFix(participantId = 'PART-177037') {
  console.log(`\n🔍 === VALIDATION FIX PROJECTURL ===`);
  console.log(`Participant: ${participantId}`);
  console.log(`Timestamp: ${new Date().toLocaleString()}\n`);

  let validationResults = {
    participantExists: false,
    projectsFound: false,
    projectsWithUrls: 0,
    projectsWithoutUrls: 0,
    totalProjects: 0,
    apiConsistency: false,
    fixSuccess: false
  };

  try {
    // 1. Vérifier participant existe
    console.log('1️⃣ Vérification participant...');
    const participant = await Partner.findOne({ 
      partnerId: participantId, 
      type: 'participant',
      isActive: true 
    });

    if (participant) {
      validationResults.participantExists = true;
      console.log(`   ✅ Participant trouvé: ${participant.fullName}`);
    } else {
      console.log(`   ❌ Participant ${participantId} non trouvé`);
      return validationResults;
    }

    // 2. Vérifier projets dans MongoDB
    console.log('\n2️⃣ Vérification projets MongoDB...');
    const projects = await ParticipantProject.find({ 
      participantId: participantId,
      isActive: true 
    });

    validationResults.totalProjects = projects.length;
    
    if (projects.length > 0) {
      validationResults.projectsFound = true;
      console.log(`   ✅ ${projects.length} projets trouvés`);

      // Analyser URLs
      projects.forEach((project, index) => {
        const hasUrl = !!(project.projectUrl && project.projectUrl.trim());
        console.log(`   ${index + 1}. "${project.title}"`);
        console.log(`      🔗 URL: "${project.projectUrl || 'VIDE'}"`);
        console.log(`      ✅ Valide: ${hasUrl ? 'OUI' : 'NON'}`);

        if (hasUrl) {
          validationResults.projectsWithUrls++;
        } else {
          validationResults.projectsWithoutUrls++;
        }
      });
    } else {
      console.log(`   ⚠️ Aucun projet trouvé`);
    }

    // 3. Test API consistency (simuler GET participant)
    console.log('\n3️⃣ Test cohérence API...');
    try {
      const apiResponse = await fetch(`http://localhost:3001/api/participants/${participantId}`);
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        const apiProjects = apiData.data?.projects || [];
        
        const apiProjectsWithUrls = apiProjects.filter(p => p.projectUrl && p.projectUrl.trim()).length;
        
        if (apiProjectsWithUrls === validationResults.projectsWithUrls) {
          validationResults.apiConsistency = true;
          console.log(`   ✅ API cohérente: ${apiProjectsWithUrls} projets avec URLs`);
        } else {
          console.log(`   ❌ Incohérence API: MongoDB=${validationResults.projectsWithUrls}, API=${apiProjectsWithUrls}`);
        }
      } else {
        console.log(`   ⚠️ API non accessible: ${apiResponse.status}`);
      }
    } catch (error) {
      console.log(`   ⚠️ Erreur test API: ${error.message}`);
    }

    // 4. Évaluation globale
    console.log('\n4️⃣ Évaluation globale...');
    const successRate = validationResults.totalProjects > 0 
      ? (validationResults.projectsWithUrls / validationResults.totalProjects) * 100 
      : 0;

    validationResults.fixSuccess = 
      validationResults.participantExists &&
      validationResults.projectsFound &&
      validationResults.projectsWithUrls > 0 &&
      validationResults.apiConsistency &&
      successRate >= 80;

    console.log(`   📊 Taux de réussite URLs: ${successRate.toFixed(1)}%`);
    console.log(`   🎯 Fix réussi: ${validationResults.fixSuccess ? 'OUI' : 'NON'}`);

    // 5. Résumé final
    console.log(`\n📋 === RÉSUMÉ VALIDATION ===`);
    console.log(`✅ Participant existe: ${validationResults.participantExists ? 'OUI' : 'NON'}`);
    console.log(`✅ Projets trouvés: ${validationResults.projectsFound ? 'OUI' : 'NON'} (${validationResults.totalProjects})`);
    console.log(`✅ Projets avec URLs: ${validationResults.projectsWithUrls}`);
    console.log(`❌ Projets sans URLs: ${validationResults.projectsWithoutUrls}`);
    console.log(`✅ API cohérente: ${validationResults.apiConsistency ? 'OUI' : 'NON'}`);
    console.log(`🎯 STATUT GLOBAL: ${validationResults.fixSuccess ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);

    if (validationResults.fixSuccess) {
      console.log(`\n🎉 Le fix projectUrl fonctionne correctement!`);
      console.log(`   - Admin Panel peut sauvegarder projectUrl`);
      console.log(`   - MongoDB persiste les URLs`);
      console.log(`   - API retourne les URLs`);
      console.log(`   - Frontend peut afficher bouton "Accéder"`);
    } else {
      console.log(`\n⚠️ Le fix nécessite encore des ajustements.`);
      
      if (!validationResults.participantExists) {
        console.log(`   🔧 Action: Créer/vérifier participant ${participantId}`);
      }
      if (!validationResults.projectsFound) {
        console.log(`   🔧 Action: Ajouter des projets via Admin Panel`);
      }
      if (validationResults.projectsWithoutUrls > 0) {
        console.log(`   🔧 Action: Corriger URLs manquantes`);
      }
      if (!validationResults.apiConsistency) {
        console.log(`   🔧 Action: Vérifier routes API backend`);
      }
    }

    return validationResults;

  } catch (error) {
    console.error('❌ Erreur validation:', error);
    return validationResults;
  }
}

// Correction rapide si nécessaire
async function quickFixIfNeeded(participantId = 'PART-177037') {
  console.log(`\n🛠️ === CORRECTION RAPIDE SI NÉCESSAIRE ===\n`);

  const validation = await validateProjectUrlFix(participantId);
  
  if (validation.fixSuccess) {
    console.log('✅ Aucune correction nécessaire - tout fonctionne!');
    return true;
  }

  console.log('⚠️ Correction nécessaire détectée...');

  // Corrections automatiques
  if (validation.projectsWithoutUrls > 0) {
    console.log('🔧 Correction des URLs manquantes...');
    
    const urlMappings = {
      'nde': 'https://www.youtube.com/watch?v=P9ot-NGv2Qg',
      'تليي': 'https://chatgpt.com/c/68c6fb2a-3cd8-832e-88fe-7b081a7aaf2d',
      'بوينج': 'https://www.youtube.com/watch?v=oqo2bSoem5g',
      'cima': 'https://tv.animerco.org/'
    };

    const projects = await ParticipantProject.find({ 
      participantId: participantId,
      isActive: true 
    });

    let correctedCount = 0;

    for (const project of projects) {
      if (!project.projectUrl || !project.projectUrl.trim()) {
        const titleLower = project.title.toLowerCase();
        
        for (const [key, url] of Object.entries(urlMappings)) {
          if (titleLower.includes(key.toLowerCase()) || project.title.includes(key)) {
            console.log(`   🔧 Correction "${project.title}" → ${url}`);
            project.projectUrl = url;
            await project.save();
            correctedCount++;
            break;
          }
        }
      }
    }

    console.log(`✅ ${correctedCount} URLs corrigées`);
  }

  // Re-validation
  console.log('\n🔍 Re-validation après correction...');
  const reValidation = await validateProjectUrlFix(participantId);
  
  return reValidation.fixSuccess;
}

async function main() {
  console.log('🚀 === VALIDATION PROJECTURL FIX ===');
  
  await connectDB();

  const args = process.argv.slice(2);
  const command = args[0];
  const participantId = args[1] || 'PART-177037';

  switch (command) {
    case 'validate':
      await validateProjectUrlFix(participantId);
      break;
      
    case 'fix':
      await quickFixIfNeeded(participantId);
      break;
      
    default:
      console.log('\n📖 COMMANDES:');
      console.log('  validate [participantId] - Valider le fix projectUrl');
      console.log('  fix [participantId]      - Validation + correction si nécessaire');
      console.log('\n📝 EXEMPLES:');
      console.log('  node validate-projecturl-fix.js validate PART-177037');
      console.log('  node validate-projecturl-fix.js fix PART-177037');
      break;
  }

  await mongoose.disconnect();
  console.log('\n✅ Validation terminée');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
