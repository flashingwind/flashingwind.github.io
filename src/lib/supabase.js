import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.NEXT_PUBLIC_SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  ''
).trim();

export const supabaseBucket =
  (import.meta.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? import.meta.env.VITE_SUPABASE_BUCKET ?? 'portfolio-assets').trim() ||
  'portfolio-assets';
export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabase
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
