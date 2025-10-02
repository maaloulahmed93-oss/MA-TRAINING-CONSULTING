import mongoose from 'mongoose';
import ParticipantResource from './models/ParticipantResource.js';

// MongoDB Atlas connection
const mongoURI = 'mongodb+srv://maaloulahmed93:Aa123456789@cluster0.mongodb.net/matc_db?retryWrites=true&w=majority';

async function cleanupConsoleLogsFromUrls() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB Atlas');

    // Find all resources with console logs in URLs
    const consoleLogResources = await ParticipantResource.find({
      $or: [
        { url: { $regex: 'chunk-YQ5BCTVV.js', $options: 'i' } },
        { url: { $regex: 'Download the React DevTools', $options: 'i' } },
        { url: { $regex: 'ParticipantFormEnhanced.tsx', $options: 'i' } },
        { url: { $regex: 'ProgramManager.tsx', $options: 'i' } },
        { url: { $regex: 'CategoryManager.tsx', $options: 'i' } },
        { url: { $regex: 'partnersApiService.ts', $options: 'i' } },
        { url: { $regex: 'console.log', $options: 'i' } },
        { url: { $regex: 'fetchProgramsFromAPI', $options: 'i' } }
      ]
    });

    console.log(`\n🔍 Found ${consoleLogResources.length} resources with console logs in URLs:`);
    
    let deletedCount = 0;
    
    for (const resource of consoleLogResources) {
      console.log(`\n📋 Resource to delete:`);
      console.log(`  - ID: ${resource._id}`);
      console.log(`  - Title: ${resource.title}`);
      console.log(`  - URL Preview: ${resource.url ? resource.url.substring(0, 100) + '...' : 'empty'}`);
      
      // Delete the resource
      await ParticipantResource.deleteOne({ _id: resource._id });
      console.log(`🗑️ Deleted resource: ${resource.title}`);
      deletedCount++;
    }

    console.log(`\n📊 Cleanup Summary:`);
    console.log(`  - Resources with console logs deleted: ${deletedCount}`);

    // Show remaining clean resources
    const cleanResources = await ParticipantResource.find({ 
      participantId: 'PART-653876',
      isActive: true,
      url: { 
        $not: { 
          $regex: 'chunk-|Download the React DevTools|ParticipantFormEnhanced|ProgramManager|CategoryManager|partnersApiService|console.log|fetchProgramsFromAPI', 
          $options: 'i' 
        } 
      }
    }).sort({ assignedDate: -1 });

    console.log(`\n✅ Remaining clean resources (${cleanResources.length}):`);
    cleanResources.forEach((resource, index) => {
      console.log(`\n📋 Clean Resource ${index + 1}:`);
      console.log(`  - Title: ${resource.title}`);
      console.log(`  - Icon: "${resource.icon}"`);
      console.log(`  - URL: ${resource.url || 'empty'}`);
    });

    // Also fix any resources with empty icons
    const emptyIconResources = await ParticipantResource.find({
      participantId: 'PART-653876',
      isActive: true,
      $or: [
        { icon: '' },
        { icon: { $exists: false } }
      ]
    });

    console.log(`\n🔧 Fixing ${emptyIconResources.length} resources with empty icons...`);
    
    for (const resource of emptyIconResources) {
      await ParticipantResource.updateOne(
        { _id: resource._id },
        { $set: { icon: '📄' } }
      );
      console.log(`🔧 Fixed icon for: ${resource.title}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

cleanupConsoleLogsFromUrls();
