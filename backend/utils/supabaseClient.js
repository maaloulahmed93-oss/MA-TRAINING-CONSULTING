import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ SUPABASE_URL and SUPABASE_KEY are not defined');
  console.error('⚠️ File uploads will not work until credentials are added');
  console.error('ℹ️ Add these environment variables in Render Dashboard:');
  console.error('   SUPABASE_URL=https://rkdchtqalnigwdekbmeu.supabase.co');
  console.error('   SUPABASE_KEY=your-anon-key');
  console.error('');
  console.log('⏭️ Server will continue without Supabase Storage...');
  
  // Create a mock client that throws helpful errors
  supabase = {
    storage: {
      from: () => ({
        upload: () => Promise.reject(new Error('Supabase not configured. Add SUPABASE_URL and SUPABASE_KEY to environment variables.')),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        remove: () => Promise.reject(new Error('Supabase not configured')),
        list: () => Promise.reject(new Error('Supabase not configured'))
      }),
      listBuckets: () => Promise.reject(new Error('Supabase not configured')),
      createBucket: () => Promise.reject(new Error('Supabase not configured'))
    }
  };
} else {
  // Initialize Supabase client
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    }
  });

  console.log('✅ Supabase client initialized');
  console.log(`📦 Bucket: attestations`);
  console.log(`🌐 URL: ${supabaseUrl}`);
}

export default supabase;
