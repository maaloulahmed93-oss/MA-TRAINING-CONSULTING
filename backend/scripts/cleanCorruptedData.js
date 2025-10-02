import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import models
import Program from '../models/Program.js';
import ParticipantResource from '../models/ParticipantResource.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matc-training';

async function cleanCorruptedData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all programs with corrupted URLs (containing console logs)
    console.log('🔍 Finding corrupted programs...');
    const corruptedPrograms = await Program.find({
      $or: [
        { url: { $regex: /chunk-YQ5BCTVV\.js/, $options: 'i' } },
        { url: { $regex: /ParticipantFormEnhanced\.tsx/, $options: 'i' } },
        { url: { $regex: /Download the React DevTools/, $options: 'i' } },
        { url: { $regex: /console\.log/, $options: 'i' } }
      ]
    });

    console.log(`📊 Found ${corruptedPrograms.length} corrupted programs`);

    // Continue with ParticipantResources even if no corrupted programs found
    if (corruptedPrograms.length === 0) {
      console.log('✅ No corrupted programs found, checking resources...');
    }

    // Log corrupted programs for review
    corruptedPrograms.forEach((program, index) => {
      console.log(`\n🔍 Corrupted Program ${index + 1}:`);
      console.log(`   ID: ${program._id}`);
      console.log(`   Title: ${program.title}`);
      console.log(`   URL (first 100 chars): ${program.url.substring(0, 100)}...`);
    });

    // Clean corrupted programs if any found
    if (corruptedPrograms.length > 0) {
      console.log('\n🧹 Cleaning corrupted programs...');
    
    const bulkOperations = corruptedPrograms.map(program => {
      let cleanUrl = 'https://example.com'; // Default URL
      
      // Try to extract actual URL if it exists
      if (program.url.includes('https://chatgpt.com/')) {
        cleanUrl = 'https://chatgpt.com/';
      } else if (program.url.includes('https://windsurf.com/')) {
        cleanUrl = 'https://windsurf.com/';
      } else if (program.url.includes('PART-')) {
        // This seems to be a participant ID, not a URL
        cleanUrl = `https://example.com/participant/${program.url.match(/PART-\d+/)?.[0] || 'unknown'}`;
      }

      return {
        updateOne: {
          filter: { _id: program._id },
          update: {
            $set: {
              url: cleanUrl,
              description: program.description || 'Description mise à jour automatiquement',
              updatedAt: new Date()
            }
          }
        }
      };
    });

      const result = await Program.bulkWrite(bulkOperations);
      console.log(`✅ Cleaned ${result.modifiedCount} programs`);
    }

    // Clean corrupted ParticipantResources
    console.log('\n🔍 Checking for corrupted participant resources...');
    
    const corruptedResources = await ParticipantResource.find({
      $or: [
        { url: { $regex: /chunk-YQ5BCTVV\.js/, $options: 'i' } },
        { url: { $regex: /ParticipantFormEnhanced\.tsx/, $options: 'i' } },
        { url: { $regex: /Download the React DevTools/, $options: 'i' } },
        { 'dataLinks.url': { $regex: /chunk-YQ5BCTVV\.js/, $options: 'i' } },
        { 'dataLinks.url': { $regex: /ParticipantFormEnhanced\.tsx/, $options: 'i' } },
        { 'dataLinks.url': { $regex: /Download the React DevTools/, $options: 'i' } }
      ]
    });

    console.log(`📊 Found ${corruptedResources.length} corrupted participant resources`);

    if (corruptedResources.length > 0) {
      // Log corrupted resources for review
      corruptedResources.forEach((resource, index) => {
        console.log(`\n🔍 Corrupted Resource ${index + 1}:`);
        console.log(`   ID: ${resource._id}`);
        console.log(`   Participant: ${resource.participantId}`);
        console.log(`   Title: ${resource.title}`);
        if (resource.url && resource.url.includes('chunk-YQ5BCTVV')) {
          console.log(`   URL (corrupted): ${resource.url.substring(0, 100)}...`);
        }
        if (resource.dataLinks && resource.dataLinks.length > 0) {
          resource.dataLinks.forEach((link, linkIndex) => {
            if (link.url && link.url.includes('chunk-YQ5BCTVV')) {
              console.log(`   DataLink ${linkIndex + 1} (corrupted): ${link.url.substring(0, 100)}...`);
            }
          });
        }
      });

      const resourceBulkOps = corruptedResources.map(resource => {
        let cleanUrl = 'https://example.com';
        
        // Try to extract actual URL if it exists
        if (resource.url) {
          if (resource.url.includes('https://chatgpt.com/')) {
            cleanUrl = 'https://chatgpt.com/';
          } else if (resource.url.includes('https://windsurf.com/')) {
            cleanUrl = 'https://windsurf.com/';
          } else if (resource.url.includes('PART-')) {
            cleanUrl = `https://example.com/participant/${resource.url.match(/PART-\d+/)?.[0] || 'unknown'}`;
          }
        }

        // Clean dataLinks
        const cleanDataLinks = resource.dataLinks.map(link => {
          let cleanLinkUrl = link.url;
          
          if (link.url && (link.url.includes('chunk-YQ5BCTVV') || link.url.includes('ParticipantFormEnhanced'))) {
            if (link.url.includes('https://chatgpt.com/')) {
              cleanLinkUrl = 'https://chatgpt.com/';
            } else if (link.url.includes('https://windsurf.com/')) {
              cleanLinkUrl = 'https://windsurf.com/';
            } else {
              cleanLinkUrl = 'https://example.com';
            }
          }
          
          return {
            ...link,
            url: cleanLinkUrl
          };
        });

        return {
          updateOne: {
            filter: { _id: resource._id },
            update: {
              $set: {
                url: cleanUrl,
                dataLinks: cleanDataLinks,
                updatedAt: new Date()
              }
            }
          }
        };
      });

      const resourceResult = await ParticipantResource.bulkWrite(resourceBulkOps);
      console.log(`✅ Cleaned ${resourceResult.modifiedCount} participant resources`);
    }

    console.log('\n✅ Data cleaning completed successfully!');
    
  } catch (error) {
    console.error('❌ Error cleaning corrupted data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the cleaning script
cleanCorruptedData();
