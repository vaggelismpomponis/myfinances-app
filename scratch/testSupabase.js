import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('users').select('*').limit(5);
  console.log("USERS:", data, error);

  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*').limit(5);
  console.log("PROFILES:", profiles, pErr);
  
  const { data: sess, error: sErr } = await supabase.from('sessions').select('*').limit(5);
  console.log("SESSIONS:", sess, sErr);
}
test();
