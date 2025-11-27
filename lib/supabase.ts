import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if credentials are placeholder values
const isPlaceholder = supabaseUrl === 'your-project-url-here' || 
                      supabaseAnonKey === 'your-anon-key-here' ||
                      !supabaseUrl || 
                      !supabaseAnonKey;

if (isPlaceholder) {
  console.warn('⚠️ Supabase credentials not configured. Using offline mode. See SUPABASE_SETUP.md for setup instructions.');
}

// Only create client with valid credentials
export const supabase = !isPlaceholder 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !isPlaceholder && supabase !== null;
};
