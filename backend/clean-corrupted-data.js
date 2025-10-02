import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import ParticipantResource from './models/ParticipantResource.js';

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

const cleanCorruptedData = async () => {
  console.log('🧹 Starting data cleanup...');
  
  try {
    // 1. Find resources with invalid URLs
    const invalidUrlPatterns = [
      /^PART-\d+$/,  // URLs that are participant IDs
      /windsurf\.com\/editor\/auth-success/,  // Windsurf auth URLs
      /^chunk-/,  // Chunk files
      /console\.log/,  // Console logs
      /ParticipantFormEnhanced/,  // Component names
    ];
    
    let totalCleaned = 0;
    
    for (const pattern of invalidUrlPatterns) {
      const corruptedResources = await ParticipantResource.find({
        url: { $regex: pattern }
      });
      
      console.log(`🔍 Found ${corruptedResources.length} resources with pattern: ${pattern}`);
      
      if (corruptedResources.length > 0) {
        // Delete corrupted resources
        const deleteResult = await ParticipantResource.deleteMany({
          url: { $regex: pattern }
        });
        
        console.log(`🗑️ Deleted ${deleteResult.deletedCount} corrupted resources`);
        totalCleaned += deleteResult.deletedCount;
      }
    }
    
    // 2. Remove duplicate resources (same title, participantId, and URL)
    console.log('🔍 Looking for duplicate resources...');
    
    const duplicates = await ParticipantResource.aggregate([
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
    
    console.log(`🔍 Found ${duplicates.length} groups of duplicates`);
    
    let duplicatesRemoved = 0;
    for (const duplicate of duplicates) {
      // Keep the first document, remove the rest
      const docsToRemove = duplicate.docs.slice(1);
      
      const deleteResult = await ParticipantResource.deleteMany({
        _id: { $in: docsToRemove }
      });
      
      duplicatesRemoved += deleteResult.deletedCount;
      console.log(`🗑️ Removed ${deleteResult.deletedCount} duplicates for "${duplicate._id.title}"`);
    }
    
    // 3. Fix URLs that don't have proper protocol
    console.log('🔧 Fixing URLs without proper protocol...');
    
    const resourcesWithoutProtocol = await ParticipantResource.find({
      url: { 
        $regex: /^[^h]/,  // Doesn't start with 'h' (http/https)
        $ne: ''  // Not empty
      }
    });
    
    console.log(`🔍 Found ${resourcesWithoutProtocol.length} resources without proper protocol`);
    
    let urlsFixed = 0;
    for (const resource of resourcesWithoutProtocol) {
      // Skip if URL looks like a participant ID or other invalid data
      if (resource.url.match(/^PART-\d+$/) || resource.url.includes('chunk-')) {
        continue;
      }
      
      // Add https:// if it looks like a valid domain
      if (resource.url.includes('.')) {
        const newUrl = `https://${resource.url}`;
        await ParticipantResource.updateOne(
          { _id: resource._id },
          { $set: { url: newUrl } }
        );
        console.log(`🔧 Fixed URL: "${resource.url}" → "${newUrl}"`);
        urlsFixed++;
      }
    }
    
    // 4. Summary
    console.log('\n📊 Cleanup Summary:');
    console.log(`🗑️ Corrupted resources deleted: ${totalCleaned}`);
    console.log(`🔄 Duplicate resources removed: ${duplicatesRemoved}`);
    console.log(`🔧 URLs fixed: ${urlsFixed}`);
    
    // 5. Final count
    const finalCount = await ParticipantResource.countDocuments();
    console.log(`📋 Total resources remaining: ${finalCount}`);
    
    console.log('\n✅ Data cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
};

const main = async () => {
  await connectDB();
  await cleanCorruptedData();
  await mongoose.connection.close();
  console.log('🔌 Database connection closed');
  process.exit(0);
};

main();
