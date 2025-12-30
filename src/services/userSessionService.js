import { supabase } from './supabaseClient';

export const getUserSessionFromSupabase = async (sessionId) => {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching user session:", error);
    throw error;
  }
  
  return data;
};

export const createUserSessionInSupabase = async (sessionData) => {
  const { data, error } = await supabase
    .from('user_sessions')
    .insert([{
      session_id: sessionData.session_id,
      search_count: sessionData.search_count || 0,
      first_search_date: sessionData.first_search_date,
      last_search_date: sessionData.last_search_date,
      requires_signup: sessionData.requires_signup || false
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating user session:", error);
    throw error;
  }
  
  return data;
};

export const updateUserSessionInSupabase = async (sessionId, updateData) => {
  const { data, error } = await supabase
    .from('user_sessions')
    .update({
      search_count: updateData.search_count,
      last_search_date: updateData.last_search_date,
      requires_signup: updateData.requires_signup
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user session:", error);
    throw error;
  }
  
  return data;
};