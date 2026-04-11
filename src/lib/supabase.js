import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

export const supabaseBucket = import.meta.env.VITE_SUPABASE_BUCKET?.trim() || 'portfolio-assets';
export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabase
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
