import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import ParticipantResource from './models/ParticipantResource.js';
import ParticipantProject from './models/ParticipantProject.js';
import Partner from './models/Partner.js';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db?retryWrites=true&w=majority&appName=matc';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Atlas connecté avec succès');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

const checkDataIntegrity = async () => {
  console.log('🔍 Starting data integrity check...\n');
  
  try {
    // 1. Check Participants
    console.log('👥 PARTICIPANTS CHECK:');
    const participants = await Partner.find({ type: 'participant' });
    console.log(`📊 Total participants: ${participants.length}`);
    
    participants.forEach(participant => {
      console.log(`  - ${participant.id}: ${participant.fullName || participant.name}`);
    });
    
    // 2. Check Projects
    console.log('\n📋 PROJECTS CHECK:');
    const projects = await ParticipantProject.find({});
    console.log(`📊 Total projects: ${projects.length}`);
    
    const projectsByParticipant = {};
    const projectsWithUrls = [];
    const projectsWithoutUrls = [];
    
    projects.forEach(project => {
      if (!projectsByParticipant[project.participantId]) {
        projectsByParticipant[project.participantId] = [];
      }
      projectsByParticipant[project.participantId].push(project);
      
      if (project.projectUrl && project.projectUrl.trim()) {
        projectsWithUrls.push(project);
      } else {
        projectsWithoutUrls.push(project);
      }
    });
    
    console.log(`✅ Projects with URLs: ${projectsWithUrls.length}`);
    console.log(`❌ Projects without URLs: ${projectsWithoutUrls.length}`);
    
    Object.keys(projectsByParticipant).forEach(participantId => {
      const participantProjects = projectsByParticipant[participantId];
      const withUrls = participantProjects.filter(p => p.projectUrl && p.projectUrl.trim()).length;
      console.log(`  - ${participantId}: ${participantProjects.length} projects (${withUrls} with URLs)`);
    });
    
    // 3. Check Resources
    console.log('\n📚 RESOURCES CHECK:');
    const resources = await ParticipantResource.find({});
    console.log(`📊 Total resources: ${resources.length}`);
    
    const resourcesByParticipant = {};
    const validResources = [];
    const invalidResources = [];
    
    const invalidPatterns = [
      /^PART-\d+$/,
      /windsurf\.com\/editor\/auth-success/,
      /^chunk-/,
      /console\.log/,
      /ParticipantFormEnhanced/
    ];
    
    resources.forEach(resource => {
      if (!resourcesByParticipant[resource.participantId]) {
        resourcesByParticipant[resource.participantId] = [];
      }
      resourcesByParticipant[resource.participantId].push(resource);
      
      const isInvalid = invalidPatterns.some(pattern => 
        resource.url && resource.url.match(pattern)
      );
      
      if (isInvalid) {
        invalidResources.push(resource);
      } else {
        validResources.push(resource);
      }
    });
    
    console.log(`✅ Valid resources: ${validResources.length}`);
    console.log(`❌ Invalid resources: ${invalidResources.length}`);
    
    if (invalidResources.length > 0) {
      console.log('\n🚨 INVALID RESOURCES FOUND:');
      invalidResources.forEach(resource => {
        console.log(`  - "${resource.title}": ${resource.url}`);
      });
    }
    
    // 4. Check for duplicates
    console.log('\n🔄 DUPLICATES CHECK:');
    
    const duplicateResources = await ParticipantResource.aggregate([
      {
        $group: {
          _id: {
            participantId: '$participantId',
            title: '$title',
            url: '$url'
          },
          count: { $sum: 1 },
          docs: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    
    console.log(`🔄 Duplicate resource groups: ${duplicateResources.length}`);
    
    let totalDuplicates = 0;
    duplicateResources.forEach(duplicate => {
      const duplicateCount = duplicate.count - 1; // Subtract 1 to keep original
      totalDuplicates += duplicateCount;
      console.log(`  - "${duplicate._id.title}": ${duplicate.count} copies (${duplicateCount} duplicates)`);
    });
    
    // 5. Summary and Recommendations
    console.log('\n📊 SUMMARY:');
    console.log(`👥 Participants: ${participants.length}`);
    console.log(`📋 Projects: ${projects.length} (${projectsWithUrls.length} with URLs)`);
    console.log(`📚 Resources: ${resources.length} (${validResources.length} valid, ${invalidResources.length} invalid)`);
    console.log(`🔄 Duplicate resources: ${totalDuplicates}`);
    
    console.log('\n💡 RECOMMENDATIONS:');
    
    if (invalidResources.length > 0) {
      console.log(`🧹 Run cleanup script to remove ${invalidResources.length} invalid resources`);
    }
    
    if (totalDuplicates > 0) {
      console.log(`🔄 Run cleanup script to remove ${totalDuplicates} duplicate resources`);
    }
    
    if (projectsWithoutUrls.length > 0) {
      console.log(`🔗 ${projectsWithoutUrls.length} projects need URLs to be added`);
    }
    
    if (invalidResources.length === 0 && totalDuplicates === 0) {
      console.log('✅ Data integrity is good! No cleanup needed.');
    } else {
      console.log('\n🛠️ TO FIX ISSUES:');
      console.log('   Run: node clean-corrupted-data.js');
    }
    
  } catch (error) {
    console.error('❌ Error during integrity check:', error);
  }
};

const main = async () => {
  await connectDB();
  await checkDataIntegrity();
  await mongoose.connection.close();
  console.log('\n🔌 Database connection closed');
  process.exit(0);
};

main();
