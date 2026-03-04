import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseMissing = !url || !key;
export const supabase = supabaseMissing ? null : createClient(url, key);
