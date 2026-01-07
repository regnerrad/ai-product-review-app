import { supabase } from './supabaseClient';

export const saveProductSearchToSupabase = async (searchData, aiResults = null) => {
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
          query: `${searchData.brand} ${searchData.model} ${searchData.category}: ${searchData.user_question}`,
          results: aiResults,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
    
    // RETURN JUST THE ID for updating later
    return data[0]?.id || null;
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

// Function to find similar cached searches
export const findSimilarCachedResults = async (brand, model, category, question) => {
  try {
    const { data, error } = await supabase
      .from('product_searches')
      .select('*')
      .eq('brand', brand)
      .eq('model', model)
      .eq('category', category)
      .not('results', 'is', null) // Only searches with cached results
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error finding similar searches:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error in findSimilarCachedResults:', error);
    return [];
  }
};

// NEW FUNCTION: Update existing search with AI results
export const updateSearchWithResults = async (searchId, aiResults) => {
  try {
    const { data, error } = await supabase
      .from('product_searches')
      .update({ 
        results: aiResults,
        updated_at: new Date().toISOString()
      })
      .eq('id', searchId)
      .select();

    if (error) {
      console.error('Error updating search with results:', error);
      throw error;
    }
    
    console.log('Search updated with AI results');
    return data;
  } catch (error) {
    console.error('Error in updateSearchWithResults:', error);
    throw error;
  }
};