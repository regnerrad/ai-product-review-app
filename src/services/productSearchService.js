import { supabase } from './supabaseClient';

export const saveProductSearchToSupabase = async (searchData) => {
  // ... existing code ...
};

export const getProductSearchesFromSupabase = async (limit = 50) => {
  const { data, error } = await supabase
    .from('product_searches')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  
  return data;
};