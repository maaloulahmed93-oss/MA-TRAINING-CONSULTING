import mongoose from 'mongoose';
import ParticipantProject from './models/ParticipantProject.js';
import Partner from './models/Partner.js';

// Configuration MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db';

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion MongoDB Atlas réussie');
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
}

async function analyzeProjectUrls() {
  console.log('\n🔍 === ANALYSE DES URLs DE PROJETS ===\n');

  try {
    // Récupérer tous les projets
    const allProjects = await ParticipantProject.find({ isActive: true });
    console.log(`📊 Total projets actifs: ${allProjects.length}`);

    if (allProjects.length === 0) {
      console.log('⚠️ Aucun projet trouvé dans la base de données');
      return;
    }

    // Analyser les URLs
    const projectsWithUrl = allProjects.filter(p => p.projectUrl && p.projectUrl.trim());
    const projectsWithoutUrl = allProjects.filter(p => !p.projectUrl || !p.projectUrl.trim());

    console.log(`✅ Projets avec URL: ${projectsWithUrl.length}`);
    console.log(`❌ Projets sans URL: ${projectsWithoutUrl.length}`);

    // Détails des projets sans URL
    if (projectsWithoutUrl.length > 0) {
      console.log('\n📋 PROJETS SANS URL:');
      projectsWithoutUrl.forEach((project, index) => {
        console.log(`${index + 1}. Participant: ${project.participantId}`);
        console.log(`   Titre: ${project.title}`);
        console.log(`   Description: ${project.description || 'N/A'}`);
        console.log(`   Status: ${project.status}`);
        console.log(`   URL: "${project.projectUrl || 'VIDE'}"`);
        console.log('   ---');
      });
    }

    // Détails des projets avec URL
    if (projectsWithUrl.length > 0) {
      console.log('\n✅ PROJETS AVEC URL:');
      projectsWithUrl.forEach((project, index) => {
        console.log(`${index + 1}. Participant: ${project.participantId}`);
        console.log(`   Titre: ${project.title}`);
        console.log(`   URL: ${project.projectUrl}`);
        console.log('   ---');
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
  }
}

async function fixSpecificProjectUrl(participantId, projectTitle, newUrl) {
  console.log(`\n🛠️ === CORRECTION URL PROJET ===`);
  console.log(`Participant: ${participantId}`);
  console.log(`Projet: ${projectTitle}`);
  console.log(`Nouvelle URL: ${newUrl}`);

  try {
    // Trouver le projet
    const project = await ParticipantProject.findOne({
      participantId: participantId,
      title: { $regex: projectTitle, $options: 'i' },
      isActive: true
    });

    if (!project) {
      console.log(`❌ Projet "${projectTitle}" non trouvé pour le participant ${participantId}`);
      return false;
    }

    console.log(`📋 Projet trouvé: ${project.title}`);
    console.log(`📋 URL actuelle: "${project.projectUrl || 'VIDE'}"`);

    // Mettre à jour l'URL
    project.projectUrl = newUrl;
    await project.save();

    console.log(`✅ URL mise à jour avec succès!`);
    console.log(`✅ Nouvelle URL: ${project.projectUrl}`);

    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    return false;
  }
}

async function fixMultipleProjectUrls(fixes) {
  console.log(`\n🔧 === CORRECTION MULTIPLE D'URLs ===`);
  console.log(`Nombre de corrections: ${fixes.length}`);

  let successCount = 0;
  let errorCount = 0;

  for (const fix of fixes) {
    console.log(`\n🔄 Correction ${successCount + errorCount + 1}/${fixes.length}`);
    const success = await fixSpecificProjectUrl(fix.participantId, fix.projectTitle, fix.newUrl);
    
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  console.log(`\n📊 === RÉSULTATS ===`);
  console.log(`✅ Corrections réussies: ${successCount}`);
  console.log(`❌ Corrections échouées: ${errorCount}`);
}

async function addMissingProjectUrls() {
  console.log('\n🆕 === AJOUT D\'URLs MANQUANTES ===');

  // Exemples d'URLs à ajouter (basé sur les images fournies)
  const urlsToAdd = [
    {
      participantId: 'PART-177037',
      projectTitle: 'nde',
      newUrl: 'https://www.youtube.com/watch?v=P9ot-NGv2Qg'
    },
    {
      participantId: 'PART-177037', 
      projectTitle: 'تليي',
      newUrl: 'https://chatgpt.com/c/68c6fb2a-3cd8-832e-88fe-7b081a7aaf2d'
    },
    {
      participantId: 'PART-177037',
      projectTitle: 'بوينج',
      newUrl: 'https://www.youtube.com/watch?v=oqo2bSoem5g'
    }
    // Ajoutez d'autres corrections ici selon vos besoins
  ];

  await fixMultipleProjectUrls(urlsToAdd);
}

async function verifyParticipantData(participantId) {
  console.log(`\n🔍 === VÉRIFICATION DONNÉES PARTICIPANT ===`);
  console.log(`Participant ID: ${participantId}`);

  try {
    // Vérifier dans Partner collection
    const partner = await Partner.findOne({ 
      partnerId: participantId, 
      type: 'participant',
      isActive: true 
    });

    if (!partner) {
      console.log(`❌ Participant ${participantId} non trouvé dans Partner collection`);
      return;
    }

    console.log(`✅ Participant trouvé: ${partner.fullName}`);
    console.log(`📧 Email: ${partner.email}`);

    // Vérifier les projets dans ParticipantProject collection
    const projects = await ParticipantProject.find({ 
      participantId: participantId,
      isActive: true 
    });

    console.log(`📋 Projets trouvés: ${projects.length}`);

    projects.forEach((project, index) => {
      console.log(`\n${index + 1}. ${project.title}`);
      console.log(`   Description: ${project.description || 'N/A'}`);
      console.log(`   Status: ${project.status}`);
      console.log(`   URL: "${project.projectUrl || 'VIDE'}"`);
      console.log(`   Formation: ${project.formationTitle || 'N/A'}`);
      console.log(`   Créé: ${project.createdAt}`);
      console.log(`   Modifié: ${project.updatedAt}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

// Fonction principale
async function main() {
  console.log('🚀 === SCRIPT DE CORRECTION DES URLs DE PROJETS ===');
  
  await connectToDatabase();

  // Récupérer les arguments de ligne de commande
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'analyze':
      await analyzeProjectUrls();
      break;
      
    case 'fix':
      if (args.length < 4) {
        console.log('Usage: node fix-project-urls.js fix <participantId> <projectTitle> <newUrl>');
        console.log('Exemple: node fix-project-urls.js fix PART-177037 "nde" "https://www.youtube.com/watch?v=P9ot-NGv2Qg"');
        break;
      }
      await fixSpecificProjectUrl(args[1], args[2], args[3]);
      break;
      
    case 'fix-all':
      await addMissingProjectUrls();
      break;
      
    case 'verify':
      if (args.length < 2) {
        console.log('Usage: node fix-project-urls.js verify <participantId>');
        console.log('Exemple: node fix-project-urls.js verify PART-177037');
        break;
      }
      await verifyParticipantData(args[1]);
      break;
      
    default:
      console.log('\n📖 COMMANDES DISPONIBLES:');
      console.log('  analyze           - Analyser tous les projets et leurs URLs');
      console.log('  fix <id> <title> <url> - Corriger l\'URL d\'un projet spécifique');
      console.log('  fix-all           - Corriger plusieurs URLs prédéfinies');
      console.log('  verify <id>       - Vérifier les données d\'un participant');
      console.log('\n📝 EXEMPLES:');
      console.log('  node fix-project-urls.js analyze');
      console.log('  node fix-project-urls.js verify PART-177037');
      console.log('  node fix-project-urls.js fix PART-177037 "nde" "https://www.youtube.com/watch?v=P9ot-NGv2Qg"');
      console.log('  node fix-project-urls.js fix-all');
      break;
  }

  await mongoose.disconnect();
  console.log('\n✅ Script terminé');
}

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
