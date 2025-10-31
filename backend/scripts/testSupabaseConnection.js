import dotenv from 'dotenv';
import supabase from '../utils/supabaseClient.js';

dotenv.config();

/**
 * Test Supabase connection and bucket access
 */

const testConnection = async () => {
  console.log('🧪 Testing Supabase Connection...\n');
  
  // Test 1: Check environment variables
  console.log('1️⃣ Checking Environment Variables:');
  console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SUPABASE_KEY: ${process.env.SUPABASE_KEY ? '✅ Set' : '❌ Missing'}`);
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.log('\n❌ Environment variables missing!');
    console.log('Add these to your .env file or Render environment:');
    console.log('   SUPABASE_URL=https://rkdchtqalnigwdekbmeu.supabase.co');
    console.log('   SUPABASE_KEY=your-anon-key');
    return;
  }
  
  console.log('\n2️⃣ Testing Bucket Access:');
  
  try {
    // List buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('❌ Failed to list buckets:', listError.message);
      return;
    }
    
    console.log(`   Found ${buckets.length} bucket(s):`);
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
    });
    
    // Check if attestations bucket exists
    const attestationsBucket = buckets.find(b => b.name === 'attestations');
    
    if (!attestationsBucket) {
      console.log('\n❌ Bucket "attestations" NOT FOUND!');
      console.log('\n📝 Create it manually:');
      console.log('1. Go to: https://supabase.com/dashboard/project/rkdchtqalnigwdekbmeu/storage/buckets');
      console.log('2. Click "New bucket"');
      console.log('3. Name: attestations');
      console.log('4. Public: YES');
      console.log('5. Click "Create"');
      return;
    }
    
    console.log('\n✅ Bucket "attestations" exists!');
    console.log(`   Public: ${attestationsBucket.public ? 'Yes' : 'No'}`);
    console.log(`   Created: ${attestationsBucket.created_at}`);
    
    // Test file list
    console.log('\n3️⃣ Testing File Operations:');
    const { data: files, error: filesError } = await supabase.storage
      .from('attestations')
      .list('', { limit: 5 });
    
    if (filesError) {
      console.log('❌ Failed to list files:', filesError.message);
      
      if (filesError.message.includes('permission')) {
        console.log('\n💡 Fix: Set bucket policies in Supabase Dashboard');
        console.log('   Storage → Policies → New Policy');
        console.log('   - Policy name: Public Read Access');
        console.log('   - Operation: SELECT');
        console.log('   - Target roles: public');
      }
      return;
    }
    
    console.log(`   ✅ Can list files (${files.length} files found)`);
    
    if (files.length > 0) {
      console.log('   Recent files:');
      files.slice(0, 3).forEach(file => {
        console.log(`   - ${file.name}`);
      });
    }
    
    console.log('\n✅ All tests passed!');
    console.log('🎉 Supabase Storage is configured correctly!');
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check Supabase credentials are correct');
    console.log('2. Verify bucket "attestations" exists');
    console.log('3. Check bucket is set to public');
    console.log('4. Verify bucket policies allow read/write');
  }
};

// Run test
testConnection()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test error:', error);
    process.exit(1);
  });
