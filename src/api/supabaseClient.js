import { createClient } from '@supabase/supabase-js';

// Leia as variáveis de ambiente do Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabaseClient] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configurados. ' +
      'Defina essas variáveis no seu arquivo .env.local antes de usar o Supabase.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

