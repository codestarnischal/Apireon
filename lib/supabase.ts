import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// Lazy singletons to avoid crashing at build time when env vars are missing
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

// Client-side Supabase (uses anon key, RLS enforced)
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabase) {
      if (!supabaseUrl || !supabaseAnonKey) throw new Error('Supabase URL and Anon Key are required');
      _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return (_supabase as any)[prop];
  },
});

// Server-side Supabase (uses service role, bypasses RLS)
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabaseAdmin) {
      if (!supabaseUrl || !supabaseServiceKey) throw new Error('Supabase URL and Service Role Key are required');
      _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    }
    return (_supabaseAdmin as any)[prop];
  },
});
