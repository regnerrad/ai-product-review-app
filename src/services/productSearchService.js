import { supabase } from './supabaseClient';

export const saveProductSearchToSupabase = async (searchData) => {
  try {
    const { data, error } = await supabase
      .from('product_searches')
      .insert([
        {
          brand: searchData.brand,
          model: searchData.model,
          category: searchData.category,
          user_question: searchData.user_question,
          user_id: searchData.user_id,
          query: `"${searchData.brand} ${searchData.model} ${searchData.category}: ${searchData.user_question}"`,          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    
    console.log('Search saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error saving search to Supabase:', error);
    throw error;
  }
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
