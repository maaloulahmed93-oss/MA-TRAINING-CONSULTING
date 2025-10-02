import mongoose from 'mongoose';
import ParticipantProject from './models/ParticipantProject.js';

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://ahmedmaaloul93:Maaloul123@cluster0.kcyqmhv.mongodb.net/matc-db?retryWrites=true&w=majority';

async function testProjectUrl() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Find all projects
    const projects = await ParticipantProject.find({});
    console.log(`📋 Trouvé ${projects.length} projets dans la base`);

    projects.forEach((project, index) => {
      console.log(`\n📋 Projet ${index + 1}:`);
      console.log(`  ID: ${project._id}`);
      console.log(`  Participant: ${project.participantId}`);
      console.log(`  Titre: ${project.title}`);
      console.log(`  Description: ${project.description}`);
      console.log(`  Status: ${project.status}`);
      console.log(`  ProjectURL: ${project.projectUrl || 'ABSENT'}`);
      console.log(`  Files: ${project.files?.length || 0} fichiers`);
      
      if (project.files && project.files.length > 0) {
        project.files.forEach((file, fileIndex) => {
          console.log(`    Fichier ${fileIndex + 1}: ${file.name} - URL: ${file.url || 'ABSENT'}`);
        });
      }
    });

    // Test: Add projectUrl to existing project if missing
    const testProject = projects[0];
    if (testProject && !testProject.projectUrl) {
      console.log('\n🔧 Test: Ajout projectUrl au premier projet...');
      testProject.projectUrl = 'https://www.youtube.com/watch?v=wwhPciDPE5s&list=RDV4NEJel0A92Q&index=5';
      await testProject.save();
      console.log('✅ ProjectUrl ajouté avec succès');
      
      // Verify the update
      const updatedProject = await ParticipantProject.findById(testProject._id);
      console.log(`✅ Vérification: ProjectUrl = ${updatedProject.projectUrl}`);
    }

    // Test API call simulation
    console.log('\n🧪 Test simulation API call...');
    const apiProjects = await ParticipantProject.find({ 
      participantId: testProject?.participantId, 
      isActive: true 
    }).sort({ createdAt: -1 });
    
    console.log(`📊 API Response simulation:`);
    console.log(JSON.stringify(apiProjects.map(p => ({
      _id: p._id,
      title: p.title,
      description: p.description,
      status: p.status,
      projectUrl: p.projectUrl,
      files: p.files
    })), null, 2));

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

testProjectUrl();
