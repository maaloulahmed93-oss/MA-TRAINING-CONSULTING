import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AdminUser from '../models/AdminUser.js';

// Load environment variables
dotenv.config();

/**
 * Seed Admin Users
 * Creates default admin and moderator users
 */

const defaultUsers = [
  {
    name: 'Administrateur MATC',
    email: 'admin@matc.com',
    password: 'admin123',
    role: 'admin',
    lastLogin: new Date('2024-01-20')
  },
  {
    name: 'Modérateur Principal',
    email: 'moderator@matc.com',
    password: 'moderator123',
    role: 'moderator',
    lastLogin: new Date('2024-01-19')
  }
];

const seedAdminUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Check if users already exist
    const existingCount = await AdminUser.countDocuments();
    
    if (existingCount > 0) {
      console.log(`ℹ️ ${existingCount} admin user(s) already exist`);
      console.log('Do you want to:');
      console.log('1. Skip seeding');
      console.log('2. Add new users only');
      console.log('3. Delete all and reseed');
      
      // For now, just skip if users exist
      console.log('Skipping seed - users already exist');
      await mongoose.connection.close();
      return;
    }

    // Create default users
    console.log('\n📝 Creating default admin users...\n');
    
    for (const userData of defaultUsers) {
      try {
        const user = await AdminUser.create(userData);
        console.log(`✅ Created: ${user.name} (${user.email}) - ${user.role}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️ User already exists: ${userData.email}`);
        } else {
          console.error(`❌ Error creating ${userData.email}:`, error.message);
        }
      }
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📊 Summary:');
    const totalUsers = await AdminUser.countDocuments();
    const admins = await AdminUser.countDocuments({ role: 'admin' });
    const moderators = await AdminUser.countDocuments({ role: 'moderator' });
    
    console.log(`Total users: ${totalUsers}`);
    console.log(`Admins: ${admins}`);
    console.log(`Moderators: ${moderators}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding admin users:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedAdminUsers();
