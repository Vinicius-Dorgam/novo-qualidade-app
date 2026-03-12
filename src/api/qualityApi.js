import { supabase } from './supabaseClient';

const handle = async (promise) => {
  const { data, error } = await promise;
  if (error) throw error;
  return data;
};

export const qualityApi = {
  // Inspeções
  listInspecoes: () =>
    handle(
      supabase
        .from('inspecao')
        .select('*')
        .order('created_date', { ascending: false })
        .limit(500)
    ),

  listBobinasDashboard: () =>
    handle(
      supabase
        .from('bobina')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2000)
    ),

  listPlanosAcao: () =>
    handle(
      supabase
        .from('plano_acao')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)
    ),

  // Usuário autenticado (Supabase Auth)
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  createInspecao: (data) =>
    handle(
      supabase
        .from('inspecao')
        .insert({
          ...data,
          created_date: new Date().toISOString(),
        })
        .select('*')
        .single()
    ),
};

