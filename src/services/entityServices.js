import { supabase } from '../lib/supabase';

export const AppSettings = {
  async list() {
    const { data, error } = await supabase
      .from('app-settings')
      .select('*')
      .order('created_date', { ascending: false });
    
    if (error) {
      console.error('AppSettings list error:', error);
      return [];
    }
    return data || [];
  },

  async create(data) {
    const { data: result, error } = await supabase
      .from('app-settings')
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error('AppSettings create error:', error);
      throw error;
    }
    return result;
  },

  async update(id, updates) {
    const { data: result, error } = await supabase
      .from('app-settings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('AppSettings update error:', error);
      throw error;
    }
    return result;
  }
};

export const ProductSearch = {
  async list(orderBy = '-created_date', limit = 100) {
    const sortField = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
    const ascending = !orderBy.startsWith('-');
    
    const { data, error } = await supabase
      .from('product-searches')
      .select('*')
      .order(sortField, { ascending })
      .limit(limit);
    
    if (error) {
      console.error('ProductSearch list error:', error);
      return [];
    }
    return data || [];
  },

  async create(data) {
    const { data: result, error } = await supabase
      .from('product-searches')
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error('ProductSearch create error:', error);
      throw error;
    }
    return result;
  },

  async update(id, updates) {
    const { data: result, error } = await supabase
      .from('product-searches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('ProductSearch update error:', error);
      throw error;
    }
    return result;
  }
};

export const ShopeeAffiliate = {
  async list(orderBy = '-created_date') {
    const sortField = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
    const ascending = !orderBy.startsWith('-');
    
    const { data, error } = await supabase
      .from('shopee_affiliates')
      .select('*')
      .order(sortField, { ascending });
    
    if (error) {
      console.error('ShopeeAffiliate list error:', error);
      return [];
    }
    return data || [];
  },

  async create(data) {
    const { data: result, error } = await supabase
      .from('shopee_affiliates')
      .insert(data)
      .select()
      .single();
    
    if (error) {
      console.error('ShopeeAffiliate create error:', error);
      throw error;
    }
    return result;
  },

  async update(id, updates) {
    const { data: result, error } = await supabase
      .from('shopee_affiliates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('ShopeeAffiliate update error:', error);
      throw error;
    }
    return result;
  },

  async delete(id) {
    const { error } = await supabase
      .from('shopee_affiliates')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('ShopeeAffiliate delete error:', error);
      throw error;
    }
    return { success: true };
  }
};

export const UserSession = {
  async create(data) {
    try {
      const { data: result, error } = await supabase
        .from('search_sessions')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    } catch (error) {
      console.error('UserSession create error:', error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const { data: result, error } = await supabase
        .from('search_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    } catch (error) {
      console.error('UserSession update error:', error);
      throw error;
    }
  },

  async getBySessionId(sessionId) {
    try {
      const { data, error } = await supabase
        .from('search_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('UserSession getBySessionId error:', error);
      return null;
    }
  }
};

export const SearchCache = {
  async create(data) {
    try {
      const { data: result, error } = await supabase
        .from('search_cache')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    } catch (error) {
      console.error('SearchCache create error:', error);
      throw error;
    }
  },

  async findByQuestionHash(questionHash) {
    try {
      const { data, error } = await supabase
        .from('search_cache')
        .select('*')
        .eq('question_hash', questionHash)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('SearchCache findByQuestionHash error:', error);
      return null;
    }
  },

  async findSimilar(brand, model, limit = 3) {
    try {
      const { data, error } = await supabase
        .from('search_cache')
        .select('*')
        .eq('brand', brand)
        .eq('model', model)
        .order('usage_count', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('SearchCache findSimilar error:', error);
      return [];
    }
  },

  async incrementUsage(id) {
    try {
      const { data: cache } = await supabase
        .from('search_cache')
        .select('usage_count')
        .eq('id', id)
        .single();
      
      if (cache) {
        await supabase
          .from('search_cache')
          .update({ usage_count: (cache.usage_count || 0) + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error('SearchCache incrementUsage error:', error);
    }
  }
};
