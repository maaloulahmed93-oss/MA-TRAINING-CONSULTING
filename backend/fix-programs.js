import mongoose from 'mongoose';
import Program from './models/Program.js';
import Category from './models/Category.js';

const mongoURI = 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db?retryWrites=true&w=majority&appName=matc';

async function fixOldPrograms() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    const programs = await Program.find({});
    console.log(`📊 Found ${programs.length} programs to check`);

    for (const program of programs) {
      console.log(`🔍 Checking program: ${program.title}, category type: ${typeof program.category}, value: ${program.category}`);
      
      // Check if category is missing, undefined, or is a string
      if (!program.category || typeof program.category === 'string') {
        const categoryName = program.category || 'Technologies'; // Default fallback
        console.log(`🔄 Fixing program: ${program.title} with category: ${categoryName}`);
        
        let category = await Category.findOne({ name: categoryName });
        
        if (!category) {
          console.log(`➕ Creating new category: ${categoryName}`);
          category = new Category({
            name: categoryName,
            description: `Auto-created category for ${categoryName}`,
            isActive: true
          });
          await category.save();
          console.log(`✅ Created category with ID: ${category._id}`);
        }
        
        // Update the program
        const updatedProgram = await Program.findByIdAndUpdate(
          program._id, 
          { category: category._id },
          { new: true }
        );
        
        console.log(`✅ Updated program ${program.title} with category ID: ${category._id}`);
        console.log(`🔍 Updated program category field: ${updatedProgram.category}`);
      } else {
        console.log(`✅ Program ${program.title} already has ObjectId category: ${program.category}`);
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
