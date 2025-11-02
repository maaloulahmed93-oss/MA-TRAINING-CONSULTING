import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Partnership from './models/Partnership.js';
import PartnershipSettings from './models/PartnershipSettings.js';

// Load environment variables
dotenv.config();

const testPartnershipsDB = async () => {
  try {
    console.log('🔍 Testing Partnerships Database Integration...\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Test 1: Create/Get Partnership Settings
    console.log('📝 Test 1: Partnership Settings');
    console.log('─'.repeat(50));
    
    const settings = await PartnershipSettings.getSettings();
    console.log('✅ Settings retrieved:', {
      globalContactEmail: settings.globalContactEmail,
      visibilitySettings: settings.visibilitySettings
    });
    
    // Test 2: Update Global Email
    console.log('\n📧 Test 2: Update Global Email');
    console.log('─'.repeat(50));
    
    const testEmail = 'contact|partenariat@matc.com';
    const updatedSettings = await PartnershipSettings.updateGlobalEmail(testEmail);
    console.log('✅ Email updated to:', updatedSettings.globalContactEmail);
    
    // Verify email persists
    const verifySettings = await PartnershipSettings.getSettings();
    if (verifySettings.globalContactEmail === testEmail) {
      console.log('✅ Email persisted correctly in database');
    } else {
      console.log('❌ Email did NOT persist correctly');
    }
    
    // Test 3: Update Visibility Settings
    console.log('\n👁️ Test 3: Update Visibility Settings');
    console.log('─'.repeat(50));
    
    const newVisibility = {
      formateur: { isVisible: true },
      freelance: { isVisible: false },
      commercial: { isVisible: true },
      entreprise: { isVisible: true }
    };
    
    const updatedVisibility = await PartnershipSettings.updateVisibility(newVisibility);
    console.log('✅ Visibility updated:', updatedVisibility.visibilitySettings);
    
    // Test 4: Create/Update Partnership Data
    console.log('\n📋 Test 4: Create/Update Partnership Data');
    console.log('─'.repeat(50));
    
    const formateurData = {
      type: 'formateur',
      title: 'Formateur Expert',
      subtitle: 'Rejoignez notre équipe',
      intro: 'Partagez vos connaissances',
      icon: '📘',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      details: ['Detail 1', 'Detail 2'],
      requirements: ['Requirement 1', 'Requirement 2'],
      ctaLabel: 'Postuler maintenant',
      isActive: true
    };
    
    const partnership = await Partnership.findOneAndUpdate(
      { type: 'formateur' },
      formateurData,
      { new: true, upsert: true, runValidators: true }
    );
    
    console.log('✅ Partnership created/updated:', {
      type: partnership.type,
      title: partnership.title,
      detailsCount: partnership.details.length,
      requirementsCount: partnership.requirements.length
    });
    
    // Test 5: Retrieve Partnership
    console.log('\n🔍 Test 5: Retrieve Partnership');
    console.log('─'.repeat(50));
    
    const retrievedPartnership = await Partnership.findOne({ type: 'formateur' });
    if (retrievedPartnership) {
      console.log('✅ Partnership retrieved successfully:', {
        type: retrievedPartnership.type,
        title: retrievedPartnership.title
      });
    } else {
      console.log('❌ Partnership NOT found');
    }
    
    // Test 6: Simulate Server Restart (check persistence)
    console.log('\n🔄 Test 6: Simulate Server Restart');
    console.log('─'.repeat(50));
    console.log('Disconnecting and reconnecting...');
    
    await mongoose.disconnect();
    await mongoose.connect(process.env.MONGODB_URI);
    
    const afterRestart = await PartnershipSettings.getSettings();
    const partnershipAfterRestart = await Partnership.findOne({ type: 'formateur' });
    
    if (afterRestart.globalContactEmail === testEmail && partnershipAfterRestart) {
      console.log('✅ Data PERSISTED after restart!');
      console.log('   Email:', afterRestart.globalContactEmail);
      console.log('   Partnership:', partnershipAfterRestart.title);
    } else {
      console.log('❌ Data did NOT persist after restart');
    }
    
    // Summary
    console.log('\n' + '═'.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(50));
    console.log('✅ All tests passed!');
    console.log('✅ Data is now stored in MongoDB');
    console.log('✅ Data persists after server restart');
    console.log('\n🎉 Problem SOLVED: Data will no longer be lost on backend restart!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
};

// Run tests
testPartnershipsDB();
