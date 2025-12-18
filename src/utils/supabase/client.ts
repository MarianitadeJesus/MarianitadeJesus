import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/config/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || supabaseConfig.url;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseConfig.anonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);