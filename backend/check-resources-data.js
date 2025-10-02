import mongoose from 'mongoose';
import ParticipantResource from './models/ParticipantResource.js';

// MongoDB Atlas connection
const mongoURI = 'mongodb+srv://maaloulahmed93:Aa123456789@cluster0.mongodb.net/matc_db?retryWrites=true&w=majority';

async function checkResourcesData() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB Atlas');

    // Find all resources for participant PART-653876
    const resources = await ParticipantResource.find({ 
      participantId: 'PART-653876',
      isActive: true 
    }).sort({ assignedDate: -1 });

    console.log(`\n📊 Found ${resources.length} resources for PART-653876:`);
    
    resources.forEach((resource, index) => {
      console.log(`\n📋 Resource ${index + 1}:`);
      console.log(`  - ID: ${resource._id}`);
      console.log(`  - Title: ${resource.title}`);
      console.log(`  - Icon: "${resource.icon}"`);
      console.log(`  - URL: "${resource.url}"`);
      console.log(`  - Description: "${resource.description}"`);
      console.log(`  - Assigned Date: ${resource.assignedDate}`);
      console.log(`  - Is Active: ${resource.isActive}`);
    });

    // Check if any resources have URLs
    const resourcesWithUrls = resources.filter(r => r.url && r.url.trim() !== '');
    const resourcesWithoutUrls = resources.filter(r => !r.url || r.url.trim() === '');

    console.log(`\n📈 Summary:`);
    console.log(`  - Resources with URLs: ${resourcesWithUrls.length}`);
    console.log(`  - Resources without URLs: ${resourcesWithoutUrls.length}`);

    if (resourcesWithUrls.length > 0) {
      console.log(`\n✅ Resources with URLs:`);
      resourcesWithUrls.forEach(r => {
        console.log(`  - "${r.title}": ${r.url}`);
      });
    }

    if (resourcesWithoutUrls.length > 0) {
      console.log(`\n❌ Resources without URLs:`);
      resourcesWithoutUrls.forEach(r => {
        console.log(`  - "${r.title}": (empty URL)`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkResourcesData();
