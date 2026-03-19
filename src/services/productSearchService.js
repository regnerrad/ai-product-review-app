import { supabase } from '../lib/supabase';

// Cache to prevent duplicate writes
const recentSearches = new Map();
const CACHE_DURATION = 3600000; // 1 hour
let writeCount = 0;
const MAX_WRITES_PER_HOUR = 400; // Leave some buffer under 500

export const saveProductSearchToSupabase = async (searchData, aiResponse) => {
  try {
    // Check if we're approaching the quota
    if (writeCount >= MAX_WRITES_PER_HOUR) {
      console.warn('Near write quota limit, skipping save');
      // Return a mock object with a temporary ID
      return {
        id: `temp_${Date.now()}`,
        ...searchData
      };
    }

    // Validate inputs
    if (!searchData.brand || !searchData.model || !searchData.user_question) {
      console.warn('Missing required search data');
      return null;
    }

    // Create a cache key
    const cacheKey = `${searchData.brand}-${searchData.model}-${searchData.user_question}`;
    
    // ALWAYS return cached if available
    if (recentSearches.has(cacheKey)) {
      console.log('Using cached search result (prevents write)');
      return recentSearches.get(cacheKey);
    }

    // Prepare the data for insertion - MATCHING YOUR TABLE SCHEMA
    const insertData = {
      brand: searchData.brand,
      model: searchData.model,
      category: searchData.category || 'general',
      user_question: searchData.user_question,
      user_id: searchData.user_id || null,
      query: searchData.user_question,
      results: aiResponse || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Try to insert
    const { data, error } = await supabase
      .from('product_searches')
      .insert([insertData])
      .select();

    if (error) {
      console.warn('Supabase insert failed, using memory cache:', error.message);
      // Create a mock object with a temporary ID
      const mockResult = {
        id: `temp_${Date.now()}`,
        ...insertData
      };
      recentSearches.set(cacheKey, mockResult);
      return mockResult;
    }

    // Successful insert - make sure we return an object with an id property
    writeCount++;
    const savedItem = data?.[0];
    if (savedItem && savedItem.id) {
      recentSearches.set(cacheKey, savedItem);
      return savedItem;
    }
    
    // Fallback if data structure is unexpected
    const fallbackItem = { id: `temp_${Date.now()}`, ...insertData };
    recentSearches.set(cacheKey, fallbackItem);
    return fallbackItem;
    
  } catch (error) {
    console.error('Error in saveProductSearchToSupabase:', error);
    // Return a mock object so the flow can continue
    return {
      id: `temp_${Date.now()}`,
      ...searchData
    };
  }
};

export const updateSearchWithResults = async (searchId, aiResponse) => {
  try {
    // CRITICAL FIX: Ensure searchId is a string and not an object
    if (!searchId) {
      console.warn('No searchId provided, skipping update');
      return null;
    }
    
    // If it's an object, try to extract id
    if (typeof searchId === 'object') {
      if (searchId.id) {
        searchId = searchId.id;
      } else {
        console.warn('SearchId is an object without id property:', searchId);
        return null;
      }
    }
    
    // Convert to string and clean
    const cleanSearchId = String(searchId).trim();
    
    // Check if it's a temp ID (starts with temp_) - skip update for temp IDs
    if (cleanSearchId.startsWith('temp_')) {
      console.log('Skipping update for temporary ID:', cleanSearchId);
      return null;
    }
    
    // Don't even try if we're near quota
    if (writeCount >= MAX_WRITES_PER_HOUR) {
      console.warn('Near write quota limit, skipping update');
      return null;
    }
    
    console.log('Updating search with ID:', cleanSearchId);

    // Update with columns that exist in your table
    const updateData = {
      results: aiResponse || {},
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('product_searches')
      .update(updateData)
      .eq('id', cleanSearchId)
      .select();

    if (error) {
      console.warn('Update failed, but continuing:', error);
      return null;
    }

    writeCount++;
    return data?.[0] || null;
  } catch (error) {
    console.warn('Update error:', error);
    return null;
  }
};

export const findSimilarCachedResults = async (brand, model, category, question) => {
  try {
    // First try exact match
    const { data: exactMatches, error: exactError } = await supabase
      .from('product_searches')
      .select('*')
      .eq('brand', brand)
      .eq('model', model)
      .eq('user_question', question)
      .order('created_at', { ascending: false })
      .limit(1);

    if (exactError) {
      console.error('Error finding similar searches:', exactError);
      return [];
    }

    if (exactMatches && exactMatches.length > 0) {
      return exactMatches;
    }

    // If no exact match, try similar questions
    const { data: similarMatches, error: similarError } = await supabase
      .from('product_searches')
      .select('*')
      .eq('brand', brand)
      .eq('model', model)
      .textSearch('user_question', question.split(' ').join(' & '), {
        config: 'english'
      })
      .order('created_at', { ascending: false })
      .limit(5);

    if (similarError) {
      console.error('Error finding similar searches:', similarError);
      return [];
    }

    return similarMatches || [];
  } catch (error) {
    console.error('Error in findSimilarCachedResults:', error);
    return [];
  }
};

export const getProductSearchesFromSupabase = async (limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('product_searches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting product searches:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProductSearchesFromSupabase:', error);
    return [];
  }
};