import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables! Please check your .env file or hosting provider's environment settings.");
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'sb-session',
      storage: window.localStorage,
      cookieOptions: {
        name: 'sb-cookie',
        lifetime: 60 * 60 * 24 * 7,
        domain: window.location.hostname,
        path: '/',
        sameSite: 'Lax',
        secure: window.location.protocol === 'https:',
      }
    }
  }
);
