import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

let supabase = null;

if (!isSupabaseConfigured) {
  console.warn('⚠️ SUPABASE_URL and SUPABASE_KEY are not defined');
  console.warn('⚠️ File uploads will not work until credentials are added');
  console.warn('ℹ️ Add these environment variables in Render Dashboard:');
  console.warn('   SUPABASE_URL=https://rkdchtqalnigwdekbmeu.supabase.co');
  console.warn('   SUPABASE_KEY=your-anon-key');
  console.warn('');
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
      listBuckets: async () => ({ data: [], error: { message: 'Supabase not configured' } }),
      createBucket: async () => ({ data: null, error: { message: 'Supabase not configured' } })
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
