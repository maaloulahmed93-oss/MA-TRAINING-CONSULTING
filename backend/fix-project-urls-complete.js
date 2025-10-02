import mongoose from 'mongoose';
import ParticipantProject from './models/ParticipantProject.js';
import Partner from './models/Partner.js';

const MONGODB_URI = 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db';

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Atlas connecté');
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error);
    process.exit(1);
  }
}

async function analyzeAllProjects() {
  console.log('\n🔍 === ANALYSE COMPLÈTE DES PROJETS ===\n');

  try {
    const allProjects = await ParticipantProject.find({ isActive: true });
    console.log(`📊 Total projets actifs: ${allProjects.length}`);

    if (allProjects.length === 0) {
      console.log('⚠️ Aucun projet dans ParticipantProject collection');
      return;
    }

    const projectsWithUrl = allProjects.filter(p => p.projectUrl && p.projectUrl.trim());
    const projectsWithoutUrl = allProjects.filter(p => !p.projectUrl || !p.projectUrl.trim());

    console.log(`✅ Projets avec URL: ${projectsWithUrl.length}`);
    console.log(`❌ Projets sans URL: ${projectsWithoutUrl.length}`);

    if (projectsWithoutUrl.length > 0) {
      console.log('\n📋 PROJETS SANS URL:');
      projectsWithoutUrl.forEach((project, index) => {
        console.log(`${index + 1}. ${project.participantId} - ${project.title}`);
        console.log(`   Description: ${project.description || 'N/A'}`);
        console.log(`   Status: ${project.status}`);
        console.log(`   URL: "${project.projectUrl || 'VIDE'}"`);
        console.log('   ---');
      });
    }

    if (projectsWithUrl.length > 0) {
      console.log('\n✅ PROJETS AVEC URL:');
      projectsWithUrl.forEach((project, index) => {
        console.log(`${index + 1}. ${project.participantId} - ${project.title}`);
        console.log(`   URL: ${project.projectUrl}`);
        console.log('   ---');
      });
    }

  } catch (error) {
    console.error('❌ Erreur analyse:', error);
  }
}

async function fixSpecificProject(participantId, projectTitle, newUrl) {
  console.log(`\n🛠️ === CORRECTION PROJET ===`);
  console.log(`Participant: ${participantId}`);
  console.log(`Projet: ${projectTitle}`);
  console.log(`URL: ${newUrl}`);

  try {
    const project = await ParticipantProject.findOne({
      participantId: participantId,
      title: { $regex: projectTitle, $options: 'i' },
      isActive: true
    });

    if (!project) {
      console.log(`❌ Projet "${projectTitle}" non trouvé`);
      return false;
    }

    console.log(`📋 Projet trouvé: ${project.title}`);
    console.log(`📋 URL actuelle: "${project.projectUrl || 'VIDE'}"`);

    project.projectUrl = newUrl;
    await project.save();

    console.log(`✅ URL mise à jour: ${project.projectUrl}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur correction:', error);
    return false;
  }
}

async function fixAllKnownProjects() {
  console.log('\n🔧 === CORRECTION MASSIVE ===');

  const fixes = [
    { participantId: 'PART-177037', projectTitle: 'nde', newUrl: 'https://www.youtube.com/watch?v=P9ot-NGv2Qg' },
    { participantId: 'PART-177037', projectTitle: 'تليي', newUrl: 'https://chatgpt.com/c/68c6fb2a-3cd8-832e-88fe-7b081a7aaf2d' },
    { participantId: 'PART-177037', projectTitle: 'بوينج', newUrl: 'https://www.youtube.com/watch?v=oqo2bSoem5g' }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const fix of fixes) {
    const success = await fixSpecificProject(fix.participantId, fix.projectTitle, fix.newUrl);
    if (success) successCount++;
    else errorCount++;
  }

  console.log(`\n📊 RÉSULTATS: ✅ ${successCount} réussies, ❌ ${errorCount} échouées`);
}

async function verifyParticipant(participantId) {
  console.log(`\n🔍 === VÉRIFICATION PARTICIPANT ${participantId} ===`);

  try {
    const partner = await Partner.findOne({ 
      partnerId: participantId, 
      type: 'participant',
      isActive: true 
    });

    if (!partner) {
      console.log(`❌ Participant ${participantId} non trouvé`);
      return;
    }

    console.log(`✅ Participant: ${partner.fullName} (${partner.email})`);

    const projects = await ParticipantProject.find({ 
      participantId: participantId,
      isActive: true 
    });

    console.log(`📋 Projets: ${projects.length}`);

    projects.forEach((project, index) => {
      console.log(`\n${index + 1}. ${project.title}`);
      console.log(`   Description: ${project.description || 'N/A'}`);
      console.log(`   Status: ${project.status}`);
      console.log(`   URL: "${project.projectUrl || 'VIDE'}"`);
      console.log(`   Créé: ${project.createdAt}`);
      console.log(`   Modifié: ${project.updatedAt}`);
    });

  } catch (error) {
    console.error('❌ Erreur vérification:', error);
  }
}

async function createEmergencyFixRoute() {
  console.log('\n🚨 === CRÉATION ROUTE D\'URGENCE ===');
  
  // Cette fonction crée le code pour une route d'urgence
  const emergencyRouteCode = `
// Route d'urgence à ajouter dans backend/routes/participants.js
router.post('/fix-project-url', async (req, res) => {
  try {
    const { participantId, projectTitle, newUrl } = req.body;
    
    if (!participantId || !projectTitle || !newUrl) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants: participantId, projectTitle, newUrl requis'
      });
    }

    const project = await ParticipantProject.findOne({
      participantId: participantId,
      title: { $regex: projectTitle, $options: 'i' },
      isActive: true
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: \`Projet "\${projectTitle}" non trouvé pour \${participantId}\`
      });
    }

    const oldUrl = project.projectUrl;
    project.projectUrl = newUrl;
    await project.save();

    res.json({
      success: true,
      message: 'URL du projet mise à jour avec succès',
      data: {
        participantId,
        projectTitle: project.title,
        oldUrl: oldUrl || 'VIDE',
        newUrl: project.projectUrl
      }
    });
  } catch (error) {
    console.error('Erreur route fix-project-url:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la correction de l\\'URL',
      error: error.message
    });
  }
});
`;

  console.log('📝 Code de la route d\'urgence:');
  console.log(emergencyRouteCode);
  
  return emergencyRouteCode;
}

async function main() {
  console.log('🚀 === SCRIPT CORRECTION URLS PROJETS ===');
  
  await connectToDatabase();

  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'analyze':
      await analyzeAllProjects();
      break;
      
    case 'fix':
      if (args.length < 4) {
        console.log('Usage: node fix-project-urls-complete.js fix <participantId> <projectTitle> <newUrl>');
        break;
      }
      await fixSpecificProject(args[1], args[2], args[3]);
      break;
      
    case 'fix-all':
      await fixAllKnownProjects();
      break;
      
    case 'verify':
      if (args.length < 2) {
        console.log('Usage: node fix-project-urls-complete.js verify <participantId>');
        break;
      }
      await verifyParticipant(args[1]);
      break;
      
    case 'emergency-route':
      await createEmergencyFixRoute();
      break;
      
    default:
      console.log('\n📖 COMMANDES:');
      console.log('  analyze              - Analyser tous les projets');
      console.log('  fix <id> <title> <url> - Corriger un projet');
      console.log('  fix-all              - Corriger projets connus');
      console.log('  verify <id>          - Vérifier participant');
      console.log('  emergency-route      - Générer route d\'urgence');
      console.log('\n📝 EXEMPLES:');
      console.log('  node fix-project-urls-complete.js analyze');
      console.log('  node fix-project-urls-complete.js verify PART-177037');
      console.log('  node fix-project-urls-complete.js fix PART-177037 "nde" "https://www.youtube.com/watch?v=P9ot-NGv2Qg"');
      console.log('  node fix-project-urls-complete.js fix-all');
      break;
  }

  await mongoose.disconnect();
  console.log('\n✅ Script terminé');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
