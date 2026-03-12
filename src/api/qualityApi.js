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

  getUser: () =>
    handle(
      supabase
        .from('user')
        .select('*')
        .single()
    ),

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

