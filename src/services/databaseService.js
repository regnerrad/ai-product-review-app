import { supabase } from './supabaseClient';

// User Sessions
export const userSessionService = {
  getSession: async (userId) => {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  saveSession: async (sessionData) => {
    const { data, error } = await supabase
      .from('user_sessions')
      .upsert([sessionData])
      .select();
    
    if (error) throw error;
    return data[0];
  }
};

// Product Searches
export const productSearchService = {
  saveSearch: async (searchData) => {
    const { data, error } = await supabase
      .from('product_searches')
      .insert([searchData])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  getSearches: async (userId) => {
    const { data, error } = await supabase
      .from('product_searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// Similar services for other tables...