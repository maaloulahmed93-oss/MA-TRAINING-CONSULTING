import mongoose from 'mongoose';
import ParticipantProject from './models/ParticipantProject.js';

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://ahmedmaaloul93:Maaloul123@cluster0.kcyqmhv.mongodb.net/matc-db?retryWrites=true&w=majority';

async function updateExistingProjects() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Find all projects without projectUrl
    const projectsWithoutUrl = await ParticipantProject.find({
      $or: [
        { projectUrl: { $exists: false } },
        { projectUrl: '' },
        { projectUrl: null }
      ]
    });

    console.log(`📋 Trouvé ${projectsWithoutUrl.length} projets sans URL`);

    if (projectsWithoutUrl.length === 0) {
      console.log('✅ Tous les projets ont déjà un champ projectUrl');
      return;
    }

    // Update each project
    for (let i = 0; i < projectsWithoutUrl.length; i++) {
      const project = projectsWithoutUrl[i];
      console.log(`\n🔧 Mise à jour projet ${i + 1}/${projectsWithoutUrl.length}:`);
      console.log(`  ID: ${project._id}`);
      console.log(`  Participant: ${project.participantId}`);
      console.log(`  Titre: ${project.title}`);
      
      // For the specific project "dbdc", add the YouTube URL
      if (project.title === 'dbdc' && project.participantId === 'PART-177037') {
        project.projectUrl = 'https://www.youtube.com/watch?v=wwhPciDPE5s&list=RDV4NEJel0A92Q&index=5';
        console.log(`  🔗 Ajout URL spécifique: ${project.projectUrl}`);
      } else {
        // For other projects, set empty string (will show "Détails" button)
        project.projectUrl = '';
        console.log(`  📝 Ajout champ projectUrl vide`);
      }
      
      await project.save();
      console.log(`  ✅ Projet mis à jour`);
    }

    console.log(`\n🎉 Mise à jour terminée: ${projectsWithoutUrl.length} projets mis à jour`);

    // Verify the update for the specific project
    console.log('\n🔍 Vérification du projet "dbdc":');
    const dbdcProject = await ParticipantProject.findOne({
      title: 'dbdc',
      participantId: 'PART-177037'
    });

    if (dbdcProject) {
      console.log(`✅ Projet trouvé:`);
      console.log(`  Titre: ${dbdcProject.title}`);
      console.log(`  ProjectUrl: ${dbdcProject.projectUrl || 'VIDE'}`);
      console.log(`  Status: ${dbdcProject.status}`);
    } else {
      console.log('❌ Projet "dbdc" non trouvé');
    }

    // Test API response simulation
    console.log('\n🧪 Simulation réponse API:');
    const apiResponse = await ParticipantProject.find({
      participantId: 'PART-177037',
      isActive: true
    }).sort({ createdAt: -1 });

    console.log('📊 Projets pour PART-177037:');
    apiResponse.forEach((project, index) => {
      console.log(`  ${index + 1}. ${project.title}`);
      console.log(`     URL: ${project.projectUrl || 'VIDE'}`);
      console.log(`     Status: ${project.status}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

updateExistingProjects();
