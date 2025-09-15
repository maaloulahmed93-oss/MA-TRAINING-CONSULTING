import mongoose from 'mongoose';
import Program from './backend/models/Program.js';
import Category from './backend/models/Category.js';

// MongoDB connection
const mongoURI = 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db?retryWrites=true&w=majority&appName=matc';

async function fixOldPrograms() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Find all programs with string categories
    const programs = await Program.find({});
    console.log(`📊 Found ${programs.length} programs to check`);

    for (const program of programs) {
      if (typeof program.category === 'string') {
        console.log(`🔄 Fixing program: ${program.title} with category: ${program.category}`);
        
        // Find or create the category
        let category = await Category.findOne({ name: program.category });
        
        if (!category) {
          console.log(`➕ Creating new category: ${program.category}`);
          category = new Category({
            name: program.category,
            description: `Auto-created category for ${program.category}`
          });
          await category.save();
        }
        
        // Update the program with the category ObjectId
        await Program.findByIdAndUpdate(program._id, {
          category: category._id
        });
        
        console.log(`✅ Updated program ${program.title} with category ID: ${category._id}`);
      }
    }
    
    console.log('🎉 All programs fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

fixOldPrograms();
