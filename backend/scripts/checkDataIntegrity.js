import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import Program from '../models/Program.js';
import ParticipantResource from '../models/ParticipantResource.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matc-training';

async function checkDataIntegrity() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Checking data integrity...\n');

    // Check Programs
    console.log('📋 Checking Programs...');
    const totalPrograms = await Program.countDocuments();
    console.log(`   Total programs: ${totalPrograms}`);

    // Check ParticipantResources
    console.log('\n📦 Checking ParticipantResources...');
    const totalResources = await ParticipantResource.countDocuments();
    console.log(`   Total resources: ${totalResources}`);

    // Check for corrupted URLs in ParticipantResources
    const corruptedResources = await ParticipantResource.find({
      $or: [
        { url: { $regex: /chunk-YQ5BCTVV\.js/, $options: 'i' } },
        { url: { $regex: /ParticipantFormEnhanced\.tsx/, $options: 'i' } },
        { url: { $regex: /Download the React DevTools/, $options: 'i' } },
        { url: { $regex: /console\.log/, $options: 'i' } },
        { url: { $regex: /📦.*module loaded/, $options: 'i' } },
        { 'dataLinks.url': { $regex: /chunk-YQ5BCTVV\.js/, $options: 'i' } },
        { 'dataLinks.url': { $regex: /ParticipantFormEnhanced\.tsx/, $options: 'i' } },
        { 'dataLinks.url': { $regex: /Download the React DevTools/, $options: 'i' } }
      ]
    });

    console.log(`   Corrupted resources: ${corruptedResources.length}`);

    if (corruptedResources.length > 0) {
      console.log('\n⚠️  Found corrupted resources:');
      corruptedResources.forEach((resource, index) => {
        console.log(`   ${index + 1}. ${resource.title} (${resource.participantId})`);
        if (resource.url && resource.url.includes('chunk-YQ5BCTVV')) {
          console.log(`      URL: ${resource.url.substring(0, 100)}...`);
        }
        if (resource.dataLinks) {
          resource.dataLinks.forEach((link, linkIndex) => {
            if (link.url && link.url.includes('chunk-YQ5BCTVV')) {
              console.log(`      DataLink ${linkIndex + 1}: ${link.url.substring(0, 100)}...`);
            }
          });
        }
      });
      
      console.log('\n💡 Run "npm run clean-data" to fix these issues');
    } else {
      console.log('   ✅ No corrupted data found');
    }

    // Check for resources by participant
    console.log('\n👥 Resources by participant:');
    const resourcesByParticipant = await ParticipantResource.aggregate([
      { $group: { _id: '$participantId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    resourcesByParticipant.forEach((participant, index) => {
      console.log(`   ${index + 1}. ${participant._id}: ${participant.count} resources`);
    });

    // Check for resources by category
    console.log('\n📂 Resources by category:');
    const resourcesByCategory = await ParticipantResource.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    resourcesByCategory.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category._id}: ${category.count} resources`);
    });

    // Check for resources by type
    console.log('\n🏷️  Resources by type:');
    const resourcesByType = await ParticipantResource.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    resourcesByType.forEach((type, index) => {
      console.log(`   ${index + 1}. ${type._id}: ${type.count} resources`);
    });

    // Check for recent resources
    console.log('\n🕒 Recent resources (last 10):');
    const recentResources = await ParticipantResource.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title participantId createdAt category type');

    recentResources.forEach((resource, index) => {
      console.log(`   ${index + 1}. ${resource.title} (${resource.participantId}) - ${resource.createdAt.toLocaleDateString()}`);
    });

    console.log('\n✅ Data integrity check completed!');
    
  } catch (error) {
    console.error('❌ Error checking data integrity:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the integrity check
checkDataIntegrity();
