import mongoose from 'mongoose';
import ParticipantResource from './models/ParticipantResource.js';

// MongoDB Atlas connection
const mongoURI = 'mongodb+srv://maaloulahmed93:Aa123456789@cluster0.mongodb.net/matc_db?retryWrites=true&w=majority';

async function cleanupResources() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB Atlas');

    // Find all resources with problematic URLs
    const problematicResources = await ParticipantResource.find({
      $or: [
        { url: { $regex: 'chunk-YQ5BCTVV.js', $options: 'i' } },
        { url: { $regex: 'Download the React DevTools', $options: 'i' } },
        { url: { $regex: 'ParticipantFormEnhanced.tsx', $options: 'i' } },
        { url: 'PART-653876' },
        { icon: '' },
        { icon: { $exists: false } }
      ]
    });

    console.log(`\n🔍 Found ${problematicResources.length} problematic resources:`);
    
    problematicResources.forEach((resource, index) => {
      console.log(`\n📋 Resource ${index + 1}:`);
      console.log(`  - ID: ${resource._id}`);
      console.log(`  - Title: ${resource.title}`);
      console.log(`  - URL: ${resource.url ? resource.url.substring(0, 100) + '...' : 'empty'}`);
      console.log(`  - Icon: "${resource.icon}"`);
    });

    // Clean up resources
    let cleanedCount = 0;
    let deletedCount = 0;

    for (const resource of problematicResources) {
      // Delete resources with console log URLs
      if (resource.url && (
        resource.url.includes('chunk-YQ5BCTVV.js') ||
        resource.url.includes('Download the React DevTools') ||
        resource.url.includes('ParticipantFormEnhanced.tsx')
      )) {
        await ParticipantResource.deleteOne({ _id: resource._id });
        console.log(`🗑️ Deleted resource: ${resource.title} (invalid URL)`);
        deletedCount++;
      }
      // Clean resources with participant ID as URL
      else if (resource.url === 'PART-653876') {
        await ParticipantResource.deleteOne({ _id: resource._id });
        console.log(`🗑️ Deleted resource: ${resource.title} (participant ID as URL)`);
        deletedCount++;
      }
      // Fix resources with empty icons
      else if (!resource.icon || resource.icon.trim() === '') {
        await ParticipantResource.updateOne(
          { _id: resource._id },
          { $set: { icon: '📄' } }
        );
        console.log(`🔧 Fixed icon for resource: ${resource.title}`);
        cleanedCount++;
      }
    }

    console.log(`\n📊 Cleanup Summary:`);
    console.log(`  - Resources cleaned: ${cleanedCount}`);
    console.log(`  - Resources deleted: ${deletedCount}`);

    // Show remaining resources
    const remainingResources = await ParticipantResource.find({ 
      participantId: 'PART-653876',
      isActive: true 
    }).sort({ assignedDate: -1 });

    console.log(`\n✅ Remaining ${remainingResources.length} resources:`);
    remainingResources.forEach((resource, index) => {
      console.log(`\n📋 Resource ${index + 1}:`);
      console.log(`  - Title: ${resource.title}`);
      console.log(`  - Icon: "${resource.icon}"`);
      console.log(`  - URL: ${resource.url || 'empty'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

cleanupResources();
