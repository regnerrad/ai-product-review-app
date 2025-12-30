import { supabase } from './supabaseClient';

export const getCacheResultFromSupabase = async (cacheKey) => {
  const { data, error } = await supabase
    .from('search_cache')
    .select('*')
    .eq('search_key', cacheKey)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching cache:", error);
    throw error;
  }
  
  return data;
};

export const saveCacheToSupabase = async (cacheData) => {
  const { data, error } = await supabase
    .from('search_cache')
    .upsert([{
      search_key: cacheData.search_key,
      brand: cacheData.brand,
      model: cacheData.model,
      user_question: cacheData.user_question,
      question_hash: cacheData.question_hash,
      ai_prompt: cacheData.ai_prompt,
      ai_response: cacheData.ai_response,
      usage_count: cacheData.usage_count || 1,
      last_used: cacheData.last_used,
      cache_expires: cacheData.cache_expires
    }])
    .select()
    .single();

  if (error) {
    console.error("Error saving cache:", error);
    throw error;
  }
  
  return data;
};

export const updateCacheUsage = async (cacheId, updateData) => {
  const { error } = await supabase
    .from('search_cache')
    .update({
      usage_count: updateData.usage_count,
      last_used: new Date().toISOString()
    })
    .eq('id', cacheId);

  if (error) {
    console.error("Error updating cache usage:", error);
    throw error;
  }
  
  return true;
};

export const getSimilarCachedResultsFromSupabase = async (brand, model, limit = 5) => {
  const { data, error } = await supabase
    .from('search_cache')
    .select('*')
    .eq('brand', brand)
    .eq('model', model)
    .order('usage_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching similar cache results:", error);
    throw error;
  }
  
  return data;
};