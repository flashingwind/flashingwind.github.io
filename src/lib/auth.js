import { supabase, hasSupabase } from './supabase';

const ADMIN_USERNAME = 'flashingwind';

export function isAuthenticated() {
  return Boolean(getCurrentUser());
}

export function isAdmin() {
  const user = getCurrentUser();
  return user && user.user_metadata?.user_name === ADMIN_USERNAME;
}

export function getCurrentUser() {
  if (!hasSupabase) return null;
  return supabase.auth.getUser().then(({ data }) => data.user).catch(() => null);
}

export async function signInWithGitHub() {
  if (!hasSupabase) {
    console.warn('Supabase not configured');
    return;
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
    },
  });
  if (error) {
    console.error('GitHub sign-in failed:', error.message);
  }
}

export async function signOut() {
  if (!hasSupabase) return;
  await supabase.auth.signOut();
  window.location.reload();
}
