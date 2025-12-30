import { supabase } from './supabaseClient';

// ... existing functions ...

export const findAffiliateLinkByBrandModel = async (brand, model) => {
  const { data, error } = await supabase
    .from('shopee_affiliates')
    .select('*')
    .eq('brand', brand)
    .eq('model', model)
    .eq('is_active', true)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error finding affiliate link:", error);
    throw error;
  }
  
  return data;
};
export const createAffiliateLinkInSupabase = async (linkData) => {
  const { data, error } = await supabase
    .from('shopee_affiliates')
    .insert(linkData)
    .select()
    .single();

  if (error) {
    console.error("Error creating affiliate link:", error);
    throw error;
  }
  
  return data;
};
