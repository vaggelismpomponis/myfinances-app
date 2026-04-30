import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.rpc('get_users');
  console.log("get_users:", data, error);
  const { data: d2, error: e2 } = await supabase.rpc('get_all_users');
  console.log("get_all_users:", d2, e2);
}
test();
