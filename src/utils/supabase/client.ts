import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wdhymzxkzosiwvssuqvp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaHltenhrem9zaXd2c3N1cXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NDE5MDIsImV4cCI6MjA4MTMxNzkwMn0.NJyn7KPMfNw5P-HdfpQRrs6rkk_oV5rmBZVcXe7b9_o';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);