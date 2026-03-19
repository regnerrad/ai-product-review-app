import { supabase } from './supabaseClient';

export const getUserSessionFromSupabase = async (sessionId) => {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false }) // Get most recent first
    .limit(1); // Still only need the latest one for current session

  if (error) {
    console.error("Error fetching user session:", error);
    throw error;
  }
  
  return data && data.length > 0 ? data[0] : null;
};

export const createUserSessionInSupabase = async (sessionData) => {
  // First check if a session with this session_id already exists
  const { data: existing, error: checkError } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('session_id', sessionData.session_id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (checkError) {
    console.error("Error checking existing session:", checkError);
    throw checkError;
  }

  if (existing && existing.length > 0) {
    // Session exists - update it instead of creating new
    const existingSession = existing[0];
    
    const { data, error } = await supabase
      .from('user_sessions')
      .update({
        visit_count: (existingSession.visit_count || 1) + 1,
        last_visit: new Date().toISOString(),
        last_search_date: sessionData.last_search_date || new Date().toISOString(),
        search_count: sessionData.search_count || existingSession.search_count || 0,
        user_id: sessionData.user_id || existingSession.user_id, // Update if user logged in
        is_logged_in: sessionData.is_logged_in || existingSession.is_logged_in,
        requires_signup: sessionData.requires_signup || existingSession.requires_signup
      })
      .eq('id', existingSession.id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating existing session:", error);
      throw error;
    }
    
    console.log(`Updated session ${sessionData.session_id} (visit #${data.visit_count})`);
    return data;
  }

  // No existing session - create a new one
  const insertData = {
    session_id: sessionData.session_id,
    user_id: sessionData.user_id || null,
    is_logged_in: sessionData.is_logged_in || false,
    search_count: sessionData.search_count || 0,
    first_search_date: sessionData.first_search_date || new Date().toISOString(),
    last_search_date: sessionData.last_search_date || new Date().toISOString(),
    requires_signup: sessionData.requires_signup || false,
    cart_items: sessionData.cart_items || [],
    visit_count: 1,
    first_visit: new Date().toISOString(),
    last_visit: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('user_sessions')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error("Error creating user session:", error);
    throw error;
  }
  
  console.log(`Created new session ${sessionData.session_id} (first visit)`);
  return data;
};

export const updateUserSessionInSupabase = async (sessionId, updateData) => {
  const { data, error } = await supabase
    .from('user_sessions')
    .update({
      search_count: updateData.search_count,
      last_search_date: updateData.last_search_date || new Date().toISOString(),
      requires_signup: updateData.requires_signup,
      is_logged_in: updateData.is_logged_in,
      user_id: updateData.user_id,
      last_visit: new Date().toISOString() // Always update last_visit
    })
    .eq('id', sessionId)
    .select()

  if (error) {
    console.error("Error updating user session:", error);
    throw error;
  }
  
  return data;
};